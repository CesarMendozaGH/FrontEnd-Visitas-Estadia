import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Swal from 'sweetalert2';
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
        let value = e.target.value;
        
        // Para campos de texto, convertir a mayúsculas y remover caracteres especiales
        if (['nombre', 'apellidoPaterno', 'apellidoMaterno'].includes(e.target.name)) {
            // Convertir a mayúsculas y solo permitir letras, espacios y acentos
            value = value
                .toUpperCase()
                .replace(/[^A-ZÁÉÍÓÚÑ\s]/g, '');
        }
        
        setFormData({ ...formData, [e.target.name]: value });
    };

    // Validar que el archivo sea una imagen real (no solo por extensión o MIME type)
    const validarArchivoImagen = (archivo) => {
        if (!archivo) return true;
        
        // Verificar MIME type permitido
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        
        if (!tiposPermitidos.includes(archivo.type)) {
            Swal.fire('Error', 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WEBP, BMP)', 'error');
            return false;
        }
        
        // Verificar magic bytes (firmas de archivo) para mayor seguridad
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = (e) => {
                const arr = new Uint8Array(e.target.result);
                const headerBytes = Array.from(arr.slice(0, 8));
                
                // Firmas de imágenes válidas
                const firmasValidas = [
                    [0xFF, 0xD8, 0xFF], // JPEG
                    [0x89, 0x50, 0x4E, 0x47], // PNG
                    [0x47, 0x49, 0x46], // GIF
                    [0x52, 0x49, 0x46, 0x46], // WEBP (RIFF....WEBP)
                    [0x42, 0x4D] // BMP
                ];
                
                let esValido = false;
                for (const firma of firmasValidas) {
                    if (headerBytes.slice(0, firma.length).every((byte, i) => byte === firma[i])) {
                        esValido = true;
                        break;
                    }
                }
                
                // Para WEBP necesitamos verificar el segundo conjunto de bytes
                if (headerBytes[0] === 0x52 && headerBytes[1] === 0x49 && 
                    headerBytes[2] === 0x46 && headerBytes[3] === 0x46) {
                    // Es RIFF, verificar que sea WEBP
                    if (headerBytes.slice(8, 12).every((byte, i) => byte === [0x57, 0x45, 0x42, 0x50][i])) {
                        esValido = true;
                    }
                }
                
                if (!esValido) {
                    Swal.fire('Error', 'El archivo no es una imagen válida. Verifica que el archivo no esté corrupto o sea otro tipo de archivo.', 'error');
                    resolve(false);
                } else {
                    resolve(true);
                }
            };
            reader.onerror = () => {
                Swal.fire('Error', 'No se pudo leer el archivo', 'error');
                resolve(false);
            };
            reader.readAsArrayBuffer(archivo.slice(0, 12)); // Solo leemos los primeros bytes
        });
    };

    const handleFileChange = async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) {
            setFotoRostro(null);
            return;
        }
        
        const esValido = await validarArchivoImagen(archivo);
        if (esValido) {
            setFotoRostro(archivo);
        } else {
            e.target.value = ''; // Limpiar el input
            setFotoRostro(null);
        }
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
                            <Form.Label>Nombre(s)</Form.Label>
                            <Form.Control 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleChange} 
                                required 
                                autoFocus 
                                maxLength={40}
                                placeholder="Máximo 40 caracteres"
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Apellido Paterno</Form.Label>
                            <Form.Control 
                                name="apellidoPaterno" 
                                value={formData.apellidoPaterno} 
                                onChange={handleChange} 
                                required 
                                maxLength={40}
                                placeholder="Máximo 40 caracteres"
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>
                    </div>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Apellido Materno (Opcional)</Form.Label>
                        <Form.Control 
                            name="apellidoMaterno" 
                            value={formData.apellidoMaterno} 
                            onChange={handleChange}
                            maxLength={40}
                            placeholder="Máximo 40 caracteres"
                            style={{ textTransform: 'uppercase' }}
                        />
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
                                step="1"
                                placeholder="Solo números enteros positivos"
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
                                    step="1"
                                    placeholder="Solo números enteros"
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