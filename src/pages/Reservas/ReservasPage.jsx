import { useEffect, useState } from 'react';
import { reservasService } from '../../services/reservasServices';
import { espaciosService } from '../../services/espaciosServices';
import { ReservasForm } from './ReservasForm';
import { ReservasAsistentesModal } from './ReservasAsistentesModal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { MdAdd, MdEdit, MdDelete, MdPersonAdd, MdCheck } from "react-icons/md";
import Swal from 'sweetalert2'; // <--- IMPORTANTE

export function ReservasPage() {
    const [reservas, setReservas] = useState([]);
    const [espacios, setEspacios] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingReserva, setEditingReserva] = useState(null);

    const [showAsistentesModal, setShowAsistentesModal] = useState(false);
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

    // Forzar re-renderizado cada minuto para actualizar estatus de tiempo
    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1); // Esto solo obliga a React a repintar la pantalla
        }, 60000); // Cada 60 segundos
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        cargarReservas();
        cargarEspacios();
    }, []);

    const cargarReservas = async () => {
        setLoading(true);
        try {
            const data = await reservasService.getAll();
            setReservas(data);
        } catch (error) {
            console.error("Error al cargar reservas:", error);
            // No bloqueamos con alert, solo log
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

    const handleOpenAsistentes = (reserva) => {
        setReservaSeleccionada(reserva);
        setShowAsistentesModal(true);
    };

    const handleCloseAsistentesModal = () => {
        setShowAsistentesModal(false);
        setReservaSeleccionada(null);
    };

    const handleSaveReserva = async (formData, estatusReserva) => {
        try {
            if (formData.idReserva === 0) {
                await reservasService.create(formData);
                Swal.fire('Reserva Creada', 'Se ha registrado la reserva exitosamente.', 'success');
            } else {
                await reservasService.update(formData.idReserva, {
                    ...formData,
                    estatusReserva: estatusReserva
                });
                Swal.fire('Reserva Actualizada', 'Los datos han sido guardados.', 'success');
            }
            handleCloseModal();
            cargarReservas();
        } catch (error) {
            console.error("Error al guardar reserva:", error);
            const errorMsg = error.response?.data || "No se pudo guardar la reserva.";
            Swal.fire('Error', errorMsg, 'error');
        }
    };

    const handleCancelarReserva = async (id) => {
        const result = await Swal.fire({
            title: '¿Cancelar Reserva?',
            text: "El estatus cambiará a 'Cancelada' y el espacio quedará libre.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'Volver'
        });

        if (result.isConfirmed) {
            try {
                await reservasService.cancelar(id);
                await cargarReservas();
                Swal.fire('Cancelada', 'La reserva ha sido cancelada.', 'success');
            } catch (error) {
                console.error("Error al cancelar reserva:", error);
                Swal.fire('Error', 'No se pudo cancelar la reserva.', 'error');
            }
        }
    };

    const getEspacioNombre = (item) => {
        if (item.espacio?.nombre) {
            return item.espacio.nombre;
        }
        const espacio = espacios.find(e => e.idEspacios === item.espacioId);
        return espacio?.nombre || `ID: ${item.espacioId}`;
    };

    const formatFecha = (fechaISO) => {
        if (!fechaISO) return "-";
        const fecha = new Date(fechaISO);
        const day = String(fecha.getDate()).padStart(2, '0');
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const year = fecha.getFullYear();
        const hours = String(fecha.getHours()).padStart(2, '0');
        const minutes = String(fecha.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };



    // Función para calcular el estado en tiempo real
    const getEstadoReserva = (reserva) => {
        // 1. Si ya estaba cancelada en BD, se queda cancelada
        if (reserva.estatusReserva === false) {
            return { texto: "Cancelada", color: "danger", finalizada: true };
        }

        const ahora = new Date();
        const inicio = new Date(reserva.fechaInicio);
        const fin = new Date(reserva.fechaFin);

        // 2. Si la hora actual es mayor al fin -> COMPLETADA
        if (ahora > fin) {
            return { texto: "Completada", color: "secondary", finalizada: true };
        }

        // 3. Si estamos dentro del rango -> EN CURSO
        if (ahora >= inicio && ahora <= fin) {
            return {
                texto: "En Curso",
                color: "primary", // Azul o el color que prefieras
                finalizada: false,
                animado: true // Para ponerle un efectito visual

            };
        }

        // 4. Si aún no empieza -> PROGRAMADA (Activa)
        return { texto: "Programada", color: "success", finalizada: false };
    };



    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Reservas</h2>
                <Button className='btn' variant="outline-primary" onClick={handleOpenCreate}>
                    <MdAdd size={20} /> Nueva Reserva
                </Button>
            </div>

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
                            reservas.map((item) => {
                                // Calculamos el estado de esta fila
                                const estado = getEstadoReserva(item);

                                return (
                                    <tr
                                        key={item.idReserva}
                                        style={{
                                            // Bajamos la opacidad si está cancelada o completada
                                            opacity: estado.finalizada ? 0.6 : 1,
                                            backgroundColor: estado.texto === "Cancelada" ? '#fff5f5' : 'transparent'
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

                                        {/* COLUMNA DE ESTATUS DINÁMICO */}
                                        <td className="text-center">
                                            <Badge
                                                bg={estado.color}
                                                // Usamos d-inline-flex para que no se estire a lo ancho de toda la celda
                                                className={estado.animado ? "d-inline-flex align-items-center gap-1 faa-pulse animated" : ""}
                                                style={{ verticalAlign: 'middle' }} // Asegura centrado perfecto con la línea
                                            >
                                                {estado.animado && (
                                                    <span
                                                        className="spinner-grow spinner-grow-sm"
                                                        style={{ width: '6px', height: '6px' }} // Ajusté un poco el tamaño para que sea más sutil
                                                        role="status"
                                                        aria-hidden="true"
                                                    ></span>
                                                )}
                                                {estado.texto}
                                            </Badge>
                                        </td>

                                        {/* ACCIONES (BLOQUEADAS SI YA TERMINÓ) */}
                                        <td className="text-center">
                                            {/* Solo permitimos editar/agregar si NO ha finalizado */}
                                            {!estado.finalizada && (
                                                <>
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
                                                        title="Gestionar Asistentes"
                                                    >
                                                        <MdPersonAdd />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleCancelarReserva(item.idReserva)}
                                                        title="Cancelar Reserva"
                                                    >
                                                        <MdDelete />
                                                    </Button>
                                                </>
                                            )}

                                            {/* Si ya acabó, mostramos un ícono o texto discreto */}
                                            {estado.texto === "Completada" && (
                                                <span className="text-muted small"><MdCheck /> Finalizada</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </div>

            <ReservasForm
                show={showModal}
                handleClose={handleCloseModal}
                handleSave={handleSaveReserva}
                reservaEditar={editingReserva}
                reservaEstatus={editingReserva?.estatusReserva}
                espacios={espacios}
            />

            <ReservasAsistentesModal
                show={showAsistentesModal}
                handleClose={handleCloseAsistentesModal}
                reserva={reservaSeleccionada}
            />
        </div>
    );
}