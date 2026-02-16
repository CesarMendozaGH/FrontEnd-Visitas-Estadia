import api from '../api/apiConfig';

export const comunitarioService = {
    // 1. Obtener todos los perfiles (Directorio)
    getAll: async () => {
        const response = await api.get('/Comunitario/todos');
        return response.data;
    },

    // 2. Buscar perfil (Por nombre o ID)
    buscar: async (query) => {
        const response = await api.get(`/Comunitario/buscar?query=${query}`);
        return response.data;
    },

    // 3. Crear nuevo perfil (Alta de Infractor)
    create: async (data) => {
        // El backend espera: Nombre, Apellidos, HorasTotalesDeuda
        const payload = {
            idPerfilComunitario: 0,
            nombre: data.nombre,
            apellidoPaterno: data.apellidoPaterno,
            apellidoMaterno: data.apellidoMaterno || "",
            horasTotalesDeuda: parseInt(data.horasTotalesDeuda),
            horasAcumuladasActuales: 0,
            estatusServicio: "ACTIVO",
            fechaRegistro: new Date().toISOString().split('T')[0] // Fecha YYYY-MM-DD
        };
        const response = await api.post('/Comunitario/crear-perfil', payload);
        return response.data;
    },

    // 4. Registrar Entrada (Check-In)
    registrarEntrada: async (perfilId, horasACubrir) => {
        // Tu backend usa un DTO específico: EntradaDto { PerfilId, HorasACubrir }
        const payload = {
            perfilId: perfilId,
            horasACubrir: parseInt(horasACubrir)
        };
        const response = await api.post('/Comunitario/registrar-entrada', payload);
        return response.data;
    },

    // 5. Registrar Salida (Check-Out)
    registrarSalida: async (perfilId) => {
        // Tu backend usa PUT en: api/Comunitario/check-out-por-perfil/{perfilId}
        const response = await api.put(`/Comunitario/check-out-por-perfil/${perfilId}`);
        return response.data;
    },

    // 6. Modificar Perfil (PUT)
    update: async (id, data) => {
        // Ajustamos los nombres para que coincidan con el modelo de C#
        const payload = {
            idPerfilComunitario: id,
            nombre: data.nombre,
            apellidoPaterno: data.apellidoPaterno,
            apellidoMaterno: data.apellidoMaterno || "",
            horasTotalesDeuda: parseInt(data.horasTotalesDeuda),
            // Mantenemos los datos viejos que no se editan en el form
            horasAcumuladasActuales: data.horasAcumuladasActuales, 
            estatusServicio: data.estatusServicio,
            fechaRegistro: data.fechaRegistro
        };
        const response = await api.put(`/Comunitario/modificar-perfil/${id}`, payload);
        return response.data;
    },

    // 7. Desactivar/Reactivar (PUT)
    toggleStatus: async (id) => {
        const response = await api.put(`/Comunitario/cambiar-estatus/${id}`);
        return response.data;
    }

};