import { Link, useLocation } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import './Sidebar.css';

export const Sidebar = () => {
  const location = useLocation();


  const rolActual = localStorage.getItem('rol_dev') || 'USUARIO_NORMAL';

  // Lógica de Permisos Exacta
  const puedeVerEspacios = ['SUPERADMIN', 'TOTAL', 'DIRECTIVO'].includes(rolActual);
  const puedeVerReservas = ['SUPERADMIN', 'TOTAL', 'DIRECTIVO', 'COMUNITARIO'].includes(rolActual);
  const puedeVerVisitas = ['SUPERADMIN', 'TOTAL', 'COMUNITARIO', 'RECEPCION'].includes(rolActual);
  const puedeVerComunitario = ['SUPERADMIN', 'TOTAL', 'DIRECTIVO', 'COMUNITARIO'].includes(rolActual);
  const puedeVerUsuarios = rolActual === 'SUPERADMIN';


  
  return (
    <div className="sidebar d-flex flex-column flex-shrink-0 p-3 bg-light border-end" style={{ width: '240px', minHeight: 'calc(100vh - 60px)' }}>

      <span className="fs-6 text-muted fw-semibold text-uppercase mb-3 ps-2">
        Navegación
      </span>

      <Nav variant="pills" className="flex-column mb-auto gap-2">

        {/* ESPACIOS */}
        {puedeVerEspacios && (
          <Nav.Item>
            <Link to="/espacios" className={`nav-link d-flex align-items-center gap-2 ${location.pathname.includes('espacios') ? 'active' : 'link-dark'}`}>
              <span className="material-symbols-outlined">Home</span>
              Espacios
            </Link>
          </Nav.Item>
        )}

        {/* RESERVAS */}
        {puedeVerReservas && (
          <Nav.Item>
            <Link to="/reservas" className={`nav-link d-flex align-items-center gap-2 ${location.pathname.includes('reservas') ? 'active' : 'link-dark'}`}>
              <span className="material-symbols-outlined">event</span>
              Reservas
            </Link>
          </Nav.Item>
        )}

        {/* VISITAS RAPIDAS */}
        {puedeVerVisitas && (
          <Nav.Item>
            <Link to="/asistencias" className={`nav-link d-flex align-items-center gap-2 ${location.pathname.includes('asistencias') ? 'active' : 'link-dark'}`}>
              <span className="material-symbols-outlined">list_alt_check</span>
              Visitas rápidas
            </Link>
          </Nav.Item>
        )}

        {/* SERVICIO COMUNITARIO */}
        {puedeVerComunitario && (
          <Nav.Item>
            <Link to="/servicio" className={`nav-link d-flex align-items-center gap-2 ${location.pathname.includes('servicio') ? 'active' : 'link-dark'}`}>
              <span className="material-symbols-outlined">group</span>
              Servicio Comunitario
            </Link>
          </Nav.Item>
        )}

        {/* USUARIOS Y ROLES (SOLO SUPERADMIN) */}
        {puedeVerUsuarios && (
          <Nav.Item>
            <Link to="/usuario" className={`nav-link d-flex align-items-center gap-2 ${location.pathname.includes('usuario') ? 'active' : 'link-dark'}`}>
              <span className="material-symbols-outlined">person_shield</span>
              Usuarios Y roles
            </Link>
          </Nav.Item>
        )}

      </Nav>

      <div className="mt-auto pt-3 border-top">
        <small className="text-muted d-block fw-bold mb-1">Rol: {rolActual}</small>
        <small className="text-muted">Versión 1.0</small>
      </div>
    </div>
  );
};