
import { Link, NavLink } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { Button } from 'react-bootstrap';
import logo_BAL from '../assets/logo_BAL.png'
import logo_BAL2 from '../assets/logo_BAL_2.png'
import logo_BAL3 from '../assets/logo_BAL_3.png'
import { authService } from '../services/authService';


export const Header = () => {
  const toggleDevRole = () => {
    const currentRole = localStorage.getItem('rol_dev');
    if (currentRole === 'SUPERADMIN') {
      localStorage.setItem('rol_dev', 'DIRECTIVO');
    } else {
      localStorage.setItem('rol_dev', 'SUPERADMIN');
    }
    window.location.reload(); // Recargamos para aplicar el cambio visual
  };

  //LOGIN SIMULADO
 const handleDevLogin = async () => {
    try {
      const usuario = await authService.simularLoginIntranet();
      alert(`¡Magia! Entraste como ${usuario.nombre} con rol de ${usuario.rol}`);
      window.location.reload(); 
    } catch (error) {
      console.error("El error real es:", error); // <-- ¡Agrega esta línea!
      alert("Falló la simulación. Revisa la consola.");
    }
  };

  const currentRole = localStorage.getItem('rol_dev') || 'USER';
  return (
    // "sticky-top" asegura que se quede pegado arriba
    <Navbar data-bs-theme="red" className="border-bottom shadow-sm" style={{ height: '100px', backgroundColor: '#f96f31' }}>

      {/* COLOR ROJO #e79951  */}
      <Container fluid>
        {/* ZONA DEL LOGO */}
        <div className="d-flex align-items-center gap-2">
          <NavLink to="home">
            <div style={{ backgroundColor: 'transparent', padding: '10px', borderRadius: '10    px' }}>
              <img src={logo_BAL3} alt="Logo" height="70" />
            </div>
          </NavLink>
          <span className="fw-bold" style={{ color: 'White' }}>Visitas</span>
        </div>

        {/* ZONA DE USUARIO (Derecha) */}
        <Nav className="ms-auto">
          <div className="d-flex align-items-center bg-transparent p-2 rounded text-white ms-3">
            <small className="me-2 text-white fw-bold">Modo Pruebas:</small>
            <Button
              variant={currentRole === 'SUPERADMIN' ? "danger" : "secondary"}
              size="sm"
              onClick={toggleDevRole}
            >
              {currentRole}
            </Button>

            <button className="btn btn-warning fw-bold mb-3" onClick={handleDevLogin}>
              🧪 SIMULAR INTRANET (MISAEL)
            </button>
          </div>
        </Nav>
      </Container>
    </Navbar>
  );
};