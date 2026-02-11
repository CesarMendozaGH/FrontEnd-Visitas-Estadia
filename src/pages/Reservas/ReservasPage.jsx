import { useEffect, useState } from 'react';
import { reservasService } from '../../services/reservasServices';
import { espaciosService } from '../../services/espaciosServices';
import { ReservasForm } from './ReservasForm';
import { ReservasAsistentesModal } from './ReservasAsistentesModal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { MdAdd, MdEdit, MdDelete, MdPersonAdd } from "react-icons/md";

export function ReservasPage() {
    const [reservas, setReservas] = useState([]);
    const [espacios, setEspacios] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Estados para el Modal de Reserva
    const [showModal, setShowModal] = useState(false);
    const [editingReserva, setEditingReserva] = useState(null);

    // Estados para el Modal de Asistentes
    const [showAsistentesModal, setShowAsistentesModal] = useState(false);
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

    // Cargar datos al inicio
    useEffect(() => {
        cargarReservas();
        cargarEspacios();
    }, []);

    const cargarReservas = async () => {
        setLoading(true);
        try {
            const data = await reservasService.getAll();
            // Mostrar todas las reservas (activas e inactivas)
            setReservas(data);
        } catch (error) {
            console.error("Error al cargar reservas:", error);
            alert("Error al cargar la lista de reservas");
        } finally {
            setLoading(false);
        }
    };

    const cargarEspacios = async () => {
        try {
            const data = await espaciosService.getAll();
            const activos = data.filter(e => e.activo !== false);
            setEspacios(activos);
        } catch (error) {
            console.error("Error al cargar espacios:", error);
        }
    };

    // --- MANEJO DEL MODAL DE RESERVA ---
    const handleOpenCreate = () => {
        setEditingReserva(null);
        setShowModal(true);
    };

    const handleOpenEdit = (reserva) => {
        setEditingReserva(reserva);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingReserva(null);
    };

    // --- MANEJO DEL MODAL DE ASISTENTES ---
    const handleOpenAsistentes = (reserva) => {
        setReservaSeleccionada(reserva);
        setShowAsistentesModal(true);
    };

    const handleCloseAsistentesModal = () => {
        setShowAsistentesModal(false);
        setReservaSeleccionada(null);
    };

    // --- OPERACIONES CRUD ---
    const handleSaveReserva = async (formData, estatusReserva) => {
        try {
            if (formData.idReserva === 0) {
                // CREAR
                await reservasService.create(formData);
            } else {
                // EDITAR - preservar el estatus actual
                await reservasService.update(formData.idReserva, {
                    ...formData,
                    estatusReserva: estatusReserva
                });
            }
            handleCloseModal();
            cargarReservas();
        } catch (error) {
            console.error("Error al guardar reserva:", error);
            // Mostrar mensaje de error del backend si existe
            const errorMsg = error.response?.data || "No se pudo guardar la reserva.";
            alert(errorMsg);
        }
    };

    const handleCancelarReserva = async (id) => {
        if (window.confirm("¿Seguro que deseas cancelar esta reserva?")) {
            try {
                await reservasService.cancelar(id);
                cargarReservas();
            } catch (error) {
                console.error("Error al cancelar reserva:", error);
                alert("Error al intentar cancelar la reserva.");
            }
        }
    };

    // Obtener nombre del espacio (busca en el objeto includo o en la lista local)
    const getEspacioNombre = (item) => {
        // Primero intentar obtener del objeto espacio incluido por el backend
        if (item.espacio?.nombre) {
            return item.espacio.nombre;
        }
        // Si no, buscar en la lista local de espacios
        const espacio = espacios.find(e => e.idEspacios === item.espacioId);
        return espacio?.nombre || `ID: ${item.espacioId}`;
    };

    // Formatear fecha para mostrar en formato DD/MM/YYYY
    const formatFecha = (fechaISO) => {
        if (!fechaISO) return "-";
        // Convertir directamente sin convertir a UTC
        const fecha = new Date(fechaISO);
        const day = String(fecha.getDate()).padStart(2, '0');
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const year = fecha.getFullYear();
        const hours = String(fecha.getHours()).padStart(2, '0');
        const minutes = String(fecha.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <div>
            {/* Encabezado con Botón Agregar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Reservas</h2>
                <Button className='btn' variant="outline-primary" onClick={handleOpenCreate}>
                    <MdAdd size={20} /> Nueva Reserva
                </Button>
            </div>

            {/* Tabla de Datos */}
            <div className="table-responsive shadow-sm rounded bg-white">
                <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Espacio</th>
                            <th>Reservante</th>
                            <th>Área</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th className="text-center">Personas</th>
                            <th className="text-center">Estatus</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" className="text-center py-4">Cargando...</td></tr>
                        ) : reservas.length === 0 ? (
                            <tr><td colSpan="9" className="text-center py-4">No hay reservas registradas.</td></tr>
                        ) : (
                            reservas.map((item) => (
                                <tr 
                                    key={item.idReserva}
                                    style={{ 
                                        opacity: item.estatusReserva === false ? 0.6 : 1,
                                        backgroundColor: item.estatusReserva === false ? '#f8f9fa' : 'transparent'
                                    }}
                                >
                                    <td>{item.idReserva}</td>
                                    <td className="fw-bold">{getEspacioNombre(item)}</td>
                                    <td>{item.nombreReservante}</td>
                                    <td>{item.areaReservante}</td>
                                    <td>{formatFecha(item.fechaInicio)}</td>
                                    <td>{formatFecha(item.fechaFin)}</td>
                                    <td className="text-center">
                                        <Badge bg="info" text="dark" pill>
                                            {item.numeroPersonas}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg={item.estatusReserva ? "success" : "danger"}>
                                            {item.estatusReserva ? "Activa" : "Cancelada"}
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
                                            variant="outline-secondary" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => handleOpenAsistentes(item)}
                                            title="Agregar Asistentes"
                                        >
                                            <MdPersonAdd />
                                        </Button>
                                        {item.estatusReserva && (
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => handleCancelarReserva(item.idReserva)}
                                                title="Cancelar Reserva"
                                            >
                                                <MdDelete />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Componente Modal (Formulario de Reserva) */}
            <ReservasForm 
                show={showModal} 
                handleClose={handleCloseModal} 
                handleSave={handleSaveReserva}
                reservaEditar={editingReserva}
                reservaEstatus={editingReserva?.estatusReserva}
                espacios={espacios}
            />

            {/* Componente Modal (Gestión de Asistentes) */}
            <ReservasAsistentesModal
                show={showAsistentesModal}
                handleClose={handleCloseAsistentesModal}
                reserva={reservaSeleccionada}
            />
        </div>
    );
}
