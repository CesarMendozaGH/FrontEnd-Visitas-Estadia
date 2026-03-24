import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';

// IMPORTAMOS FLATPICKR Y SU IDIOMA
import Flatpickr from 'react-flatpickr';
import "flatpickr/dist/flatpickr.min.css";
import { Spanish } from 'flatpickr/dist/l10n/es.js';

export function ReservasForm({ show, handleClose, handleSave, reservaEditar, espacios, reservaEstatus }) {
    const isSuperAdmin = localStorage.getItem('rol_dev') === 'SUPERADMIN';

    const [formData, setFormData] = useState({
        idReserva: 0,
        espacioId: '',
        nombreReservante: '',
        areaReservante: '',
        institucionVisitante: '',
        representanteVisita: '',
        numeroPersonas: 1,
        requerimientosEspecialesJson: '',
        fechaReserva: '', // UNIFICAMOS LA FECHA
        horaInicio: '',
        horaFin: ''
    });

    useEffect(() => {
        const parsearFechaLocal = (fechaISO) => {
            if (!fechaISO) return { fecha: '', hora: '' };
            const partes = fechaISO.split('T');
            const fecha = partes[0];
            const hora = partes[1] ? partes[1].substring(0, 5) : '';
            return { fecha, hora };
        };

        if (reservaEditar) {
            // Como ahora es el mismo día, solo sacamos la fecha del inicio
            const inicio = parsearFechaLocal(reservaEditar.fechaInicio);
            const fin = parsearFechaLocal(reservaEditar.fechaFin);

            setFormData({
                idReserva: reservaEditar.idReserva,
                espacioId: reservaEditar.espacioId,
                nombreReservante: reservaEditar.nombreReservante,
                areaReservante: reservaEditar.areaReservante,
                institucionVisitante: reservaEditar.institucionVisitante || '',
                representanteVisita: reservaEditar.representanteVisita || '',
                numeroPersonas: reservaEditar.numeroPersonas,
                requerimientosEspecialesJson: reservaEditar.requerimientosEspecialesJson || '',
                fechaReserva: inicio.fecha, // FECHA ÚNICA
                horaInicio: inicio.hora,
                horaFin: fin.hora
            });
        } else {
            setFormData({
                idReserva: 0, espacioId: '', nombreReservante: '', areaReservante: '',
                institucionVisitante: '', representanteVisita: '', numeroPersonas: 1,
                requerimientosEspecialesJson: '', fechaReserva: '', horaInicio: '', horaFin: ''
            });
        }
    }, [reservaEditar, show]);

    const handleChange = (e) => {
        const { name, value, type, tagName } = e.target;
        // Convertimos a MAYÚSCULAS en tiempo real mientras el usuario escribe
        const esTexto = type === 'text' || type === 'textarea' || tagName?.toLowerCase() === 'textarea';
        const valorSanitizado = esTexto ? value.toUpperCase() : value;

        setFormData(prev => ({ ...prev, [name]: valorSanitizado }));
    };

    // LÓGICA DE 15 DÍAS DE ANTICIPACIÓN
    const getMinStartDate = () => {
        if (isSuperAdmin) return null; // Sin límite

        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 15);
        const minDateStr = hoy.toISOString().split('T')[0];

        if (reservaEditar && formData.fechaReserva && formData.fechaReserva < minDateStr) {
            return formData.fechaReserva;
        }
        return minDateStr;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // VALIDACIÓN DE HORAS (Como es el mismo día, solo comparamos las horas)
        if (formData.horaFin <= formData.horaInicio) {
            Swal.fire('Error de Horario', 'La hora de término debe ser mayor a la hora de inicio.', 'error');
            return;
        }

        // ARMAMOS EL PAQUETE PARA EL BACKEND (Uniendo la misma fecha con las 2 horas distintas)
        // Los campos de texto ya están en MAYÚSCULAS gracias a handleChange
        const payload = {
            idReserva: formData.idReserva,
            espacioId: parseInt(formData.espacioId),
            nombreReservante: formData.nombreReservante.trim(),
            areaReservante: formData.areaReservante.trim(),
            institucionVisitante: formData.institucionVisitante.trim(),
            representanteVisita: formData.representanteVisita.trim(),
            numeroPersonas: parseInt(formData.numeroPersonas),
            requerimientosEspecialesJson: formData.requerimientosEspecialesJson.trim(),
            fechaInicio: `${formData.fechaReserva}T${formData.horaInicio}:00`,
            fechaFin: `${formData.fechaReserva}T${formData.horaFin}:00`
        };

        if (!payload.nombreReservante || !payload.areaReservante) return;

        handleSave(payload, reservaEstatus);
    };

    const isFormValid = formData.espacioId !== '' && formData.nombreReservante.trim().length > 0 &&
        formData.areaReservante.trim().length > 0 && formData.fechaReserva !== '' && 
        formData.horaInicio !== '' && formData.horaFin !== '';

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{reservaEditar ? 'Editar Reserva' : 'Nueva Reserva'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <div className="row">
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Espacio *</Form.Label>
                            <Form.Select name="espacioId" value={formData.espacioId} onChange={handleChange} required>
                                <option value="">Seleccionar espacio...</option>
                                {espacios.map(espacio => (
                                    <option key={espacio.idEspacios} value={espacio.idEspacios}>{espacio.nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Número de Personas *</Form.Label>
                            <Form.Control type="number" name="numeroPersonas" value={formData.numeroPersonas} onChange={handleChange} min="1" max="100" required />
                        </Form.Group>
                    </div>

                    <div className="row">
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Nombre del Reservante *</Form.Label>
                            <Form.Control type="text" maxLength="100" name="nombreReservante" value={formData.nombreReservante} onChange={handleChange} placeholder="NOMBRE COMPLETO" required />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Área/Departamento *</Form.Label>
                            <Form.Control type="text" maxLength="50" name="areaReservante" value={formData.areaReservante} onChange={handleChange} placeholder="ÁREA DEL RESERVANTE" required />
                        </Form.Group>
                    </div>

                    <div className="row">
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Institución Visitante (Opcional)</Form.Label>
                            <Form.Control type="text"  maxLength="100" name="institucionVisitante" value={formData.institucionVisitante} onChange={handleChange} placeholder="INSTITUCIÓN O EMPRESA" />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Representante de la Visita (Opcional)</Form.Label>
                            <Form.Control type="text" maxLength="100" name="representanteVisita" value={formData.representanteVisita} onChange={handleChange} placeholder="NOMBRE DEL REPRESENTANTE" />
                        </Form.Group>
                    </div>

                    {/* SECCIÓN UNIFICADA DE FECHA Y HORAS */}
                    <div className="row bg-light p-3 rounded mx-1 mb-3 border">
                        <Form.Group className="col-md-4">
                            <Form.Label className="fw-bold text-primary">Fecha de la Reserva *</Form.Label>
                            <Flatpickr
                                value={formData.fechaReserva}
                                onChange={([date]) => {
                                    if(date) {
                                        // Formateamos seguro a YYYY-MM-DD
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        setFormData(prev => ({ ...prev, fechaReserva: `${year}-${month}-${day}` }));
                                    }
                                }}
                                options={{
                                    locale: Spanish,
                                    minDate: getMinStartDate(),
                                    allowInput: false, // 🔒 ESTO BLOQUEA EL TECLADO (Solución a tu vulnerabilidad)
                                    disableMobile: "true" // Fuerza el diseño bonito en móviles
                                }}
                                className="form-control bg-white" // Fondo blanco para que no parezca deshabilitado
                                
                                placeholder="Selecciona el día..."
                                required
                            />
                            {!isSuperAdmin && !reservaEditar && (
                                <Form.Text className="text-danger" style={{fontSize: '0.75rem'}}>* Requiere 15 días de anticipación.</Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="col-md-4">
                            <Form.Label>Hora de Inicio *</Form.Label>
                            <Form.Control type="time" name="horaInicio" value={formData.horaInicio} onChange={handleChange} required />
                            
                        </Form.Group>

                        <Form.Group className="col-md-4">
                            <Form.Label>Hora de Fin *</Form.Label>
                            <Form.Control type="time" name="horaFin" value={formData.horaFin} onChange={handleChange} required />
                        </Form.Group>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Requerimientos Especiales (Opcional)</Form.Label>
                        <Form.Control as="textarea" maxLength="500" rows={3} name="requerimientosEspecialesJson" value={formData.requerimientosEspecialesJson} onChange={handleChange} placeholder="EJ: PROYECTOR, PANTALLA, ACCESIBILIDAD, ETC." />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                        <Button variant="primary" type="submit" disabled={!isFormValid}>
                            {reservaEditar ? 'Actualizar' : 'Crear Reserva'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}