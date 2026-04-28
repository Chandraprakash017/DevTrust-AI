import axios from 'axios';

// render pe, hum environment variables ya absolute urls use kar sakte hai
// simple rakhne ke liye, hum production check karke relative path ya render url denge
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export default api;
