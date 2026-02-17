import { Link, useLocation } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import './Sidebar.css';

export const Sidebar = () => {
  const location = useLocation(); // Para saber en qué página estamos y marcarla activa

  return (
    <div className="sidebar d-flex flex-column flex-shrink-0 p-3 bg-light border-end" style={{ width: '240px', minHeight: 'calc(100vh - 60px)' }}>

      <span className="fs-6 text-muted fw-semibold text-uppercase mb-3 ps-2">
        Navegación
      </span>

      <Nav variant="pills" className="flex-column mb-auto gap-2">
        <Nav.Item>
          <Link
            to="/espacios"
            className={`nav-link d-flex align-items-center gap-2 ${location.pathname.includes('espacios') ? 'active' : 'link-dark'}`}
          >
            <span className="material-symbols-outlined">
              Home
            </span>
            Espacios
          </Link>
        </Nav.Item>

        <Nav.Item>
          <Link
            to="/reservas"
            className={`nav-link d-flex align-items-center gap-2 ${location.pathname.includes('reservas') ? 'active' : 'link-dark'}`}
          >
            <span className="material-symbols-outlined">
              event
            </span>
            Reservas
          </Link>
        </Nav.Item>

        <Nav.Item>
          <Link
            to="/asistencias"
            className={`nav-link d-flex align-items-center gap-2 ${location.pathname.includes('asistencias') ? 'active' : 'link-dark'}`}
          >

            <span className="material-symbols-outlined">
              list_alt_check
            </span>
            Visitas rapidas
          </Link>
        </Nav.Item>

        <Nav.Item>
          <Link
            to="/servicio"
            className={`nav-link d-flex align-items-center gap-2 ${location.pathname.includes('servicio') ? 'active' : 'link-dark'}`}
          >

            <span class="material-symbols-outlined">
              group
            </span>
            Servicio Comunitario
          </Link>
        </Nav.Item>

        <Nav.Item>
          <Link
            to="/reportes"
            className={`nav-link d-flex align-items-center gap-2 ${location.pathname.includes('reportes') ? 'active' : 'link-dark'}`}
          >

            <span class="material-symbols-outlined">
              docs
            </span>
            Reportes
          </Link>
        </Nav.Item>
      </Nav>

      {/* Footer opcional del sidebar */}
      <div className="mt-auto pt-3 border-top">
        <small className="text-muted">Versión 1.0</small>
      </div>
    </div>
  );
};
