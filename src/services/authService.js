import api from '../api/apiConfig';

export const authService = {
    // 1. EL MÉTODO OFICIAL (El que usará la Intranet)
    // Llama al backend para validar el token y hacer el JIT Provisioning
    loginSincronizado: async () => {
        try {
            const response = await api.post('/Auth/Login');
            return response.data;
        } catch (error) {
            console.error("Error al sincronizar login con backend:", error);
            throw error;
        }
    },

    // 2. MÉTODO TEMPORAL DE DESARROLLO (Para ti)
    // Pide el token falso firmado, lo guarda como lo haría la Intranet, y llama al login oficial
    simularLoginIntranet: async () => {
        try {
            // A. Pedimos el token falso de Misael
            const resPase = await api.get('/Auth/GenerarPaseDev');

            // B. Lo guardamos en el navegador EXACTAMENTE con el nombre que usa la Intranet
            // B. Lo guardamos en el navegador
            localStorage.setItem('token', resPase.data.token); // <-- Agrégale el .token aquí

            // C. Ahora sí, llamamos a tu endpoint oficial (Axios ya le pegará el token)
            const resLogin = await api.post('/Auth/Login');

            // D. Guardamos tu rol y tu nombre para que React sepa quién eres
            const { rol, nombre } = resLogin.data.usuario;
            localStorage.setItem('rol_dev', rol);
            localStorage.setItem('nombre_usuario', nombre);

            return resLogin.data.usuario;
        } catch (error) {
            console.error("Error en simulación de login:", error);
            throw error;
        }
    },

    // 3. Cerrar sesión
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol_dev');
        localStorage.removeItem('nombre_usuario');
        window.location.reload();
    }
};