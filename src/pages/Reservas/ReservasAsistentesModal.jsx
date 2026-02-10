import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { reservasService } from '../../services/reservasServices';
import { MdAdd, MdDelete, MdCheck } from "react-icons/md";

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
            alert("No hay asistentes nuevos para guardar.");
            return;
        }

        try {
            await reservasService.agregarAsistentes(reserva.idReserva, asistentesTemp);
            setAsistentesTemp([]);
            cargarAsistentes();
            alert("Asistentes guardados correctamente.");
        } catch (error) {
            console.error("Error al guardar asistentes:", error);
            alert("Error al guardar asistentes.");
        }
    };

    const handleToggleAsistencia = async (idAsistente) => {
        try {
            await reservasService.toggleAsistencia(idAsistente);
            cargarAsistentes();
        } catch (error) {
            console.error("Error al cambiar asistencia:", error);
        }
    };

    const handleCheckinMasivo = async () => {
        // Obtener IDs de asistentes que aún no han asistido
        const idsPendientes = asistentes
            .filter(a => !a.asistio)
            .map(a => a.idLista);

        if (idsPendientes.length === 0) {
            alert("No hay asistentes pendientes por registrar.");
            return;
        }

        try {
            await reservasService.checkinMasivo(idsPendientes);
            cargarAsistentes();
            alert("Asistencia masiva registrada.");
        } catch (error) {
            console.error("Error en check-in masivo:", error);
            alert("Error al registrar asistencia masiva.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    Gestión de Asistentes - Reserva #{reserva?.idReserva}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Formulario para agregar nuevos asistentes */}
                <div className="bg-light p-3 rounded mb-4">
                    <h6>Agregar Nuevo Asistente</h6>
                    <div className="row g-2 align-items-end">
                        <div className="col-md-4">
                            <Form.Label>Nombre *</Form.Label>
                            <Form.Control 
                                type="text"
                                value={nuevoAsistente.nombre}
                                onChange={(e) => setNuevoAsistente(prev => ({ ...prev, nombre: e.target.value }))}
                                placeholder="Nombre"
                            />
                        </div>
                        <div className="col-md-3">
                            <Form.Label>Apellido Paterno *</Form.Label>
                            <Form.Control 
                                type="text"
                                value={nuevoAsistente.apellidoPaterno}
                                onChange={(e) => setNuevoAsistente(prev => ({ ...prev, apellidoPaterno: e.target.value }))}
                                placeholder="Apellido paterno"
                            />
                        </div>
                        <div className="col-md-3">
                            <Form.Label>Apellido Materno</Form.Label>
                            <Form.Control 
                                type="text"
                                value={nuevoAsistente.apellidoMaterno}
                                onChange={(e) => setNuevoAsistente(prev => ({ ...prev, apellidoMaterno: e.target.value }))}
                                placeholder="Apellido materno"
                            />
                        </div>
                        <div className="col-md-2">
                            <Button variant="primary" onClick={handleAddAsistente}>
                                <MdAdd /> Agregar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Lista temporal de asistentes nuevos */}
                {asistentesTemp.length > 0 && (
                    <div className="mb-4">
                        <h6>Asistentes por Guardar ({asistentesTemp.length})</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {asistentesTemp.map((asistente, index) => (
                                <div key={index} className="badge bg-primary d-flex align-items-center gap-2 p-2">
                                    <span>{asistente.nombre} {asistente.apellidoPaterno}</span>
                                    <MdDelete 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleRemoveAsistenteTemp(index)}
                                    />
                                </div>
                            ))}
                        </div>
                        <Button 
                            variant="success" 
                            size="sm" 
                            className="mt-2"
                            onClick={handleGuardarAsistentes}
                        >
                            Guardar {asistentesTemp.length} Asistentes
                        </Button>
                    </div>
                )}

                {/* Tabla de asistentes registrados */}
                <h6>Asistentes Registrados ({asistentes.length})</h6>
                <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre Completo</th>
                                <th>Asistió</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center">Cargando...</td></tr>
                            ) : asistentes.length === 0 ? (
                                <tr><td colSpan="4" className="text-center">No hay asistentes registrados.</td></tr>
                            ) : (
                                asistentes.map((asistente) => (
                                    <tr key={asistente.idLista}>
                                        <td>{asistente.idLista}</td>
                                        <td>
                                            {asistente.nombre} {asistente.apellidoPaterno} {asistente.apellidoMaterno}
                                        </td>
                                        <td>
                                            <span className={`badge ${asistente.asistio ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {asistente.asistio ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                        <td>
                                            <Button 
                                                variant={asistente.asistio ? "outline-warning" : "outline-success"}
                                                size="sm"
                                                onClick={() => handleToggleAsistencia(asistente.idLista)}
                                            >
                                                <MdCheck /> {asistente.asistio ? 'Cancelar' : 'Registrar'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>

                {asistentes.length > 0 && (
                    <Button 
                        variant="outline-primary" 
                        onClick={handleCheckinMasivo}
                        className="mt-2"
                    >
                        Marcar Todos como Asistidos
                    </Button>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
