import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { comunitarioService } from '../../services/comunitarioService';


export const ComunitarioReporteModal = ({ show, handleClose }) => {
    const hoy = new Date().toISOString().split('T')[0];
    
    const [fecha, setFecha] = useState(hoy);
    const [fotoFirmas, setFotoFirmas] = useState(null);
    const [cargando, setCargando] = useState(false);

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
                        onChange={(e) => setFotoFirmas(e.target.files[0])} 
                    />
                    <Form.Text className="text-muted">
                        Esta foto se pegará al final del archivo Excel de forma automática.
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