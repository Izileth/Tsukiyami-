import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configuração do handler de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true, // Add this line
    shouldShowList: true, // Add this line
  }),
});
// Interface para customização de notificações
interface NotificationConfig {
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string; // Nome do ícone (Android)
  color?: string; // Cor da notificação (Android)
  sound?: string | boolean; // Som customizado
  badge?: number; // Badge number (iOS)
  categoryIdentifier?: string; // Categoria (iOS)
  subtitle?: string; // Subtítulo (iOS)
}

// Registrar permissões de notificações push
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }
  
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Push token:", token);

  return token;
}

// Agendar notificação simples (uma vez)
export async function schedulePushNotification(
  config: NotificationConfig,
  delayInSeconds: number = 2
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: config.title,
      body: config.body,
      data: config.data || {},
      sound: config.sound,
      badge: config.badge,
      ...(Platform.OS === "android" && {
        color: config.color || "#000000",
        // Android usa o nome do ícone do drawable
        // icon: config.icon,
      }),
      ...(Platform.OS === "ios" && {
        subtitle: config.subtitle,
        categoryIdentifier: config.categoryIdentifier,
      }),
    },
    trigger: delayInSeconds > 0 ? {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delayInSeconds,
    } : null,
  });
}

// Agendar notificação repetida
export async function scheduleRepeatingNotification(
  config: NotificationConfig,
  intervalInSeconds: number = 60
) {
  // CORREÇÃO: Para notificações repetidas, use 'repeats: true' com seconds
  await Notifications.scheduleNotificationAsync({
    content: {
      title: config.title,
      body: config.body,
      data: config.data || {},
      sound: config.sound,
      badge: config.badge,
      ...(Platform.OS === "android" && {
        color: config.color || "#000000",
      }),
      ...(Platform.OS === "ios" && {
        subtitle: config.subtitle,
        categoryIdentifier: config.categoryIdentifier,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: intervalInSeconds,
      repeats: true,
    },
  });
}

// Agendar notificação diária
export async function scheduleDailyNotification(
  config: NotificationConfig,
  hour: number = 9, // 9 AM
  minute: number = 0
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: config.title,
      body: config.body,
      data: config.data || {},
      sound: config.sound,
      badge: config.badge,
      ...(Platform.OS === "android" && {
        color: config.color || "#000000",
      }),
      ...(Platform.OS === "ios" && {
        subtitle: config.subtitle,
        categoryIdentifier: config.categoryIdentifier,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}

// Notificação imediata
export async function showImmediateNotification(config: NotificationConfig) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: config.title,
      body: config.body,
      data: config.data || {},
      sound: config.sound,
      badge: config.badge,
      ...(Platform.OS === "android" && {
        color: config.color || "#000000",
      }),
      ...(Platform.OS === "ios" && {
        subtitle: config.subtitle,
        categoryIdentifier: config.categoryIdentifier,
      }),
    },
    trigger: null, // null = imediata
  });
}

// Cancelar todas as notificações agendadas
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Cancelar notificação específica
export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Obter todas as notificações agendadas
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}