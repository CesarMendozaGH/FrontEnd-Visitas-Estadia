import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export const RegistrarVisitaModal = ({ show, handleClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombreVisitante: '',
        motivoVisita: '',
        aceptoTerminos: false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await onSuccess(formData);
            setFormData({ nombreVisitante: '', motivoVisita: '', aceptoTerminos: false });
            handleClose();
        } catch (error) {
            console.error("Error al registrar visita:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>📝 Registrar Nueva Visita</Modal.Title>
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
                            placeholder="Ej. Juan Pérez García"
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
                            placeholder="Ej. Reunión con el departamento de RH"
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
                        disabled={!formData.nombreVisitante || !formData.motivoVisita || !formData.aceptoTerminos || loading}
                    >
                        {loading ? 'Registrando...' : 'Registrar Entrada'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
