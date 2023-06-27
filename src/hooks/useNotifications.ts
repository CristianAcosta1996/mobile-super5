import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Text, View, Button, Platform, Alert } from 'react-native';
import { useGetComprasQuery } from '../store/super5/super5Api';
import { useState } from 'react';
export const useNotifications = () => {
    const { data: compras } = useGetComprasQuery();
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const [permitirNot, setPermitirNot] = useState(false);
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      
      async function sendNotificationCompraConfirmada(expoPushToken: string) {
        const message = {
          to: expoPushToken,
          sound: 'default',
          title: 'Super5 - Compra',
          body: 'Su compra ha sido confirmada!',
          data: { data: compras  }, // La info de la compra 
        };
      
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
      }
      async function sendNotificationCompraFinalizada(expoPushToken: string) {
        const message = {
          to: expoPushToken,
          sound: 'default',
          title: 'Original Title',
          body: 'And here is the body!',
          data: { someData: 'goes here' },
        };
      
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
      }
      
      async function registerForPushNotificationsAsync(): Promise<string | undefined> {
        let token: string | undefined;
        if (Device.isDevice) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
          }
          token = (await Notifications.getExpoPushTokenAsync()).data;
          console.log(token);
        } else {
          alert('Must use physical device for Push Notifications');
        }
      
        if (Platform.OS === 'android') {
          Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      
        return token;
      }
      
      const askForNotificationPermission = () => {
        Alert.alert(
          "Permisos de notificación",
          "¿Deseas recibir notificaciones?",
          [
            {
              text: "No",
              onPress: () => {
                // El usuario no desea recibir notificaciones
                setPermitirNot(false);
                console.log("No quiere recibir notificaciones")
              },
              style: "cancel",
              
            },
            {
              text: "Sí",
              onPress: () => {
                setPermitirNot(true);
                registerForPushNotificationsAsync().then((token) => setExpoPushToken(token || ''));
              },
            },
          ]
        );
      };
    return { permitirNot, expoPushToken, setExpoPushToken, askForNotificationPermission, registerForPushNotificationsAsync, sendNotificationCompraConfirmada }
}
