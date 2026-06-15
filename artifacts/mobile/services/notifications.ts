import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as Notifications.NotificationBehavior),
});

let permissionGranted = false;

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Notifications.requestPermissionsAsync();
  permissionGranted = status === "granted";
  return permissionGranted;
}

export function getPermissionStatus(): boolean {
  return permissionGranted;
}

export async function scheduleWaterReminder(hour = 20, minute = 0): Promise<string> {
  if (Platform.OS === "web") return "";
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "💧 Stay Hydrated!",
      body: "You haven't logged water today. Drink a glass and track it in Ingrivio!",
      sound: true,
    },
    trigger: {
      type: "daily",
      hour,
      minute,
    } as Notifications.DailyTriggerInput,
  });
  return id;
}

export async function scheduleMealReminder(meal: "breakfast" | "lunch" | "dinner" | "snack", hour = 8, minute = 0): Promise<string> {
  if (Platform.OS === "web") return "";
  const messages: Record<string, string> = {
    breakfast: "🌅 Good morning! Log your breakfast and start the day right.",
    lunch: "🍛 Lunch time! Don't forget to log your meal in Ingrivio.",
    dinner: "🌙 Dinner is ready! Track your calories and macros.",
    snack: "🍎 Feeling snacky? Log your healthy snack to stay on track.",
  };
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Meal Reminder — ${meal.charAt(0).toUpperCase() + meal.slice(1)}`,
      body: messages[meal],
      sound: true,
    },
    trigger: {
      type: "daily",
      hour,
      minute,
    } as Notifications.DailyTriggerInput,
  });
  return id;
}

export async function scheduleWeeklyRecipeReminder(hour = 10, minute = 0): Promise<string> {
  if (Platform.OS === "web") return "";
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🍽️ Discover a New Indian Recipe",
      body: "Weekly recipe inspiration! Find something delicious to cook today.",
      sound: true,
    },
    trigger: {
      type: "weekly",
      weekday: 1,
      hour,
      minute,
    } as Notifications.WeeklyTriggerInput,
  });
  return id;
}

export async function cancelNotification(identifier: string): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  if (Platform.OS === "web") return [];
  return Notifications.getAllScheduledNotificationsAsync();
}

export async function setupDefaultReminders(): Promise<string[]> {
  const ids: string[] = [];
  if (Platform.OS === "web") return ids;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return ids;

  await cancelAllNotifications();

  ids.push(await scheduleWaterReminder(20, 0));
  ids.push(await scheduleMealReminder("breakfast", 8, 30));
  ids.push(await scheduleMealReminder("lunch", 13, 0));
  ids.push(await scheduleMealReminder("dinner", 19, 30));
  ids.push(await scheduleWeeklyRecipeReminder(10, 0));

  return ids;
}
