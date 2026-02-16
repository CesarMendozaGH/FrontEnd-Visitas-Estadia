import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export const ComunitarioForm = ({ show, handleClose, handleSave }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        horasTotalesDeuda: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        handleSave(formData);
        // Limpiar form
        setFormData({ nombre: '', apellidoPaterno: '', apellidoMaterno: '', horasTotalesDeuda: '' });
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Alta de Servicio Comunitario</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSubmit}>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required autoFocus />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Apellido Paterno</Form.Label>
                            <Form.Control name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} required />
                        </div>
                    </div>
                    <Form.Group className="mb-3">
                        <Form.Label>Apellido Materno (Opcional)</Form.Label>
                        <Form.Control name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-danger">Horas Totales de Deuda</Form.Label>
                        <Form.Control 
                            type="number" 
                            name="horasTotalesDeuda" 
                            value={formData.horasTotalesDeuda} 
                            onChange={handleChange} 
                            required 
                            min="1" 
                            placeholder="Ej. 36 horas"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" type="submit">Guardar Expediente</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};