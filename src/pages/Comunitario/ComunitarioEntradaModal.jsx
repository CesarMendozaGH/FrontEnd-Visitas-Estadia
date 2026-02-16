import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { MdTimer, MdWarning } from "react-icons/md";

export const ComunitarioEntradaModal = ({ show, handleClose, perfil, onConfirmar }) => {
    const [horas, setHoras] = useState(4); // 4 horas por defecto
    const [error, setError] = useState(null);

    // Reseteamos el estado cada vez que se abre el modal
    useEffect(() => {
        if (show) {
            setHoras(4);
            setError(null);
        }
    }, [show, perfil]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (horas <= 0) {
            setError("Las horas deben ser mayor a 0.");
            return;
        }

        try {
            // Intentamos registrar. Si el backend dice "Ya está adentro", caerá en el catch
            await onConfirmar(perfil.idPerfilComunitario, horas);
            handleClose();
        } catch (err) {
            // Aquí capturamos el mensaje "El usuario ya tiene una sesión activa" del backend
            const mensaje = err.response?.data || "Error al registrar entrada.";
            setError(mensaje);
        }
    };

    if (!perfil) return null;

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>Registrar Entrada</Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="text-center p-4">
                    {/* Foto o Avatar Placeholder */}
                    <div className="mb-3 d-flex justify-content-center">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center shadow-sm border" 
                             style={{width: '80px', height: '80px', fontSize: '2rem'}}>
                            {perfil.urlFotoRostro ? 
                                <img src={perfil.urlFotoRostro} alt="Foto" className="rounded-circle w-100 h-100 object-fit-cover" /> 
                                : '👤'}
                        </div>
                    </div>

                    <h5 className="fw-bold mb-1">
                        {perfil.nombre} {perfil.apellidoPaterno}
                    </h5>
                    <p className="text-muted small mb-4">
                        Deuda actual: {perfil.horasTotalesDeuda - (perfil.horasAcumuladasActuales || 0)} horas
                    </p>

                    {error && (
                        <Alert variant="danger" className="text-start d-flex align-items-center gap-2">
                            <MdWarning size={20}/> 
                            <div>{error}</div>
                        </Alert>
                    )}

                    <Form.Group className="text-start bg-light p-3 rounded border">
                        <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                            <MdTimer className="text-success"/> 
                            Horas a cubrir hoy:
                        </Form.Label>
                        <div className="d-flex gap-2">
                            <Button variant="outline-secondary" onClick={() => setHoras(Math.max(1, horas - 1))}>-</Button>
                            <Form.Control 
                                type="number" 
                                value={horas} 
                                onChange={(e) => setHoras(parseInt(e.target.value) || 0)}
                                className="text-center fw-bold fs-5"
                                min="1"
                                autoFocus
                            />
                            <Button variant="outline-secondary" onClick={() => setHoras(horas + 1)}>+</Button>
                        </div>
                        <Form.Text className="text-muted small">
                            Esto definirá la hora de salida estimada.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="success" type="submit">
                         Confirmar Entrada
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};