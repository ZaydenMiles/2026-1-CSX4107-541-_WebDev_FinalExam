//src/context/UseContext.jsx

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);
const TOKEN_STORAGE_KEY = "authToken";

/**
 * The login token is kept as well as the httpOnly cookie, because browsers like
 * Safari and Brave block the cookie when the frontend and backend are on different sites.
 */
function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode), the cookie still works where allowed
  }
}

// The starter keeps the context and its provider together in this file
// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedSession = useRef(false);

  /**
   * Calls the backend with the auth cookie and returns the parsed JSON.
   * Throws an Error carrying the server message and HTTP status when the request fails.
   */
  const apiFetch = useCallback(async (path, { method = "GET", body } = {}) => {
    const headers = {};
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    const token = readStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        method: method,
        credentials: "include",
        headers: headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      const error = new Error(
        "Cannot reach the server. Make sure the backend is running.",
      );
      error.status = 0;
      throw error;
    }

    const data = await response.json().catch(() => ({}));

    // The session expired or is missing, the route guards send the user to the login page
    if (response.status === 401 && path !== "/api/auth/login") {
      storeToken(null);
      setUser(null);
    }

    if (!response.ok) {
      const error = new Error(
        data.message || `Request failed with status ${response.status}`,
      );
      error.status = response.status;
      throw error;
    }
    return data;
  }, []);

  useEffect(() => {
    // StrictMode runs effects twice in development, only check the session once
    if (hasCheckedSession.current) {
      return;
    }
    hasCheckedSession.current = true;

    apiFetch("/api/user")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [apiFetch]);

  const login = useCallback(
    async (username, password) => {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { username, password },
      });
      storeToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [apiFetch],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      storeToken(null);
      setUser(null);
    }
  }, [apiFetch]);

  const value = useMemo(
    () => ({ user, isLoading, apiFetch, login, logout }),
    [user, isLoading, apiFetch, login, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
