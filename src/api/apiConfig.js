// src/api/apiConfig.js
import axios from 'axios';

const api = axios.create({
        baseURL: 'https://localhost:7041/api'
    });

// ESTA LÍNEA ES LA QUE TE FALTA (o la tienes diferente)
export default api;