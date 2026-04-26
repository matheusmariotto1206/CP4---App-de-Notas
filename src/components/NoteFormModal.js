import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { notificarNotaCriada, prepararLocalizacao } from '../services/notifications';

export default function NoteFormModal({ visible, onClose, notaEditando }) {
  const { t } = useTranslation();
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (notaEditando) {
      setTitulo(notaEditando.titulo);
      setConteudo(notaEditando.conteudo);
    } else {
      setTitulo('');
      setConteudo('');
    }
  }, [notaEditando, visible]);

  const handleSalvar = async () => {
    if (!titulo.trim() || !conteudo.trim()) {
      Alert.alert(t('erro'), t('preenchaTituloConteudo'));
      return;
    }

    setSalvando(true);

    try {
      if (notaEditando) {
        // Editando: não mexe na localização nem dispara notificação
        await updateDoc(doc(db, 'notas', notaEditando.id), {
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          atualizadoEm: serverTimestamp(),
        });
      } else {
        // Nova nota: tenta pegar a localização atual
        let latitude = null;
        let longitude = null;

        try {
          const permitido = await prepararLocalizacao();
          if (permitido) {
            const pos = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            latitude = pos.coords.latitude;
            longitude = pos.coords.longitude;
          }
        } catch (locErr) {
          console.log('Não foi possível obter localização:', locErr);
        }

        await addDoc(collection(db, 'notas'), {
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          userId: auth.currentUser.uid,
          criadoEm: serverTimestamp(),
          latitude,
          longitude,
        });

        // Dispara a notificação só ao criar (não ao editar)
        notificarNotaCriada();
      }

      onClose();
    } catch (error) {
      Alert.alert(t('erro'), error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>{notaEditando ? t('editarNota') : t('novaNota')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('titulo')}
            value={titulo}
            onChangeText={setTitulo}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('conteudo')}
            value={conteudo}
            onChangeText={setConteudo}
            multiline
            numberOfLines={5}
          />
          <TouchableOpacity
            style={[styles.botao, salvando && { opacity: 0.6 }]}
            onPress={handleSalvar}
            disabled={salvando}
          >
            <Text style={styles.botaoTexto}>{t('salvar')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} disabled={salvando}>
            <Text style={styles.cancelar}>{t('cancelar')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  botao: { backgroundColor: '#4A90D9', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelar: { color: '#999', textAlign: 'center', fontSize: 14 },
});
