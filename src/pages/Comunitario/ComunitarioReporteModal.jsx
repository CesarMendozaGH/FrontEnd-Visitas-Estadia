import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { comunitarioService } from '../../services/comunitarioService';


export const ComunitarioReporteModal = ({ show, handleClose }) => {
    const hoy = new Date().toISOString().split('T')[0];
    
    const [fecha, setFecha] = useState(hoy);
    const [fotoFirmas, setFotoFirmas] = useState(null);
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
        
        // Verificar tamaño máximo (5MB)
        const tamanoMaximo = 5 * 1024 * 1024;
        if (archivo.size > tamanoMaximo) {
            Swal.fire('Error', 'El archivo es demasiado grande. Máximo 5MB', 'error');
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

    const handleFileChange = async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) {
            setFotoFirmas(null);
            return;
        }
        const esValido = await validarArchivoImagen(archivo);
        if (esValido) {
            setFotoFirmas(archivo);
        } else {
            // Limpiar el input si el archivo no es válido
            e.target.value = '';
            setFotoFirmas(null);
        }
    };

    const handleGenerar = async () => {
        setCargando(true);
        try {
            const formData = new FormData();
            formData.append('Fecha', fecha);
            
            // La foto de firmas es opcional en tu backend, pero si la ponen la anexamos
            if (fotoFirmas) {
                formData.append('FotoFirmas', fotoFirmas);
            }

            // Recibimos el archivo Blob
            const blobResponse = await comunitarioService.generarReporteDiario(formData);

            // Magia para forzar la descarga del archivo en el navegador
            const url = window.URL.createObjectURL(new Blob([blobResponse]));
            const link = document.createElement('a');
            link.href = url;
            
            // Formatear la fecha para el nombre del archivo DD_MM_YYYY
            const partesFecha = fecha.split('-');
            const nombreArchivo = `Reporte_Asistencia_${partesFecha[2]}_${partesFecha[1]}_${partesFecha[0]}.xlsx`;
            
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            Swal.fire('¡Listo!', 'El Excel se ha generado correctamente', 'success');
            handleClose();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Hubo un problema al generar el reporte', 'error');
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Generar Reporte de Asistencia</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>¿De qué día quieres generar el reporte?</Form.Label>
                    <Form.Control 
                        type="date" 
                        value={fecha} 
                        onChange={(e) => setFecha(e.target.value)} 
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Foto de Hoja de Firmas Escaneada (Opcional)</Form.Label>
                    <Form.Control 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                    />
                    <Form.Text className="text-muted">
                        Esta foto se pegará al final del archivo Excel de forma automática.<br/>
                        Formatos: JPEG, PNG, GIF, WEBP, BMP. Máximo 5MB.
                    </Form.Text>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                    Cancelar
                </Button>
                <Button variant="success" onClick={handleGenerar} disabled={cargando}>
                    {cargando ? 'Generando Excel...' : 'Generar y Descargar'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};