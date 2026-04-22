import axios from 'axios';

// Yeh automatically detect karega ki app local computer pe chal raha hai ya internet (live) par
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5002`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;