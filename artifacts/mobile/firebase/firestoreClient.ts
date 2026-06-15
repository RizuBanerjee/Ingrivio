import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import type { QuerySnapshot, DocumentData } from "firebase/firestore";
import { app } from "./config";
import type { UserProfile, DailyLog, Recipe } from "@/contexts/AppContext";

const db = getFirestore(app);

export { db };
export type { QuerySnapshot, DocumentData };

function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export async function syncUserProfile(userId: string, profile: UserProfile): Promise<void> {
  const ref = doc(db, "users", userId, "profile", "main");
  await setDoc(ref, profile, { merge: true });
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", userId, "profile", "main");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function syncDailyLog(userId: string, log: DailyLog): Promise<void> {
  const ref = doc(db, "users", userId, "logs", log.date);
  await setDoc(ref, log);
}

export async function fetchDailyLog(userId: string, date: string): Promise<DailyLog | null> {
  const ref = doc(db, "users", userId, "logs", date);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as DailyLog;
}

export async function syncSavedRecipes(userId: string, recipes: Recipe[]): Promise<void> {
  const ref = doc(db, "users", userId, "recipes", "saved");
  await setDoc(ref, { recipes, updatedAt: Timestamp.now() });
}

export async function fetchSavedRecipes(userId: string): Promise<Recipe[] | null> {
  const ref = doc(db, "users", userId, "recipes", "saved");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return (data.recipes as Recipe[]) || null;
}

export async function syncGeneratedRecipes(userId: string, recipes: Recipe[]): Promise<void> {
  const ref = doc(db, "users", userId, "recipes", "generated");
  await setDoc(ref, { recipes, updatedAt: Timestamp.now() });
}

export async function fetchGeneratedRecipes(userId: string): Promise<Recipe[] | null> {
  const ref = doc(db, "users", userId, "recipes", "generated");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return (data.recipes as Recipe[]) || null;
}
