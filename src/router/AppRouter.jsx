import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
// Importaremos tus páginas aquí (por ahora usaremos placeholders si no existen)
import { EspaciosPage } from '../pages/Espacios/EspaciosPage';
import { BitacoraPage } from '../pages/Bitacora/BitacoraPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "espacios",
        element: <EspaciosPage />,
      },
      {
        path: "reservas",
        element: <div><h1>Página de Reservas (Próximamente)</h1></div>,
      },
      {
        path: "asistencias",
        element:<BitacoraPage />,
      },
      {
        path: "/", // Home
        element: <div className='text-center'><h1>Bienvenido al Sistema</h1></div>
      }
    ]
  }
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
}