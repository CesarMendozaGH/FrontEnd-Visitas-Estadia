import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


export const MyNavbar = () => {
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="shadow-sm">
      <Container fluid> {/* fluid hace que el contenido dentro de la barra aproveche el ancho */}
        <Navbar.Brand as={Link} to="/" className="fw-bold">
            Gestión Visitas
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto"> {/* ms-auto mueve los links a la derecha */}
            <Nav.Link as={Link} to="/espacios">Espacios</Nav.Link>
            <Nav.Link as={Link} to="/reservas">Reservas</Nav.Link>
            <Nav.Link as={Link} to="/asistencias">Pasar Lista</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}