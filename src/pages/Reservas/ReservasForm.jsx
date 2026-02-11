import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';


export function ReservasForm({ show, handleClose, handleSave, reservaEditar, espacios, reservaEstatus }) {
    const [formData, setFormData] = useState({
        idReserva: 0,
        espacioId: '',
        nombreReservante: '',
        areaReservante: '',
        institucionVisitante: '',
        representanteVisita: '',
        numeroPersonas: 1,
        requerimientosEspecialesJson: '',
        fechaInicio: '',
        horaInicio: '',
        fechaFin: '',
        horaFin: ''
    });

    // Cargar datos cuando se edita
    useEffect(() => {
        if (reservaEditar) {
            // Parsear fecha sin convertir a UTC
            const parsearFechaLocal = (fechaISO) => {
                if (!fechaISO) return { fecha: '', hora: '' };
                // Extraer fecha y hora directamente del string
                const partes = fechaISO.split('T');
                const fecha = partes[0];
                const hora = partes[1] ? partes[1].substring(0, 5) : '';
                return { fecha, hora };
            };

            const inicio = parsearFechaLocal(reservaEditar.fechaInicio);
            const fin = parsearFechaLocal(reservaEditar.fechaFin);

            setFormData({
                idReserva: reservaEditar.idReserva,
                espacioId: reservaEditar.espacioId,
                nombreReservante: reservaEditar.nombreReservante,
                areaReservante: reservaEditar.areaReservante,
                institucionVisitante: reservaEditar.institucionVisitante,
                representanteVisita: reservaEditar.representanteVisita,
                numeroPersonas: reservaEditar.numeroPersonas,
                requerimientosEspecialesJson: reservaEditar.requerimientosEspecialesJson || '',
                fechaInicio: inicio.fecha,
                horaInicio: inicio.hora,
                fechaFin: fin.fecha,
                horaFin: fin.hora
            });
        } else {
            // Reset form para crear nuevo
            setFormData({
                idReserva: 0,
                espacioId: '',
                nombreReservante: '',
                areaReservante: '',
                institucionVisitante: '',
                representanteVisita: '',
                numeroPersonas: 1,
                requerimientosEspecialesJson: '',
                fechaInicio: '',
                horaInicio: '',
                fechaFin: '',
                horaFin: ''
            });
        }
    }, [reservaEditar, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Combinar fecha y hora para crear ISO string (preservando hora local)
        // Usamos formato local sin convertir a UTC
        const payload = {
            idReserva: formData.idReserva,
            espacioId: parseInt(formData.espacioId),
            nombreReservante: formData.nombreReservante,
            areaReservante: formData.areaReservante,
            institucionVisitante: formData.institucionVisitante,
            representanteVisita: formData.representanteVisita,
            numeroPersonas: parseInt(formData.numeroPersonas),
            requerimientosEspecialesJson: formData.requerimientosEspecialesJson,
            fechaInicio: formData.fechaInicio && formData.horaInicio 
                ? `${formData.fechaInicio}T${formData.horaInicio}:00` 
                : null,
            fechaFin: formData.fechaFin && formData.horaFin 
                ? `${formData.fechaFin}T${formData.horaFin}:00` 
                : null
        };

        handleSave(payload, reservaEstatus);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {reservaEditar ? 'Editar Reserva' : 'Nueva Reserva'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <div className="row">
                        {/* Espacio */}
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Espacio *</Form.Label>
                            <Form.Select 
                                name="espacioId" 
                                value={formData.espacioId} 
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccionar espacio...</option>
                                {espacios.map(espacio => (
                                    <option key={espacio.idEspacios} value={espacio.idEspacios}>
                                        {espacio.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Número de personas */}
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Número de Personas *</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="numeroPersonas"
                                value={formData.numeroPersonas}
                                onChange={handleChange}
                                min="1"
                                max="100"
                                required
                            />
                        </Form.Group>
                    </div>

                    <div className="row">
                        {/* Nombre Reservante */}
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Nombre del Reservante *</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="nombreReservante"
                                value={formData.nombreReservante}
                                onChange={handleChange}
                                placeholder="Nombre completo"
                                required
                            />
                        </Form.Group>

                        {/* Área Reservante */}
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Área/Departamento *</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="areaReservante"
                                value={formData.areaReservante}
                                onChange={handleChange}
                                placeholder="Área del reservante"
                                required
                            />
                        </Form.Group>
                    </div>

                    <div className="row">
                        {/* Institución Visitante */}
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Institución Visitante</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="institucionVisitante"
                                value={formData.institucionVisitante}
                                onChange={handleChange}
                                placeholder="Institución o empresa"
                            />
                        </Form.Group>

                        {/* Representante de Visita */}
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Representante de la Visita</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="representanteVisita"
                                value={formData.representanteVisita}
                                onChange={handleChange}
                                placeholder="Nombre del representante"
                            />
                        </Form.Group>
                    </div>

                    <div className="row">
                        {/* Fecha y Hora Inicio */}
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Fecha y Hora de Inicio *</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control 
                                    type="date" 
                                    name="fechaInicio"
                                    value={formData.fechaInicio}
                                    onChange={handleChange}
                                    required
                                />
                                <Form.Control 
                                    type="time" 
                                    name="horaInicio"
                                    value={formData.horaInicio}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </Form.Group>

                        {/* Fecha y Hora Fin */}
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label>Fecha y Hora de Fin *</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control 
                                    type="date" 
                                    name="fechaFin"
                                    value={formData.fechaFin}
                                    onChange={handleChange}
                                    required
                                />
                                <Form.Control 
                                    type="time" 
                                    name="horaFin"
                                    value={formData.horaFin}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </Form.Group>
                    </div>

                    {/* Requerimientos Especiales */}
                    <Form.Group className="mb-3">
                        <Form.Label>Requerimientos Especiales</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3}
                            name="requerimientosEspecialesJson"
                            value={formData.requerimientosEspecialesJson}
                            onChange={handleChange}
                            placeholder="Ej: Proyector, pantalla, accesibilidad, etc."
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            {reservaEditar ? 'Actualizar' : 'Crear Reserva'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
