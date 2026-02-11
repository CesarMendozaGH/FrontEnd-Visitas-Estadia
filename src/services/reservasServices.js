import api from '../api/apiConfig';

// Helper para obtener fecha actual en formato local (YYYY-MM-DDTHH:mm:ss)
const getLocalDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const reservasService = {
    // 1. Obtener todas las reservas (GET)
    getAll: async () => {
        const response = await api.get('/Reservas');
        return response.data;
    },

    // 2. Obtener reserva por ID (GET)
    getById: async (id) => {
        const response = await api.get(`/Reservas/${id}`);
        return response.data;
    },

    // 3. Crear nueva reserva (POST)
    create: async (data) => {
        const payload = {
            idReserva: 0,
            espacioId: data.espacioId,
            idBitacoraGeneral: 0,
            idUsuarioReservante: 0, // TODO: Obtener del localStorage
            nombreReservante: data.nombreReservante,
            areaReservante: data.areaReservante,
            institucionVisitante: data.institucionVisitante,
            representanteVisita: data.representanteVisita,
            numeroPersonas: data.numeroPersonas,
            requerimientosEspecialesJson: data.requerimientosEspecialesJson || "",
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin,
            estatusReserva: true,
            createdAt: getLocalDateTime()
        };

        console.log('Enviando reserva:', JSON.stringify(payload, null, 2));
        
        try {
            const response = await api.post('/Reservas', payload);
            return response.data;
        } catch (error) {
            console.error('Error al crear reserva:', error.response?.data || error.message);
            throw error;
        }
    },

    // 4. Actualizar reserva (PUT)
    update: async (id, data) => {
        const response = await api.put(`/Reservas/${id}`, data);
        return response.data;
    },

    // 5. Cancelar reserva (DELETE/Cancelacion)
    cancelar: async (id) => {
        const response = await api.delete(`/Reservas/${id}/Cancelacion`);
        return response.data;
    },

    // 6. Obtener asistentes por reserva (GET)
    getAsistentes: async (idReserva) => {
        const response = await api.get(`/Reservas/${idReserva}/asistentes`);
        return response.data;
    },

    // 7. Agregar asistentes masivos (POST)
    agregarAsistentes: async (idReserva, listaAsistentes) => {
        const payload = listaAsistentes.map(asistente => ({
            idLista: 0,
            idReservaFk: idReserva,
            nombre: asistente.nombre,
            apellidoPaterno: asistente.apellidoPaterno || "",
            apellidoMaterno: asistente.apellidoMaterno || "",
            asistio: false,
            createdAt: getLocalDateTime()
        }));

        console.log('Enviando asistentes:', JSON.stringify(payload, null, 2));
        
        try {
            const response = await api.post(`/Reservas/${idReserva}/asistentes`, payload);
            return response.data;
        } catch (error) {
            console.error('Error al agregar asistentes:', error.response?.data || error.message);
            throw error;
        }
    },

    // 8. Toggle asistencia individual (PUT)
    toggleAsistencia: async (idAsistente) => {
        const response = await api.put(`/Reservas/Asistentes/${idAsistente}/checkin`);
        return response.data;
    },

    // 9. Check-in masivo (PUT)
    checkinMasivo: async (idsAsistentes) => {
        const response = await api.put('/Reservas/Asistentes/checkin-masivo', idsAsistentes);
        return response.data;
    }
};
