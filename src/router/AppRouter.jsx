import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { EspaciosPage } from '../pages/Espacios/EspaciosPage';
import { BitacoraPage } from '../pages/Bitacora/BitacoraPage';
import { ReservasPage } from '../pages/Reservas/ReservasPage';
import { ComunitarioPage } from '../pages/Comunitario/ComunitarioPage';

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
        element: <ReservasPage />,
      },
      {
        path: "asistencias",
        element:<BitacoraPage />,
      },
      {
        path: "servicio",
        element:<ComunitarioPage />,
      },
      {
        path: "reportes",
        element: <h1>PROXIMAMENTE</h1>,
      },
      {
        index: true,
        path: "home", // Home
        element: <div className='text-center'><h1>Bienvenido al Sistema</h1></div>
      }
    ]
  }
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
}