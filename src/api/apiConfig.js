// src/api/apiConfig.js
import axios from 'axios';

const api = axios.create({
        baseURL: 'http://localhost:5182/api'
    });

// ESTA LÍNEA ES LA QUE TE FALTA (o la tienes diferente)
export default api;