import axios from 'axios';

// Same-origin '/api' works both in production (Express serves the built
// frontend and the API from one origin) and in dev (Vite proxies '/api'
// to the backend — see vite.config.js).
const api = axios.create({
  baseURL: '/api'
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
