import axios from 'axios';

// Instancia global para no repetir la URL en cada petición
export const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Ajusta al puerto local de tu API
    headers: {
        'Content-Type': 'application/json'
    }
});