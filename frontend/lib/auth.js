const TOKEN_KEY = "sima_token";
const USER_KEY = "sima_user";
const REMEMBER_KEY = "sima_remember";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readFromStorages(key) {
  if (!canUseStorage()) {
    return null;
  }

  return sessionStorage.getItem(key) || localStorage.getItem(key);
}

export function saveSession({ token, user }, remember = false) {
  if (!canUseStorage()) {
    return;
  }

  clearSession();

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

export function clearSession() {
  if (!canUseStorage()) {
    return;
  }

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return readFromStorages(TOKEN_KEY);
}

export function getUser() {
  const rawUser = readFromStorages(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function isRemembered() {
  if (!canUseStorage()) {
    return false;
  }

  return localStorage.getItem(REMEMBER_KEY) === "1";
}

export function isAuthenticated() {
  return Boolean(getToken());
}
