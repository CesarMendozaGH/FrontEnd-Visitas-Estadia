import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export const EspaciosForm = ({ show, handleClose, handleSave, espacioEditar }) => {
    // Estado inicial del formulario
    const [formData, setFormData] = useState({
        idEspacios: 0,
        nombre: '',
        
        capacidad: 0,
        activo: true
    });

    // Cuando cambia el espacio a editar (o es nuevo), actualizamos el formulario
    useEffect(() => {
        if (espacioEditar) {
            setFormData(espacioEditar);
        } else {
            // Resetear si es nuevo
            setFormData({ idEspacios: 0, nombre: '', capacidad: 0, activo: true });
        }
    }, [espacioEditar, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        handleSave(formData);
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>{espacioEditar ? 'Editar Espacio' : 'Nuevo Espacio'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre del Espacio</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            placeholder="Ej. Sala de Juntas A"
                            autoFocus
                        />
                    </Form.Group>


                    <Form.Group className="mb-3">
                        <Form.Label>Capacidad (Personas)</Form.Label>
                        <Form.Control
                            type="number"
                            name="capacidad"
                            value={formData.capacidad}
                            onChange={handleChange}
                            required
                            min="1"
                            max="100"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit">
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};