import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Atrapamos los datos que C# nos mandó por la URL
        const token = searchParams.get('token');
        const rol = searchParams.get('rol');

        if (token) {
            // 2. Los guardamos en el bolsillo (localStorage)
            localStorage.setItem('jwt_token', token);
            if (rol) {
                localStorage.setItem('rol_dev', rol);
            }

            // 3. Limpiamos la URL fea y mandamos al usuario a la página principal
            // Cambia '/reservas' por la ruta inicial de tu sistema (ej. '/home' o '/')
            navigate('/reservas', { replace: true }); 
        } else {
            // Si alguien entra sin token, lo mandamos a volar
            console.error("No se recibió token de la Intranet");
        }
    }, [navigate, searchParams]);

    // Esta pantalla dura como medio segundo, así que ponemos un "Cargando" bonito
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
            <h4 className="mt-3 text-secondary">Autenticando con la Intranet...</h4>
        </div>
    );
}