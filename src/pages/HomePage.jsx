import React from 'react';
import { Container, Card, Badge } from 'react-bootstrap';

export const HomePage = () => {
    // Leemos los datos que guardamos en el Login simulado
    const nombre = localStorage.getItem('nombre_usuario') || 'Invitado';
    const rol = localStorage.getItem('rol_dev') || 'SIN ROL';

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="text-center shadow p-5 border-0" style={{ borderRadius: '15px', maxWidth: '600px', backgroundColor: '#f8f9fa' }}>
                <h1 style={{ color: '#f96f31' }} className="fw-bold mb-3">¡Bienvenido al Sistema de Visitas!</h1>
                
                <h3 className="text-dark mb-4">Hola, <span style={{ color: '#e79951' }}>{nombre}</span> </h3>
                
                <p className="fs-5 mb-2">
                    Tu nivel de acceso actual es: 
                </p>
                <h4>
                    <Badge bg={rol === 'SUPERADMIN' ? 'danger' : 'secondary'} className="px-3 py-2">
                        {rol}
                    </Badge>
                </h4>
                
                <p className="text-muted small mt-4">
                    Utiliza el menú lateral para navegar por los módulos que tienes permitidos. Si crees que te faltan permisos, contacta a TI.
                </p>
            </Card>
        </Container>
    );
};