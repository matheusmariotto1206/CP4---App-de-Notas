
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import NoteFormModal from '../components/NoteFormModal';

export default function HomeScreen() {
  const [notas, setNotas] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [notaEditando, setNotaEditando] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'notas'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('criadoEm', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotas(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      Alert.alert('Erro', error.message);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const notasFiltradas = notas.filter(n =>
    n.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  const handleDeletar = (id) => {
    Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja excluir esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteDoc(doc(db, 'notas', id)) },
    ]);
  };

  const handleEditar = (nota) => {
    setNotaEditando(nota);
    setModalVisible(true);
  };

  const handleNova = () => {
    setNotaEditando(null);
    setModalVisible(true);
  };

  const formatarData = (timestamp) => {
    if (!timestamp) return '';
    const data = timestamp.toDate();
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Minhas Notas</Text>
        <TouchableOpacity onPress={() => signOut(auth)}>
          <Text style={styles.sair}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar por título..."
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4A90D9" style={{ marginTop: 60 }} />
      ) : notasFiltradas.length === 0 ? (
        <Text style={styles.vazio}>
          {busca ? 'Nenhuma nota encontrada.' : 'Nenhuma nota ainda. Crie a primeira!'}
        </Text>
      ) : (
        <FlatList
          data={notasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>{item.titulo}</Text>
              <Text style={styles.cardTexto} numberOfLines={2}>{item.conteudo}</Text>
              <Text style={styles.cardData}>{formatarData(item.criadoEm)}</Text>
              <View style={styles.cardAcoes}>
                <TouchableOpacity onPress={() => handleEditar(item)}>
                  <Text style={styles.btnEditar}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletar(item.id)}>
                  <Text style={styles.btnExcluir}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleNova}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <NoteFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        notaEditando={notaEditando}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#4A90D9' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  sair: { color: '#fff', fontSize: 14 },
  buscaContainer: { padding: 10 },
  buscaInput: { backgroundColor: '#fff', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  vazio: { textAlign: 'center', marginTop: 60, color: '#999', fontSize: 16 },
  card: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 10, elevation: 2 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardTexto: { color: '#666', marginBottom: 5 },
  cardData: { color: '#aaa', fontSize: 12, marginBottom: 10 },
  cardAcoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  btnEditar: { color: '#4A90D9', fontWeight: 'bold' },
  btnExcluir: { color: '#e74c3c', fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#4A90D9', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabTexto: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
