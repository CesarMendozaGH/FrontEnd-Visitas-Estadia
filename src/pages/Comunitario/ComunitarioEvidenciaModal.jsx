import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { comunitarioService } from '../../services/comunitarioService';

export const ComunitarioEvidenciaModal = ({ show, handleClose, perfil }) => {
    // Obtenemos la fecha de hoy en formato YYYY-MM-DD para el valor por defecto
    const hoy = new Date().toISOString().split('T')[0];

    const [fecha, setFecha] = useState(hoy);
    const [archivo, setArchivo] = useState(null);
    const [cargando, setCargando] = useState(false);

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
                const headerBytes = Array.from(arr.slice(0, 12));
                
                // Firmas de imágenes válidas
                const firmasValidas = [
                    [0xFF, 0xD8, 0xFF], // JPEG
                    [0x89, 0x50, 0x4E, 0x47], // PNG
                    [0x47, 0x49, 0x46], // GIF
                    [0x42, 0x4D] // BMP
                ];
                
                let esValido = false;
                for (const firma of firmasValidas) {
                    if (headerBytes.slice(0, firma.length).every((byte, i) => byte === firma[i])) {
                        esValido = true;
                        break;
                    }
                }
                
                // Para WEBP necesitamos verificar RIFF....WEBP
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

    const handleSubir = async () => {
        if (!archivo) {
            Swal.fire('Atención', 'Debes seleccionar una fotografía', 'warning');
            return;
        }

        setCargando(true);
        try {
            const formData = new FormData();
            formData.append('PerfilId', perfil.idPerfilComunitario);
            formData.append('Archivo', archivo);
            formData.append('FechaDelTrabajo', fecha);

            await comunitarioService.subirEvidencia(formData);
            Swal.fire('¡Éxito!', 'Evidencia subida correctamente', 'success');
            setArchivo(null); // Limpiamos el input
            handleClose();
        } catch (error) {
            Swal.fire('Error', 'No se pudo subir la evidencia', 'error');
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Subir Evidencia</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {perfil && (
                    <div className="alert alert-info py-2">
                        <strong>Trabajador:</strong> {perfil.nombre} {perfil.apellidoPaterno}
                    </div>
                )}
                <Form.Group className="mb-3">
                    <Form.Label>Fecha del trabajo realizado</Form.Label>
                    <Form.Control
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                        Si la foto es de días anteriores, cambia la fecha para que salga en el reporte correcto.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Fotografía de Evidencia</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) {
                                setArchivo(null);
                                return;
                            }
                            const esValido = await validarArchivoImagen(file);
                            if (esValido) {
                                setArchivo(file);
                            } else {
                                e.target.value = ''; // Limpiar el input
                                setArchivo(null);
                            }
                        }}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubir} disabled={cargando}>
                    {cargando ? 'Subiendo...' : 'Subir Fotografía'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};