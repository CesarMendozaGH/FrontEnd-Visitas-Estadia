import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaUserShield } from 'react-icons/fa';
import api from '../../api/apiConfig'; // Ajusta la ruta según tus carpetas

export const UsuariosAdmin = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Los roles exactos que definiste
    const rolesDisponibles = [
        'USUARIO_NORMAL',
        'RECEPCION',
        'COMUNITARIO',
        'DIRECTIVO',
        'TOTAL',
        'SUPERADMIN'
    ];

    const cargarUsuarios = async () => {
        try {
            const response = await api.get('/Usuarios');
            setUsuarios(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Error al cargar la lista. ¿Seguro que eres SuperAdmin?');
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const handleCambiarRol = async (idUsuario, nombreUsuario, nuevoRol) => {
        // Pequeña validación de seguridad extra en el front
        if (nuevoRol === 'SUPERADMIN') {
            const confirmar = window.confirm(`⚠️ ¿Estás totalmente seguro de darle poderes de SUPERADMIN a ${nombreUsuario}?`);
            if (!confirmar) {
                cargarUsuarios(); // Recargamos para que el dropdown regrese a como estaba
                return;
            }
        }

        try {
            await api.put(`/Usuarios/${idUsuario}/Rol`, { nuevoRol: nuevoRol });
            
            // Actualizamos la tabla visualmente sin tener que recargar toda la página
            setUsuarios(usuarios.map(u => u.idUsuario === idUsuario ? { ...u, rol: nuevoRol } : u));
            alert(`✅ El rol de ${nombreUsuario} se actualizó a ${nuevoRol}`);
            
        } catch (err) {
            console.error("Error al actualizar:", err);
            alert(err.response?.data || "Ocurrió un error al intentar cambiar el rol.");
            cargarUsuarios(); // Regresamos el dropdown a su valor original
        }
    };

    // --- RENDERIZADO ---
    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" variant="danger" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="mt-4 bg-white p-4 rounded shadow-sm">
            <h2 className="mb-4 fw-bold d-flex align-items-center gap-2" style={{ color: '#f96f31' }}>
                <FaUserShield /> Administración de Usuarios
            </h2>
            
            <Table responsive hover className="align-middle">
                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Nombre Completo</th>
                        <th>Fecha de Registro</th>
                        <th>Rol Actual</th>
                        <th>Cambiar Rol</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.idUsuario}>
                            <td className="fw-bold text-muted">#{usuario.idUsuario}</td>
                            <td className="fw-semibold">{usuario.nombreCompleto}</td>
                            <td>{new Date(usuario.fechaRegistro).toLocaleDateString()}</td>
                            <td>
                                <Badge bg={usuario.rol === 'SUPERADMIN' ? 'danger' : 'secondary'}>
                                    {usuario.rol}
                                </Badge>
                            </td>
                            <td style={{ width: '250px' }}>
                                <Form.Select 
                                    value={usuario.rol}
                                    onChange={(e) => handleCambiarRol(usuario.idUsuario, usuario.nombreCompleto, e.target.value)}
                                    // Bloqueamos el dropdown si es el creador del sistema
                                    disabled={usuario.rol === 'SUPERADMIN' && usuario.idUsuario === 1} 
                                    size="sm"
                                    className="fw-bold"
                                >
                                    {rolesDisponibles.map(rol => (
                                        <option key={rol} value={rol}>{rol}</option>
                                    ))}
                                </Form.Select>
                            </td>
                        </tr>
                    ))}
                    {usuarios.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center text-muted py-4">No hay usuarios registrados aún.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};