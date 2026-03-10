import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { MdAdd, MdAddCircleOutline, MdAddReaction, MdAddToQueue } from 'react-icons/md';

export const RegistrarVisitaModal = ({ show, handleClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombreVisitante: '',
        motivoVisita: '',
        aceptoTerminos: false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // 1. SANITIZACIÓN AL ESCRIBIR: Pasamos a mayúsculas si es texto
        const valorSanitizado = type === 'checkbox' ? checked : value.toUpperCase();

        setFormData({ 
            ...formData, 
            [name]: valorSanitizado 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 2. SANITIZACIÓN FINAL ANTES DE ENVIAR: Aplicamos trim()
        const datosLimpios = {
            ...formData,
            nombreVisitante: formData.nombreVisitante.trim(),
            motivoVisita: formData.motivoVisita.trim()
        };

        // Extra validación de seguridad por si lograron saltarse el botón disabled
        if (!datosLimpios.nombreVisitante || !datosLimpios.motivoVisita) {
            return; 
        }

        setLoading(true);
        
        try {
            await onSuccess(datosLimpios); // Enviamos los datos limpios al backend
            setFormData({ nombreVisitante: '', motivoVisita: '', aceptoTerminos: false });
            handleClose();
        } catch (error) {
            console.error("Error al registrar visita:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. VALIDACIÓN DEL BOTÓN: Usamos trim() para que no acepten "   " como texto válido
    const isFormValid = 
        formData.nombreVisitante.trim().length > 0 && 
        formData.motivoVisita.trim().length > 0 && 
        formData.aceptoTerminos;

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} size="lg">
            <Modal.Header closeButton>
                <Modal.Title><><MdAddCircleOutline/> Registrar Nueva Visitas </></Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre del Visitante *</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombreVisitante"
                            value={formData.nombreVisitante}
                            onChange={handleChange}
                            required
                            placeholder="Ej. JUAN PÉREZ GARCÍA"
                            autoFocus
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Motivo de la Visita *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="motivoVisita"
                            value={formData.motivoVisita}
                            onChange={handleChange}
                            required
                            placeholder="Ej. REUNIÓN CON EL DEPARTAMENTO DE RH"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check 
                            type="checkbox"
                            name="aceptoTerminos"
                            label="Acepto los términos y condiciones de acceso"
                            checked={formData.aceptoTerminos}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Text className="text-muted">
                        <small>
                            La hora de entrada se registrará automáticamente al momento de guardar.
                            <br />
                            <strong>Nota:</strong> Si es la primera visita del día, se creará automáticamente la bitácora correspondiente.
                        </small>
                    </Form.Text>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={!isFormValid || loading} // Usamos nuestra variable validada
                    >
                        {loading ? 'Registrando...' : 'Registrar Entrada'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};