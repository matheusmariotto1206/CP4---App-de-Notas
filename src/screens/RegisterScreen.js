import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useTranslation } from 'react-i18next';

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleRegister = async () => {
    if (!email || !senha || !confirmarSenha) {
      Alert.alert(t('erro'), t('preenchaCampos'));
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert(t('erro'), t('senhasNaoCoincidem'));
      return;
    }
    if (senha.length < 6) {
      Alert.alert(t('erro'), t('senhaMinimo'));
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      Alert.alert(t('sucesso'), t('contaCriada'));
      navigation.replace('Home');
    } catch (error) {
      Alert.alert(t('erroCadastrar'), error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{t('criarConta')}</Text>
      <TextInput style={styles.input} placeholder={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder={t('senha')} value={senha} onChangeText={setSenha} secureTextEntry />
      <TextInput style={styles.input} placeholder={t('confirmarSenha')} value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry />
      <TouchableOpacity style={styles.botao} onPress={handleRegister}>
        <Text style={styles.botaoTexto}>{t('cadastrar')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>{t('temConta')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  botao: { backgroundColor: '#4A90D9', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#4A90D9', textAlign: 'center', fontSize: 14 },
});
