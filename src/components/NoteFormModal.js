import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { notificarNotaCriada, prepararLocalizacao } from '../services/notifications';

export default function NoteFormModal({ visible, onClose, notaEditando }) {
  const { t } = useTranslation();
  const [titulo, setTitulo] = useState(notaEditando?.titulo || '');
  const [conteudo, setConteudo] = useState(notaEditando?.conteudo || '');
  const [salvando, setSalvando] = useState(false);

  React.useEffect(() => {
    setTitulo(notaEditando?.titulo || '');
    setConteudo(notaEditando?.conteudo || '');
  }, [notaEditando, visible]);

  const obterCoordenadas = async () => {
    const ok = await prepararLocalizacao();
    console.log('[LOC] prepararLocalizacao =>', ok);
    if (!ok) return { latitude: null, longitude: null };

    try {
      const atual = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
      ]).catch(async (err) => {
        console.log('[LOC] getCurrentPosition falhou:', err.message, '-> tentando lastKnown');
        return await Location.getLastKnownPositionAsync();
      });

      if (atual?.coords) {
        console.log('[LOC] coords:', atual.coords.latitude, atual.coords.longitude);
        return { latitude: atual.coords.latitude, longitude: atual.coords.longitude };
      }
      console.log('[LOC] sem coords disponíveis');
      return { latitude: null, longitude: null };
    } catch (e) {
      console.log('[LOC] erro obterCoordenadas:', e);
      return { latitude: null, longitude: null };
    }
  };

  const salvar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'Digite um título');
      return;
    }
    if (salvando) return;
    setSalvando(true);

    try {
      let dados = {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        userId: auth.currentUser.uid,
      };

      if (notaEditando?.id) {
        await updateDoc(doc(db, 'notas', notaEditando.id), dados);
      } else {
        const { latitude, longitude } = await obterCoordenadas();
        dados = {
          ...dados,
          latitude,
          longitude,
          criadoEm: serverTimestamp(),
        };
        await addDoc(collection(db, 'notas'), dados);
        await notificarNotaCriada(dados.titulo);
      }

      setTitulo('');
      setConteudo('');
      onClose();
    } catch (e) {
      console.log('[SAVE] erro:', e);
      Alert.alert('Erro', 'Não foi possível salvar a nota.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>
            {notaEditando ? 'Editar nota' : 'Nova nota'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Título"
            value={titulo}
            onChangeText={setTitulo}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Conteúdo"
            value={conteudo}
            onChangeText={setConteudo}
            multiline
          />

          <TouchableOpacity style={styles.botao} onPress={salvar} disabled={salvando}>
            <Text style={styles.botaoTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelar}>Cancelar</Text>
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
