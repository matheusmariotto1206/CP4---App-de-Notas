import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { signOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import NoteFormModal from '../components/NoteFormModal';
import NoteDetailsModal from '../components/NoteDetailsModal';
import { useTranslation } from 'react-i18next';
import { registrarNotificacoes, notificarBoasVindas } from '../services/notifications';

export default function HomeScreen({ navigation }) {
  const { t, i18n } = useTranslation();

  const [currentLang, setCurrentLang] = useState(i18n.language || 'pt');
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [notaEditando, setNotaEditando] = useState(null);
  const [detalhesVisible, setDetalhesVisible] = useState(false);
  const [notaDetalhes, setNotaDetalhes] = useState(null);

  // 🔔 Pede permissão e dispara boas-vindas ao abrir a Home
  useEffect(() => {
    (async () => {
      try {
        const ok = await registrarNotificacoes();
        console.log('[NOTIF] permissão concedida?', ok);
        if (ok) {
          const nome = auth.currentUser?.displayName || auth.currentUser?.email || '';
          await notificarBoasVindas(nome);
          console.log('[NOTIF] boas-vindas disparada');
        }
      } catch (e) {
        console.log('[NOTIF] erro boas-vindas:', e);
      }
    })();
  }, []);

  useEffect(() => {
    const onLanguageChanged = (lng) => {
      setCurrentLang(lng || 'pt');
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, [i18n]);

  const isPortuguese = currentLang.toLowerCase().startsWith('pt');
  const flagEmoji = isPortuguese ? '🇧🇷' : '🇺🇸';
  const langLabel = isPortuguese ? 'PT' : 'EN';

  const toggleLang = async () => {
    const nextLang = isPortuguese ? 'en' : 'pt';
    try {
      await i18n.changeLanguage(nextLang);
    } catch (e) {
      console.log('Erro ao trocar idioma:', e);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'notas'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('criadoEm', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const formatarData = (timestamp) => {
    if (!timestamp?.toDate) return '';
    const locale = isPortuguese ? 'pt-BR' : 'en-US';
    return timestamp.toDate().toLocaleDateString(locale);
  };

  const excluirNota = (id) => {
    Alert.alert(
      t('confirmarExclusao'),
      t('certezaExcluir'),
      [
        { text: t('cancelar'), style: 'cancel' },
        {
          text: t('excluir'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'notas', id));
            } catch (e) {
              Alert.alert(t('erro'), e.message);
            }
          },
        },
      ]
    );
  };

  const abrirNova = () => {
    setNotaEditando(null);
    setModalVisible(true);
  };

  const abrirEdicao = (nota) => {
    setNotaEditando(nota);
    setModalVisible(true);
  };

  const abrirDetalhes = (nota) => {
    setNotaDetalhes(nota);
    setDetalhesVisible(true);
  };

  const sair = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      Alert.alert(t('erro'), e.message);
    }
  };

  const notasFiltradas = notas.filter((n) =>
    (n.titulo || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>{t('minhasNotas')}</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleLang} style={styles.langButton}>
            <Text key={currentLang} style={styles.flag}>
              {flagEmoji}
            </Text>
            <Text style={styles.langLabel}>{langLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={sair}>
            <Text style={styles.sair}>{t('sair')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.busca}
        placeholder={t('buscar')}
        value={busca}
        onChangeText={setBusca}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4A90D9"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={notasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity onPress={() => abrirDetalhes(item)} activeOpacity={0.7}>
                <Text style={styles.cardTitulo}>{item.titulo}</Text>
                <Text style={styles.cardConteudo}>{item.conteudo}</Text>
                <Text style={styles.cardData}>{formatarData(item.criadoEm)}</Text>
              </TouchableOpacity>
              <View style={styles.cardAcoes}>
                <TouchableOpacity onPress={() => abrirEdicao(item)}>
                  <Text style={styles.btnEditar}>{t('editar')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => excluirNota(item.id)}>
                  <Text style={styles.btnExcluir}>{t('excluir')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 30, color: '#888' }}>
              {notas.length === 0 ? t('nenhumaNota') : t('naoEncontrada')}
            </Text>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={abrirNova}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <NoteFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        notaEditando={notaEditando}
      />

      <NoteDetailsModal
        visible={detalhesVisible}
        onClose={() => setDetalhesVisible(false)}
        nota={notaDetalhes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15, paddingTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  flag: { fontSize: 18, marginRight: 6 },
  langLabel: { fontWeight: 'bold', color: '#333' },
  sair: { color: '#e74c3c', fontWeight: 'bold' },
  busca: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardConteudo: { color: '#555', marginVertical: 5 },
  cardData: { fontSize: 12, color: '#999', marginBottom: 10 },
  cardAcoes: { flexDirection: 'row', justifyContent: 'flex-end' },
  btnEditar: { color: '#4A90D9', fontWeight: 'bold', marginRight: 15 },
  btnExcluir: { color: '#e74c3c', fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4A90D9',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabTexto: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
