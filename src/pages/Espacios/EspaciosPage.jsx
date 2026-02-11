import { useEffect, useState } from 'react';
import { espaciosService } from '../../services/espaciosServices';
import { EspaciosForm } from './EspaciosForm';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { MdAdd, MdEdit, MdDelete } from "react-icons/md"; // Asegúrate de tener react-icons

export function EspaciosPage() {
    const [espacios, setEspacios] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Estados para el Modal
    const [showModal, setShowModal] = useState(false);
    const [editingEspacio, setEditingEspacio] = useState(null);

    // Cargar datos al inicio
    useEffect(() => {
        cargarEspacios();
    }, []);

    const cargarEspacios = async () => {
        setLoading(true);
        try {
            const data = await espaciosService.getAll();
            // Filtramos en el front por si el backend devuelve los borrados lógicos
            const activos = data.filter(e => e.activo !== false); 
            setEspacios(activos);
        } catch (error) {
            console.error("Error al cargar:", error);
            alert("Error al cargar la lista de espacios");
        } finally {
            setLoading(false);
        }
    };

    // --- MANEJO DEL MODAL ---
    const handleOpenCreate = () => {
        setEditingEspacio(null); // Null significa "Crear Nuevo"
        setShowModal(true);
    };

    const handleOpenEdit = (espacio) => {
        setEditingEspacio(espacio);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEspacio(null);
    };

    // --- OPERACIONES CRUD ---
    const handleSave = async (formData) => {
        try {
            if (formData.idEspacios === 0) {
                // CREAR
                await espaciosService.create(formData);
            } else {
                // EDITAR
                await espaciosService.update(formData.idEspacios, formData);
            }
            handleCloseModal();
            cargarEspacios(); // Recargar la tabla
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("No se pudo guardar el espacio.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este espacio?")) {
            try {
                await espaciosService.delete(id);
                cargarEspacios();
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Error al intentar eliminar.");
            }
        }
    };

    return (
        <div>
            {/* Encabezado con Botón Agregar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Espacios</h2>
                <Button variant="outline-primary" onClick={handleOpenCreate}>
                    <MdAdd size={20} /> Nuevo Espacio
                </Button>
            </div>

            {/* Tabla de Datos */}
            <div className="table-responsive shadow-sm rounded bg-white">
                <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th className="text-center">Capacidad</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4">Cargando...</td></tr>
                        ) : espacios.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4">No hay espacios registrados.</td></tr>
                        ) : (
                            espacios.map((item) => (
                                <tr key={item.idEspacios}>
                                    <td>{item.idEspacios}</td>
                                    <td className="fw-bold">{item.nombre}</td>
                                   
                                    <td className="text-center">
                                        <Badge bg="info" text="dark" pill>
                                            {item.capacidad} Personas
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => handleOpenEdit(item)}
                                        >
                                            <MdEdit />
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleDelete(item.idEspacios)}
                                        >
                                            <MdDelete />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Componente Modal (Formulario) */}
            <EspaciosForm 
                show={showModal} 
                handleClose={handleCloseModal} 
                handleSave={handleSave}
                espacioEditar={editingEspacio}
            />
        </div>
    );
}