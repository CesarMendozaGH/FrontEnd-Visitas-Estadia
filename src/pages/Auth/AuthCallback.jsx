import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/apiConfig'; // Importamos tu api configurada

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Atrapamos los datos EXACTAMENTE como los manda la Intranet
        const accessToken = searchParams.get('access_token');
        const sid = searchParams.get('sid');

        if (accessToken && sid) {
            // 2. Le pedimos a NUESTRO C# que valide este token y nos dé uno propio
            api.post('/Auth/IntercambiarToken', { 
                access_token: accessToken, 
                sid: sid 
            })
            .then((response) => {
                // 3. C# nos respondió que todo está bien y nos mandó el Token Interno con Roles
                localStorage.setItem('jwt_token', response.data.token);
                localStorage.setItem('rol_dev', response.data.rol);

                localStorage.setItem('nombre_usuario', response.data.nombre);
                
                // 4. Limpiamos la URL y entramos al sistema
                navigate('/home', { replace: true });
            })
            .catch((error) => {
                console.error("Error al validar con C#:", error);
                alert("Acceso denegado: El token de la Intranet no es válido o expiró.");
            });

        } else {
            console.error("Faltan datos en la URL de la Intranet");
        }
    }, [navigate, searchParams]);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
            <h4 className="mt-3 text-secondary">Validando seguridad con el servidor...</h4>
        </div>
    );
}