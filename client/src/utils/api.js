import axios from 'axios';

// On Render, we can use environment variables or absolute URLs.
// For simplicity, we'll check if we are in production and use the relative path or provide the Render URL.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export default api;
