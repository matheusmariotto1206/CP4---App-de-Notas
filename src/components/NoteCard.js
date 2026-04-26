import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useTranslation } from 'react-i18next';

export default function NoteFormModal({ visible, onClose, notaEditando }) {
  const { t } = useTranslation();
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');

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
    try {
      if (notaEditando) {
        await updateDoc(doc(db, 'notas', notaEditando.id), {
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          atualizadoEm: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'notas'), {
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          userId: auth.currentUser.uid,
          criadoEm: serverTimestamp(),
        });
      }
      onClose();
    } catch (error) {
      Alert.alert(t('erro'), error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>{notaEditando ? t('editarNota') : t('novaNota')}</Text>
          <TextInput style={styles.input} placeholder={t('titulo')} value={titulo} onChangeText={setTitulo} />
          <TextInput style={[styles.input, styles.textArea]} placeholder={t('conteudo')} value={conteudo} onChangeText={setConteudo} multiline numberOfLines={5} />
          <TouchableOpacity style={styles.botao} onPress={handleSalvar}>
            <Text style={styles.botaoTexto}>{t('salvar')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
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
