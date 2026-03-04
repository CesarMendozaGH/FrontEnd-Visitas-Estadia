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
                        <strong>Infractor:</strong> {perfil.nombre} {perfil.apellidoPaterno}
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
                        onChange={(e) => setArchivo(e.target.files[0])}
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