import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = ({ rolesPermitidos }) => {
    const rolActual = localStorage.getItem('rol_dev');

    // 1. Si no hay rol (aún no entra el token de la intranet), mostramos pantalla de carga o bloqueamos
    if (!rolActual) {
        return <Navigate to="/home" replace />;
    }

    // 2. El SUPERADMIN es Dios, entra a todas partes sin importar la lista
    if (rolActual === 'SUPERADMIN') {
        return <Outlet />; // Outlet significa "Adelante, puedes ver la pantalla"
    }

    // 3. Verificamos si el rol del usuario está dentro del arreglo de permitidos para esta ruta
    if (rolesPermitidos.includes(rolActual) || rolActual === 'TOTAL') {
        return <Outlet />;
    }

    // 4. Si llegó hasta aquí, es porque está logueado pero NO TIENE PERMISO
    return (
        <div className="text-center mt-5">
            <h1 className="text-danger fw-bold" style={{ fontSize: '5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '8rem' }}>
                    disabled_by_default
                </span>

            </h1>
            <h2 className="fw-bold">Acceso Denegado</h2>
            <p className="text-muted">No tienes los privilegios necesarios para ver este módulo.</p>
        </div>
    );
};