import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { reservasService } from '../../services/reservasServices';
import { MdAdd, MdDelete, MdCheck } from "react-icons/md";
import Swal from 'sweetalert2';

export function ReservasAsistentesModal({ show, handleClose, reserva }) {
    const [asistentes, setAsistentes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [asistentesTemp, setAsistentesTemp] = useState([]);
    const [nuevoAsistente, setNuevoAsistente] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: ''
    });

    useEffect(() => {
        if (show && reserva) {
            cargarAsistentes();
            setAsistentesTemp([]); // Limpiamos temporales al abrir
        }
    }, [show, reserva]);

    const cargarAsistentes = async () => {
        setLoading(true);
        try {
            const data = await reservasService.getAsistentes(reserva.idReserva);
            setAsistentes(data);
        } catch (error) {
            console.error("Error al cargar asistentes:", error);
            setAsistentes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAsistente = () => {
        if (nuevoAsistente.nombre.trim() && nuevoAsistente.apellidoPaterno.trim()) {
            setAsistentesTemp([
                ...asistentesTemp,
                {
                    nombre: nuevoAsistente.nombre,
                    apellidoPaterno: nuevoAsistente.apellidoPaterno,
                    apellidoMaterno: nuevoAsistente.apellidoMaterno
                }
            ]);
            setNuevoAsistente({
                nombre: '',
                apellidoPaterno: '',
                apellidoMaterno: ''
            });
        }
    };

    const handleRemoveAsistenteTemp = (index) => {
        const updated = [...asistentesTemp];
        updated.splice(index, 1);
        setAsistentesTemp(updated);
    };

    const handleGuardarAsistentes = async () => {
        if (asistentesTemp.length === 0) {
            Swal.fire({
                title: "No hay asistentes nuevos",
                text: "Agrega al menos una persona a la lista temporal.",
                icon: "warning"
            });
            return;
        }

        try {
            await reservasService.agregarAsistentes(reserva.idReserva, asistentesTemp);
            setAsistentesTemp([]);
            cargarAsistentes();
            
            Swal.fire({
                title: "¡Guardado!",
                text: "Asistentes registrados correctamente.",
                icon: "success",
                timer: 800,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error al guardar asistentes:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudieron guardar los asistentes.",
                icon: "error"
            });
        }
    };

    const handleToggleAsistencia = async (idAsistente) => {
        try {
            await reservasService.toggleAsistencia(idAsistente);
            cargarAsistentes();
            // Opcional: Toast pequeño para confirmar acción rápida
            /* Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Estatus actualizado',
                showConfirmButton: false,
                timer: 1000
            }); */
        } catch (error) {
            console.error("Error al cambiar asistencia:", error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Error al cambiar estatus',
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    const handleCheckinMasivo = async () => {
        // Obtener IDs de asistentes que aún no han asistido
        const idsPendientes = asistentes
            .filter(a => !a.asistio)
            .map(a => a.idLista);

        if (idsPendientes.length === 0) {
            Swal.fire({
                title: "Sin pendientes",
                text: "Todos los asistentes ya tienen su asistencia registrada.",
                icon: "info"
            });
            return;
        }

        try {
            await reservasService.checkinMasivo(idsPendientes);
            cargarAsistentes();

            Swal.fire({
                title: "¡Check-in Masivo!",
                text: `Se registró la asistencia de ${idsPendientes.length} personas.`,
                icon: "success"
            });
        } catch (error) {
            console.error("Error en check-in masivo:", error);
            Swal.fire({
                title: "Error",
                text: "Hubo un problema al registrar las asistencias.",
                icon: "error"
            });
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    Gestión de Asistentes - Reserva #{reserva?.idReserva}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Formulario para agregar nuevos asistentes */}
                <div className="bg-light p-3 rounded mb-4 border">
                    <h6 className="fw-bold text-primary">Agregar Nuevo Asistente</h6>
                    <div className="row g-2 align-items-end">
                        <div className="col-md-4">
                            <Form.Label>Nombre *</Form.Label>
                            <Form.Control
                                type="text"
                                value={nuevoAsistente.nombre}
                                onChange={(e) => setNuevoAsistente(prev => ({ ...prev, nombre: e.target.value }))}
                                placeholder="Ej. Juan"
                            />
                        </div>
                        <div className="col-md-3">
                            <Form.Label>Apellido Paterno *</Form.Label>
                            <Form.Control
                                type="text"
                                value={nuevoAsistente.apellidoPaterno}
                                onChange={(e) => setNuevoAsistente(prev => ({ ...prev, apellidoPaterno: e.target.value }))}
                                placeholder="Ej. Pérez"
                            />
                        </div>
                        <div className="col-md-3">
                            <Form.Label>Apellido Materno</Form.Label>
                            <Form.Control
                                type="text"
                                value={nuevoAsistente.apellidoMaterno}
                                onChange={(e) => setNuevoAsistente(prev => ({ ...prev, apellidoMaterno: e.target.value }))}
                                placeholder="Ej. López"
                            />
                        </div>
                        <div className="col-md-2">
                            <Button variant="primary" onClick={handleAddAsistente} className="w-100">
                                <MdAdd /> Agregar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Lista temporal de asistentes nuevos */}
                {asistentesTemp.length > 0 && (
                    <div className="mb-4 p-3 border rounded border-warning bg-light">
                        <h6 className="fw-bold text-warning">Por Guardar ({asistentesTemp.length})</h6>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                            {asistentesTemp.map((asistente, index) => (
                                <div key={index} className="badge bg-warning text-dark d-flex align-items-center gap-2 p-2 shadow-sm">
                                    <span>{asistente.nombre} {asistente.apellidoPaterno}</span>
                                    <MdDelete
                                        className="text-danger"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleRemoveAsistenteTemp(index)}
                                        title="Quitar"
                                    />
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="success"
                            size="sm"
                            onClick={handleGuardarAsistentes}
                        >
                            <MdCheck /> Guardar estos {asistentesTemp.length} Asistentes
                        </Button>
                    </div>
                )}

                {/* Tabla de asistentes registrados */}
                <h6 className="fw-bold mt-4">Lista Oficial ({asistentes.length})</h6>
                <div className="table-responsive shadow-sm border rounded">
                    <Table striped hover size="sm" className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Nombre Completo</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" className="text-center py-3">Cargando...</td></tr>
                            ) : asistentes.length === 0 ? (
                                <tr><td colSpan="3" className="text-center py-3 text-muted">No hay asistentes registrados aún.</td></tr>
                            ) : (
                                asistentes.map((asistente) => (
                                    <tr key={asistente.idLista}>
                                        <td className="fw-500">
                                            {asistente.nombre} {asistente.apellidoPaterno} {asistente.apellidoMaterno}
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge rounded-pill ${asistente.asistio ? 'bg-success' : 'bg-secondary'}`}>
                                                {asistente.asistio ? 'ASISTIÓ' : 'PENDIENTE'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                variant={asistente.asistio ? "outline-secondary" : "outline-success"}
                                                size="sm"
                                                onClick={() => handleToggleAsistencia(asistente.idLista)}
                                                title={asistente.asistio ? "Marcar como no asistió" : "Marcar asistencia"}
                                            >
                                                {asistente.asistio ? 'Desmarcar' : 'Check-In'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>

                {asistentes.length > 0 && (
                    <div className="mt-3 text-end">
                        <Button
                            variant="outline-primary"
                            onClick={handleCheckinMasivo}
                        >
                            <MdCheck /> Marcar Todos como Asistidos
                        </Button>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar Ventana
                </Button>
            </Modal.Footer>
        </Modal>
    );
}