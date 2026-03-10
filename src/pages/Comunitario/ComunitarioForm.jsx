import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { BACKEND_BASE_URL } from '../../api/apiConfig';
import { MdAdd, MdAddAlert, MdAddBox, MdAddCall, MdAddCard, MdAddCircle, MdAddComment, MdEdit } from 'react-icons/md';

export const ComunitarioForm = ({ show, handleClose, handleSave, perfilEditar }) => {
    const [formData, setFormData] = useState({
        idPerfilComunitario: 0,
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        horasTotalesDeuda: '',
        horasAcumuladasActuales: 0
    });
    
    // NUEVO ESTADO PARA LA FOTO
    const [fotoRostro, setFotoRostro] = useState(null);
    
    useEffect(() => {
        setFotoRostro(null);

        if (perfilEditar) {
            setFormData({
                idPerfilComunitario: perfilEditar.idPerfilComunitario,
                nombre: perfilEditar.nombre,
                apellidoPaterno: perfilEditar.apellidoPaterno,
                apellidoMaterno: perfilEditar.apellidoMaterno || '',
                horasTotalesDeuda: perfilEditar.horasTotalesDeuda,
                horasAcumuladasActuales: perfilEditar.horasAcumuladasActuales || 0
            });
        } else {
            setFormData({
                idPerfilComunitario: 0,
                nombre: '',
                apellidoPaterno: '',
                apellidoMaterno: '',
                horasTotalesDeuda: '',
                horasAcumuladasActuales: 0
            });
        }
    }, [perfilEditar, show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFotoRostro(e.target.files[0]);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        handleSave(formData, fotoRostro);
    };

    const isSuperAdmin = localStorage.getItem('rol_dev') === 'SUPERADMIN';

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {perfilEditar ? <><MdEdit/>  Editar Expediente</> : <><MdAdd/> Alta de Servicio Comunitario</>}
                </Modal.Title>
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

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Label className="fw-bold text-danger">Deuda Total (Hrs)</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="horasTotalesDeuda" 
                                value={formData.horasTotalesDeuda} 
                                onChange={handleChange} 
                                required 
                                min="1" 
                            />
                        </div>

                        {perfilEditar && isSuperAdmin && (
                            <div className="col-md-6 mb-3">
                                <Form.Label className="fw-bold text-warning">Horas Acumuladas</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="horasAcumuladasActuales" 
                                    value={formData.horasAcumuladasActuales} 
                                    onChange={handleChange} 
                                    required 
                                    min="0" 
                                />
                            </div>
                        )}
                    </div>

                    {/* CAMPO DE FOTO CON VISTA PREVIA */}
                    <Form.Group className="mb-3">
                        <Form.Label>Foto de Rostro (Opcional)</Form.Label>
                        
                        {perfilEditar && perfilEditar.urlFotoRostro && (
                            <div className="mb-3 d-flex justify-content-center">
                                <img 
                                    src={`${BACKEND_BASE_URL}${perfilEditar.urlFotoRostro}`} 
                                    alt="Foto actual" 
                                    className="img-thumbnail rounded-circle shadow-sm"
                                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                />
                            </div>
                        )}

                        <Form.Control 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                        />
                        {perfilEditar && perfilEditar.urlFotoRostro && (
                            <Form.Text className="text-muted">
                                * Este perfil ya tiene una foto. Sube una nueva solo si deseas reemplazarla.
                            </Form.Text>
                        )}
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" type="submit">
                        {perfilEditar ? 'Guardar Cambios' : 'Crear Expediente'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};