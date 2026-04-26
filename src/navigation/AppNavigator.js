import { Alert } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { notificarBoasVindas, prepararLocalizacao, prepararNotificacoesLocais } from '../services/notifications';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const usuarioAnteriorRef = useRef(null);
  const permissoesPreparadasRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      const eraDeslogado = usuarioAnteriorRef.current === null;
      const agoraEstaLogado = usuario !== null;

      setUser(usuario);
      setLoading(false);

      // Só dispara boas-vindas se foi LOGIN REAL (transição null -> user)
      if (eraDeslogado && agoraEstaLogado && !permissoesPreparadasRef.current) {
        permissoesPreparadasRef.current = true;

        // Prepara permissões em sequência (notificação + localização)
        await prepararNotificacoesLocais();
        await prepararLocalizacao();

        // Boas-vindas
        Alert.alert('Bem-vindo!', 'Login realizado com sucesso.');
        await notificarBoasVindas();
      }

      // Reset ao deslogar
      if (!usuario) {
        permissoesPreparadasRef.current = false;
      }

      usuarioAnteriorRef.current = usuario;
    });

    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
