import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // C# nos mandó para acá con estas 3 variables en la URL
        const token = searchParams.get('jwt_token');
        const rol = searchParams.get('rol');
        const nombre = searchParams.get('nombre');

        if (token && rol) {
            // Guardamos todo en la bóveda
            localStorage.setItem('jwt_token', token);
            localStorage.setItem('rol_dev', rol);
            if (nombre) localStorage.setItem('nombre_usuario', nombre);

            // Entramos al sistema
            navigate('/home', { replace: true });
        } else {
            console.error("Faltan datos de autenticación en la URL");
            alert("Error de inicio de sesión.");
        }
    }, [navigate, searchParams]);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
            <h4 className="mt-3 text-secondary">Iniciando sesión...</h4>
        </div>
    );
}