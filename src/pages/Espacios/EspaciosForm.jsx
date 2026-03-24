import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

// 1. 🚨 AQUÍ ESTABA EL ERROR: Faltaba recibir "espacios = []" como parámetro
export const EspaciosForm = ({ show, handleClose, handleSave, espacioEditar, espacios = [] }) => {
    
    // Estado inicial de los datos
    const [formData, setFormData] = useState({
        idEspacios: 0,
        nombre: '',
        capacidad: 1, // Mejor inicializar en 1
        activo: true
    });

    // 2. Estado para controlar si hay duplicados
    const [errorDuplicado, setErrorDuplicado] = useState(false);

    // Cuando cambia el espacio a editar (o es nuevo), actualizamos el formulario
    useEffect(() => {
        if (espacioEditar) {
            setFormData(espacioEditar);
            setErrorDuplicado(false); // Limpiamos el error al abrir uno existente
        } else {
            // Resetear si es nuevo
            setFormData({ idEspacios: 0, nombre: '', capacidad: 1, activo: true });
            setErrorDuplicado(false);
        }
    }, [espacioEditar, show]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        // Pasamos a mayúsculas solo si es texto
        const valorFinal = type === 'text' ? value.toUpperCase() : value;
        
        setFormData(prev => ({ ...prev, [name]: valorFinal }));

        // 3. VALIDACIÓN DE DUPLICADOS EN TIEMPO REAL
        if (name === 'nombre') {
            const nombreLimpio = valorFinal.trim();
            // Buscamos si ya existe alguien con ese nombre EXACTO
            const existe = espacios.some(esp => 
                esp.nombre.toUpperCase() === nombreLimpio && 
                esp.idEspacios !== formData.idEspacios
            );
            setErrorDuplicado(existe);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        
        // Bloqueo si hay duplicado
        if (errorDuplicado) return;

        // SANITIZACIÓN FINAL: Limpiamos los espacios sobrantes antes de guardar
        const datosLimpios = {
            ...formData,
            nombre: formData.nombre.trim()
        };

        // Protección extra
        if (!datosLimpios.nombre) return;

        handleSave(datosLimpios);
    };

    // VALIDACIÓN DEL BOTÓN: Bloqueamos si el nombre está vacío, si la capacidad es 0 o si hay error de duplicado
    const isFormValid = formData.nombre.trim().length > 0 && formData.capacidad > 0 && !errorDuplicado;

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>{espacioEditar ? 'Editar Espacio' : 'Nuevo Espacio'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSubmit}>
                <Modal.Body>
                    
                    {/* CAMPO: NOMBRE DEL ESPACIO */}
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre del Espacio *</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            maxLength="50"
                            placeholder="Ej. SALA DE JUNTAS A"
                            autoFocus
                            // Se pone en rojo si hay duplicado o si teclea puros espacios
                            isInvalid={errorDuplicado || (formData.nombre.length > 0 && formData.nombre.trim().length === 0)}
                        />
                        <Form.Control.Feedback type="invalid" className="fw-bold">
                            {errorDuplicado 
                                ? ' Ya existe un espacio registrado con este nombre.' 
                                : ' El nombre no puede ser solo espacios en blanco.'}
                        </Form.Control.Feedback>
                        
                        {!errorDuplicado && formData.nombre.trim().length > 0 && (
                            <Form.Text className="text-muted">
                                Máximo 50 caracteres. ({formData.nombre.length}/50)
                            </Form.Text>
                        )}
                    </Form.Group>

                    {/* CAMPO: CAPACIDAD */}
                    <Form.Group className="mb-3">
                        <Form.Label>Capacidad (Personas) *</Form.Label>
                        <Form.Control
                            type="number"
                            name="capacidad"
                            value={formData.capacidad}
                            onChange={handleChange}
                            required
                            min="1"
                            max="100"
                            // Se pone en rojo si la capacidad es menor o igual a 0
                            isInvalid={formData.capacidad !== '' && formData.capacidad <= 0}
                        />
                        <Form.Control.Feedback type="invalid" className="fw-bold">
                            ⚠️ La capacidad debe ser de al menos 1 persona.
                        </Form.Control.Feedback>
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={!isFormValid}>
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};