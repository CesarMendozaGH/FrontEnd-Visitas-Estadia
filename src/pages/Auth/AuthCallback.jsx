import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// Asegúrate de poner la ruta correcta hacia tu archivo apiConfig
import api from '../../api/apiConfig';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [mensaje, setMensaje] = useState("Iniciando sesión segura...");
    const [huboError, setHuboError] = useState(false);

    useEffect(() => {
        // 1. Leemos lo que mandó la Intranet por la URL
        const accessToken = searchParams.get('access_token');
        const sid = searchParams.get('sid');

        if (accessToken && sid) {
            setMensaje("Validando credenciales...");

            // 2. Usamos tu instancia "api" que ya apunta a tu base URL
            api.post('/Auth/IntercambiarToken', {
                access_token: accessToken,
                sid: sid
            })
                .then(response => {
                    // 3. ¡Éxito! Guardamos los datos limpios
                    const { jwt_token, rol, nombre } = response.data;

                    localStorage.setItem('jwt_token', jwt_token);
                    localStorage.setItem('rol_dev', rol);          // <--- ¡Ajustado a tu variable original!
                    localStorage.setItem('nombre_usuario', nombre)

                    // 4. Redirigimos a tu ruta real
                    navigate('/home', { replace: true });
                })
                .catch(error => {
                    console.error("Error validando:", error);
                    setMensaje("Acceso denegado: El token es inválido o ha caducado.");
                    setHuboError(true); // Mostramos el mensaje de error para que cierren la pestaña
                });

        } else {
            setMensaje("Acceso denegado: Faltan credenciales.");
            setHuboError(true);
        }
    }, [navigate, searchParams]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: huboError ? '#d32f2f' : '#333' }}>{mensaje}</h2>

            {/* Si hubo un error, les damos una instrucción clara ya que no hay pantalla de Login */}
            {huboError && (
                <p style={{ marginTop: '20px', color: '#666', textAlign: 'center' }}>
                    Por favor, cierra esta pestaña y vuelve a ingresar desde el menú principal de la Intranet.
                </p>
            )}
        </div>
    );
}