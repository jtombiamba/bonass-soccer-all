/**
 * Auth service: login, register, me. Uses api (axios) and stores JWT in localStorage.
 */
import { api, setTokens, clearTokens } from "./api";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export async function login(payload: LoginPayload): Promise<{ access: string; refresh: string }> {
  const { data } = await api.post<{ access: string; refresh: string }>("auth/token/", payload);
  setTokens(data.access, data.refresh);
  return data;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<User>("auth/register/", payload);
  return data;
}

export async function fetchMe(): Promise<User | null> {
  try {
    const { data } = await api.get<User>("auth/me/");
    return data;
  } catch {
    clearTokens();
    return null;
  }
}

export function logout(): void {
  clearTokens();
}
