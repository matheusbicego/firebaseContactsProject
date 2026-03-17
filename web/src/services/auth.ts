import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./config";

export const register = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const logout = async () => {
  await signOut(auth);
};
