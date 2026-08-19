import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers:{
        // 'Content-Type':'application/json',
        'Accept':'application/json'
    }
});

// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         console.error("API Error:", error.response?.data || error.message);
//         return Promise.reject(error);
//     }
// );

// Request interceptor — menyisipkan token ke setiap request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // sesuaikan key-nya, lihat catatan di bawah
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — sudah ada, tetap dipertahankan
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);

        // Opsional tapi disarankan: kalau token invalid/expired, redirect ke login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;