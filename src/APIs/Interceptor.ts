import axios from 'axios';

// Create an Axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
});

// Request interceptor to add Bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("Response error:", error.response);
        if (error.response && error.response.status === 401) {
            console.log("Unauthorized! Redirecting to login...");
            // Token is invalid or expired
            localStorage.removeItem('token');
            // Optionally, redirect to login page
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export default api;