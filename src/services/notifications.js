import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import i18n from '../i18n/i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function configurarCanalAndroid() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificações',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }
}

export async function prepararNotificacoesLocais() {
  try {
    await configurarCanalAndroid();

    const permissaoAtual = await Notifications.getPermissionsAsync();
    if (permissaoAtual.status === 'granted') {
      return true;
    }

    const novaPermissao = await Notifications.requestPermissionsAsync();
    if (novaPermissao.status === 'granted') {
      return true;
    }

    console.log('Permissão de notificação não concedida');

    Alert.alert(
      'Notificações desativadas',
      'Para receber a mensagem de boas-vindas, ative as notificações nas configurações do aplicativo.',
      [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
      ]
    );

    return false;
  } catch (error) {
    console.log('Erro ao preparar notificações:', error);
    return false;
  }
}

export async function notificarBoasVindas() {
  try {
    const permitido = await prepararNotificacoesLocais();
    if (!permitido) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifBoasVindasTitulo'),
        body: i18n.t('notifBoasVindasCorpo'),
        sound: 'default',
      },
      trigger: null,
    });
  } catch (error) {
    console.log('Erro ao enviar notificação de boas-vindas:', error);
  }
}

export async function notificarNotaCriada() {
  try {
    const permitido = await prepararNotificacoesLocais();
    if (!permitido) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifNotaTitulo'),
        body: i18n.t('notifNotaCorpo'),
        sound: 'default',
      },
      trigger: null,
    });
  } catch (error) {
    console.log('Erro ao enviar notificação de nota:', error);
  }
}

export async function prepararLocalizacao() {
  try {
    const permissaoAtual = await Location.getForegroundPermissionsAsync();
    if (permissaoAtual.status === 'granted') {
      return true;
    }

    const novaPermissao = await Location.requestForegroundPermissionsAsync();
    if (novaPermissao.status === 'granted') {
      return true;
    }

    console.log('Permissão de localização não concedida');

    Alert.alert(
      'Localização desativada',
      'Para salvar a localização das notas, ative o acesso à localização nas configurações.',
      [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
      ]
    );

    return false;
  } catch (error) {
    console.log('Erro ao preparar localização:', error);
    return false;
  }
}
