import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { EspaciosPage } from '../pages/Espacios/EspaciosPage';
import { BitacoraPage } from '../pages/Bitacora/BitacoraPage';
import { ReservasPage } from '../pages/Reservas/ReservasPage';
import { ComunitarioPage } from '../pages/Comunitario/ComunitarioPage';
import { UsuariosAdmin } from '../pages/Usuarios/UsuariosAdmin';
import { ProtectedRoute } from '../components/ProtectedRoute'; // <-- Asegúrate de tener este archivo creado
import { HomePage } from '../pages/HomePage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Si entra a la raíz "/", lo empujamos al home
      {
        index: true,
        element: <Navigate to="/home" replace />
      },
      {
        path: "home",
        element: <HomePage /> // 2. <-- Colocamos el componente oficial
      },

      // --- RUTAS PROTEGIDAS ---
      {
        // Espacios: TOTAL y DIRECTIVO
        element: <ProtectedRoute rolesPermitidos={['DIRECTIVO', 'TOTAL']} />,
        children: [{ path: "espacios", element: <EspaciosPage /> }]
      },
      {
        // Reservas: DIRECTIVO, TOTAL, COMUNITARIO
        element: <ProtectedRoute rolesPermitidos={['DIRECTIVO', 'TOTAL', 'COMUNITARIO']} />,
        children: [{ path: "reservas", element: <ReservasPage /> }]
      },
      {
        // Visitas Rápidas: RECEPCION, TOTAL, COMUNITARIO
        element: <ProtectedRoute rolesPermitidos={['RECEPCION', 'TOTAL', 'COMUNITARIO']} />,
        children: [{ path: "asistencias", element: <BitacoraPage /> }]
      },
      {
        // Servicio Comunitario: COMUNITARIO, TOTAL, DIRECTIVO (SuperAdmin pasa por defecto)
        element: <ProtectedRoute rolesPermitidos={['COMUNITARIO', 'TOTAL', 'DIRECTIVO']} />,
        children: [{ path: "servicio", element: <ComunitarioPage /> }]
      },
      {
        // Usuarios: SOLO SUPERADMIN
        element: <ProtectedRoute rolesPermitidos={[]} />,
        children: [{ path: "usuario", element: <UsuariosAdmin /> }]
      }
    ]
  }
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
}