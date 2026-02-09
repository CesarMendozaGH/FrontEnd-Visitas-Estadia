import api from '../api/apiConfig';

export const espaciosService = {
    getAll: async () => {
        const response = await api.get('/Espacios');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/Espacios', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/Espacios/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/Espacios/${id}`);
        return response.data;
    }
};