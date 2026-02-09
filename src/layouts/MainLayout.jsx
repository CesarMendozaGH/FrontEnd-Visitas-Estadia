import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';   // Importamos el Header nuevo
import { Sidebar } from '../components/Sidebar'; // Importamos el Sidebar limpio
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min'; 

export const MainLayout = () => {
  return (
    // Contenedor principal: Ocupa toda la altura (vh-100) y es columna
    <div className="d-flex flex-column vh-100">
      
      {/* 1. Header (Ocupa todo el ancho arriba) */}
      <Header />

      {/* 2. Cuerpo (Sidebar + Contenido) */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        
        {/* Sidebar Fijo a la izquierda */}
        <Sidebar />

        {/* Contenido Principal con Scroll propio */}
        <main className="flex-grow-1 overflow-auto bg-light p-4">
          <div className="container-fluid bg-white p-4 rounded shadow-sm" style={{minHeight: '100%'}}>
             <Outlet />
          </div>
        </main>
      </div>
      
    </div>
  );
};