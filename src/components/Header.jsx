
import { Link } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import logo_BAL from '../assets/logo_BAL.png'
import logo_BAL2 from '../assets/logo_BAL_2.png'
import logo_BAL3 from '../assets/logo_BAL_3.png'

export const Header = () => {
  return (
    // "sticky-top" asegura que se quede pegado arriba
    <Navbar  data-bs-theme="red" className="border-bottom shadow-sm" style={{ height: '100px', backgroundColor: '#A22422' }}>
      <Container fluid>
        {/* ZONA DEL LOGO */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          
          <div style={{ backgroundColor: 'transparent', padding: '10px', borderRadius: '10    px' }}>
             { <img src={logo_BAL3} alt="Logo" height="50" /> }
          </div>
          <span className="fw-bold" style={{ color: 'White' }}>Visitas</span>
        </Navbar.Brand>

        {/* ZONA DE USUARIO (Derecha) */}
        <Nav className="ms-auto">
          <div className="dropdown">
            <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
              <div className="bg-secondary rounded-circle d-flex justify-content-center align-items-center me-2" style={{width: '32px', height: '32px'}}>
                👤
              </div>
              <strong>Admin</strong>
            </a>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow">
              <li><Link className="dropdown-item" to="/">Perfil</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item" to="/">Salir</Link></li>
            </ul>
          </div>
        </Nav>
      </Container>
    </Navbar>
  );
};