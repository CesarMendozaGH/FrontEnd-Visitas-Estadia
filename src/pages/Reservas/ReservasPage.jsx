import { useEffect, useState } from 'react';
import { reservasService } from '../../services/reservasServices';
import { espaciosService } from '../../services/espaciosServices';
import { ReservasForm } from './ReservasForm';
import { ReservasAsistentesModal } from './ReservasAsistentesModal';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import { MdAdd, MdEdit, MdDelete, MdPersonAdd, MdCheck, MdFilterList, MdMeetingRoom } from "react-icons/md";
import Swal from 'sweetalert2';

export function ReservasPage() {
    // 1. ESTADOS
    const [reservas, setReservas] = useState([]);
    const [espacios, setEspacios] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingReserva, setEditingReserva] = useState(null);

    const [showAsistentesModal, setShowAsistentesModal] = useState(false);
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

    // FILTROS
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstatus, setFiltroEstatus] = useState('ACTIVAS');
    const [filtroEspacio, setFiltroEspacio] = useState('TODOS'); // <-- NUEVO ESTADO PARA ESPACIOS

    // Manejo de roles y reloj
    const rolActual = localStorage.getItem('rol_dev');
    const isSuperAdmin = rolActual === 'SUPERADMIN';
    const [, setTick] = useState(0);

    // 2. EFECTOS
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        cargarReservas();
        cargarEspacios();
    }, []);

    // 3. FUNCIONES DE CARGA
    const cargarReservas = async () => {
        setLoading(true);
        try {
            const data = await reservasService.getAll();
            setReservas(data);
        } catch (error) {
            console.error("Error al cargar reservas:", error);
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

    // 4. MANEJO DE MODALES
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

    // 5. FUNCIONES AUXILIARES
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

    const getEstadoReserva = (reserva) => {
        if (reserva.estatusReserva === false) {
            return { texto: "Cancelada", color: "danger", finalizada: true, rawStatus: "CANCELADA" };
        }

        const ahora = new Date();
        const inicio = new Date(reserva.fechaInicio);
        const fin = new Date(reserva.fechaFin);

        if (ahora > fin) {
            return { texto: "Completada", color: "secondary", finalizada: true, rawStatus: "COMPLETADA" };
        }

        if (ahora >= inicio && ahora <= fin) {
            return { texto: " En Curso", color: "primary", finalizada: false, animado: true, rawStatus: "EN_CURSO" };
        }

        return { texto: "Programada", color: "success", finalizada: false, rawStatus: "PROGRAMADA" };
    };

    // ------------------------------------------------------------------
    // 6. LÓGICA DE PROCESAMIENTO DE DATOS EN CASCADA
    // ------------------------------------------------------------------
    
    // A. Calculamos el estado de todas
    const reservasConEstado = reservas.map(res => ({
        ...res,
        estadoObj: getEstadoReserva(res)
    }));

    // B. Filtramos por ESTATUS (Activas, Todas, Canceladas)
    const reservasFiltradasPorEstatus = reservasConEstado.filter(res => {
        if (filtroEstatus === 'TODAS') return true;
        if (filtroEstatus === 'ACTIVAS') {
            return res.estadoObj.rawStatus === 'PROGRAMADA' || res.estadoObj.rawStatus === 'EN_CURSO';
        }
        return res.estadoObj.rawStatus === filtroEstatus;
    });

    // C. Filtramos por ESPACIO
    const reservasFiltradasPorEspacio = reservasFiltradasPorEstatus.filter(res => {
        if (filtroEspacio === 'TODOS') return true;
        return res.espacioId.toString() === filtroEspacio;
    });

    // D. Filtramos por la CAJA DE BÚSQUEDA de texto, espacio y FECHA
    const reservasProcesadas = reservasFiltradasPorEspacio
        .filter(r => {
            const textoBuscado = busqueda.toLowerCase();
            const nombre = (r.nombreReservante || '').toLowerCase();
            const area = (r.areaReservante || '').toLowerCase();
            const nombreEspacio = (getEspacioNombre(r) || '').toLowerCase();
            
            // FORMATO DE FECHA PARA BÚSQUEDA: DD/MM/YYYY yyyy-MM-DD
            const fecha = new Date(r.fechaInicio);
            const day = String(fecha.getDate()).padStart(2, '0');
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const year = fecha.getFullYear();
            const fechaDisplay = `${day}/${month}/${year}`; // 25/03/2026
            const fechaISO = `${year}-${month}-${day}`;     // 2026-03-25
            
            // Búsqueda por: nombre, área, espacio, fecha (DD/MM/YYYY) o fecha ISO
            return nombre.includes(textoBuscado) || 
                   area.includes(textoBuscado) || 
                   nombreEspacio.includes(textoBuscado) ||
                   fechaDisplay.includes(textoBuscado) ||
                   fechaISO.includes(textoBuscado);
        })
        .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));

    // 7. RENDER
    return (
        <div>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <h2>Gestión de Reservas</h2>

                <div className="d-flex flex-wrap gap-2 align-items-center">
                    
                    {/* NUEVO: SELECTOR DE ESPACIOS */}
                    <div className="d-flex align-items-center gap-2 bg-white px-3 py-1 rounded shadow-sm border">
                        <MdMeetingRoom size={20} className="text-muted" />
                        <Form.Select
                            value={filtroEspacio}
                            onChange={(e) => setFiltroEspacio(e.target.value)}
                            className="border-0 shadow-none fw-semibold"
                            style={{ cursor: 'pointer', minWidth: '160px' }}
                        >
                            <option value="TODOS">Todos los Espacios</option>
                            {espacios.map(esp => (
                                <option key={esp.idEspacios} value={esp.idEspacios.toString()}>
                                    {esp.nombre}
                                </option>
                            ))}
                        </Form.Select>
                    </div>

                    {/* SELECTOR DE ESTATUS (Intacto, sin borrar) */}
                    <div className="d-flex align-items-center gap-2 bg-white px-3 py-1 rounded shadow-sm border">
                        <MdFilterList size={20} className="text-muted" />
                        <Form.Select
                            value={filtroEstatus}
                            onChange={(e) => setFiltroEstatus(e.target.value)}
                            className="border-0 shadow-none fw-semibold"
                            style={{ cursor: 'pointer', minWidth: '160px' }}
                        >
                            <option value="ACTIVAS">Solo Activas</option>
                            <option value="PROGRAMADA">Próximas (Programadas)</option>
                            <option value="EN_CURSO">En Curso Ahora</option>
                            <option value="COMPLETADA">Historial (Completadas)</option>
                            <option value="CANCELADA">Canceladas</option>
                            <option value="TODAS">Ver Todas</option>
                        </Form.Select>
                    </div>

                    <Button variant="primary" onClick={handleOpenCreate} className="d-flex align-items-center gap-1">
                        <MdAdd size={20} /> Nueva Reserva
                    </Button>
                </div>
            </div>
            
            <div className="w-50">
                <Form.Control
                    type="text"
                    placeholder="Buscar por reservante, área, espacio o fecha (ej: 25/03/2026)..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="mb-3 shadow-sm border-primary"
                />
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
                        ) : reservasProcesadas.length === 0 ? (
                            <tr><td colSpan="9" className="text-center py-4 text-muted">No se encontraron reservas para tu búsqueda.</td></tr>
                        ) : (
                            reservasProcesadas.map((item) => {
                                const estado = item.estadoObj || {
                                    finalizada: false,
                                    texto: "Desconocido",
                                    color: "secondary",
                                    animado: false
                                };

                                return (
                                    <tr
                                        key={item.idReserva}
                                        style={{
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

                                        <td className="text-center">
                                            <Badge
                                                bg={estado.color}
                                                className={estado.animado ? "d-inline-flex align-items-center gap-1 faa-pulse animated" : ""}
                                                style={{ verticalAlign: 'middle' }}
                                            >
                                                {estado.animado && (
                                                    <span
                                                        className="spinner-grow spinner-grow-sm"
                                                        style={{ width: '6px', height: '6px' }}
                                                        role="status"
                                                        aria-hidden="true"
                                                    ></span>
                                                )}
                                                {estado.texto}
                                            </Badge>
                                        </td>

                                        <td className="text-center">
                                            <div className="btn-group d-flex justify-content-center align-items-center">

                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleOpenAsistentes(item)}
                                                    title={estado.finalizada ? "Ver Lista de Asistentes" : "Gestionar Asistentes"}
                                                >
                                                    <MdPersonAdd />
                                                </Button>

                                                {(!estado.finalizada || isSuperAdmin) && (
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="ms-1"
                                                        onClick={() => handleOpenEdit(item)}
                                                        title="Editar"
                                                    >
                                                        <MdEdit />
                                                    </Button>
                                                )}

                                                {(!estado.finalizada && isSuperAdmin) && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="ms-1"
                                                        onClick={() => handleCancelarReserva(item.idReserva)}
                                                        title="Cancelar Reserva"
                                                    >
                                                        <MdDelete />
                                                    </Button>
                                                )}
                                            </div>

                                            {estado.texto === "Completada" && !isSuperAdmin && (
                                                <div className="text-muted small mt-1"><MdCheck /> Finalizada</div>
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
        </div >
    );
}