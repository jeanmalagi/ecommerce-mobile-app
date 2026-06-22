import axios from "axios";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  console.warn("EXPO_PUBLIC_API_URL is not set.");
}

export const api = axios.create({
  baseURL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});
