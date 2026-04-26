import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

// Handler de notificações em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Pede permissão de notificações.
 * Chame UMA VEZ no início do app (ex: dentro de useEffect no App.js).
 */
export async function registrarNotificacoes() {
  try {
    // Canal Android (precisa existir antes de qualquer notificação no Android 8+)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90D9',
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    console.log('[NOTIF] permissão atual:', existing);

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('[NOTIF] permissão após request:', status);
    }

    if (finalStatus !== 'granted') {
      console.log('[NOTIF] permissão negada');
      return false;
    }

    return true;
  } catch (e) {
    console.log('[NOTIF] erro registrar:', e);
    return false;
  }
}

/**
 * Notificação de boas-vindas (dispara ao abrir o app)
 */
export async function notificarBoasVindas(nome) {
  try {
    const ok = await registrarNotificacoes();
    if (!ok) {
      console.log('[NOTIF] boas-vindas cancelada (sem permissão)');
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bem-vindo de volta! 👋',
        body: nome ? `Olá, ${nome}!` : 'Que bom te ver por aqui novamente.',
      },
      trigger: null,
    });
    console.log('[NOTIF] boas-vindas disparada');
  } catch (e) {
    console.log('[NOTIF] erro boas-vindas:', e);
  }
}

/**
 * Dispara notificação local quando a nota é criada
 */
export async function notificarNotaCriada(titulo) {
  try {
    const ok = await registrarNotificacoes();
    if (!ok) {
      console.log('[NOTIF] nota criada — sem permissão, não notifica');
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Nota criada ✅',
        body: titulo || 'Sua nota foi salva com sucesso',
      },
      trigger: null,
    });
    console.log('[NOTIF] nota criada disparada');
  } catch (e) {
    console.log('[NOTIF] erro disparar nota:', e);
  }
}

/**
 * Garante permissão + GPS ligado pra capturar coordenadas
 */
export async function prepararLocalizacao() {
  try {
    const servicoAtivo = await Location.hasServicesEnabledAsync();
    if (!servicoAtivo) {
      Alert.alert('GPS desligado', 'Ative a localização do aparelho para salvar o local da nota.');
      console.log('[LOC] GPS do aparelho desligado');
      return false;
    }

    let { status } = await Location.getForegroundPermissionsAsync();
    console.log('[LOC] permissão atual:', status);

    if (status !== 'granted') {
      const req = await Location.requestForegroundPermissionsAsync();
      status = req.status;
      console.log('[LOC] permissão após request:', status);
    }

    if (status !== 'granted') {
      Alert.alert(
        'Localização desativada',
        'Para salvar a localização das notas, ative o acesso à localização nas configurações.',
        [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.log('[LOC] erro prepararLocalizacao:', error);
    return false;
  }
}
