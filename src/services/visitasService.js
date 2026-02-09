import api from '../api/apiConfig';

export const visitasService = {
    // 1. Obtener historial (GET)
    getAll: async () => {
        const response = await api.get('/Visitas');
        return response.data;
    },

    // 2. Registrar entrada manual (POST)
    create: async (data) => {
        const now = new Date();

        // El backend espera camelCase (como swagger muestra)
        const payload = {
            idBitacoraVisitas: 0,
            idBitacoraGeneral: 0,
            nombreVisitante: data.nombreVisitante,
            motivoVisita: data.motivoVisita,
            fechaVisita: now.toISOString().split('T')[0],
            horaEntrada: now.toTimeString().split(' ')[0].substring(0, 8),
            horaSalida: null,
            aceptoTerminos: data.aceptoTerminos || true,
            createdAt: now.toISOString()
        };

        console.log(payload.motivoVisita);
        console.log('Enviando payload:', JSON.stringify(payload, null, 2));
        try {
            const response = await api.post('/Visitas', payload);
            return response.data;
        } catch (error) {
            console.error('Error completo:', error.response?.data || error.message);
            throw error;
        }
    },

    // 3. Registrar Salida (PUT)
    marcarSalida: async (id) => {
        const response = await api.put(`/Visitas/${id}/salida`);
        return response.data;
    },

    // 4. Actualizar visita (PUT)
    update: async (id, data) => {
        const response = await api.put(`/Visitas/${id}`, data);
        return response.data;
    },

    // 5. Eliminar visita (DELETE)
    delete: async (id) => {
        const response = await api.delete(`/Visitas/${id}`);
        return response.data;
    }
};
