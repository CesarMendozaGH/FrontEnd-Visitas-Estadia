// // src/api/apiConfig.js
// import axios from 'axios';

// const api = axios.create({
//         baseURL: 'https://localhost:7041/api'
//     });

// // ESTA LÍNEA ES LA QUE TE FALTA (o la tienes diferente)
// export default api; 

import axios from 'axios';

// Exportamos la URL base pura para usarla en las etiquetas <img>
export const BACKEND_BASE_URL = 'https://localhost:7041';

// Configuramos Axios agregando el "/api" al final
const api = axios.create({
    baseURL: `${BACKEND_BASE_URL}/api`
});


// Este es el "Interceptor": Se ejecuta antes de cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');

        // El "chismoso" que nos dirá la verdad
        console.log("Interceptor disparado. Token a enviar:", token ? "¡SÍ HAY TOKEN!" : "VACÍO");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;