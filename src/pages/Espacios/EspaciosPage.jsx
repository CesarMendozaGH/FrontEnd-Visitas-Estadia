import { useEffect, useState } from 'react';
import { espaciosService } from '../../services/espaciosServices';
import { EspaciosForm } from './EspaciosForm';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import Swal from 'sweetalert2'; // <--- IMPORTANTE

export function EspaciosPage() {
    const [espacios, setEspacios] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [showModal, setShowModal] = useState(false);
    const [editingEspacio, setEditingEspacio] = useState(null);

    useEffect(() => {
        cargarEspacios();
    }, []);

    const cargarEspacios = async () => {
        setLoading(true);
        try {
            const data = await espaciosService.getAll();
            const activos = data.filter(e => e.activo !== false); 
            setEspacios(activos);
        } catch (error) {
            console.error("Error al cargar:", error);
            Swal.fire('Error', 'No se pudo cargar la lista de espacios.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingEspacio(null);
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

    const handleSave = async (formData) => {
        try {
            if (formData.idEspacios === 0) {
                await espaciosService.create(formData);
                Swal.fire('Creado', 'El espacio ha sido registrado.', 'success');
            } else {
                await espaciosService.update(formData.idEspacios, formData);
                Swal.fire('Actualizado', 'Los cambios han sido guardados.', 'success');
            }
            handleCloseModal();
            cargarEspacios();
        } catch (error) {
            console.error("Error al guardar:", error);
            Swal.fire('Error', 'No se pudo guardar el espacio.', 'error');
        }
    };

    const handleDelete = async (id) => {
        // CONFIRMACIÓN ROJA PARA BORRAR
        const result = await Swal.fire({
            title: '¿Eliminar espacio?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await espaciosService.delete(id);
                await cargarEspacios();
                Swal.fire('Eliminado', 'El espacio ha sido eliminado.', 'success');
            } catch (error) {
                console.error("Error al eliminar:", error);
                Swal.fire('Error', 'Ocurrió un problema al intentar eliminar.', 'error');
            }
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Espacios</h2>
                <Button variant="outline-primary" onClick={handleOpenCreate}>
                    <MdAdd size={20} /> Nuevo Espacio
                </Button>
            </div>

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
                            <tr><td colSpan="4" className="text-center py-4">Cargando...</td></tr>
                        ) : espacios.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-4">No hay espacios registrados.</td></tr>
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
                                            title="Editar"
                                        >
                                            <MdEdit />
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleDelete(item.idEspacios)}
                                            title="Eliminar"
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

            <EspaciosForm 
                show={showModal} 
                handleClose={handleCloseModal} 
                handleSave={handleSave}
                espacioEditar={editingEspacio}
            />
        </div>
    );
}