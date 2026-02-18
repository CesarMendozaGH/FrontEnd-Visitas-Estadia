import { useEffect, useState } from 'react';
import { visitasService } from '../../services/visitasService';
import { RegistrarVisitaModal } from '../../components/ui/RegistrarVisitaModal';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { MdHistory, MdExitToApp, MdPersonSearch, MdPersonAdd } from "react-icons/md";
import Swal from 'sweetalert2'; // <--- IMPORTANTE

export function BitacoraPage() {
    const [visitas, setVisitas] = useState([]);
    const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0]); 
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        cargarVisitas();
    }, []);

    const cargarVisitas = async () => {
        setLoading(true);
        try {
            const data = await visitasService.getAll();
            const ordenadas = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setVisitas(ordenadas);
        } catch (error) {
            console.error("Error cargando bitácora:", error);
            // Opcional: Mostrar error discreto
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarSalida = async (visita) => {
        // CONFIRMACIÓN CON SWEETALERT
        const result = await Swal.fire({
            title: `¿Registrar salida?`,
            text: `Visitante: ${visita.nombreVisitante}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ffc107', // Color warning para combinar con el botón
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await visitasService.marcarSalida(visita.idBitacoraVisitas);
                
                // ÉXITO RÁPIDO (Toast)
                Swal.fire({
                    icon: 'success',
                    title: 'Salida registrada',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
                
                cargarVisitas();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo registrar la salida.', 'error');
            }
        }
    };

    const handleRegistrarVista = async (data) => {
        try {
            await visitasService.create(data);
            await cargarVisitas();
            
            Swal.fire({
                title: '¡Visita Registrada!',
                text: 'El acceso ha sido autorizado correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo crear el registro.', 'error');
        }
    };

    // LÓGICA CRÍTICA
    const estaEnSitio = (v) => {
        if (!v.horaSalida) return true;
        return v.horaEntrada === v.horaSalida;
    };

    // Filtros
    const visitasFiltradas = visitas.filter(visita => {
        if (!visita.createdAt) return false;
        const fechaVisita = visita.createdAt.split('T')[0];
        return fechaVisita === filtroFecha;
    });

    return (
        <div>
            {/* Cabecera y Filtros */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <h2 className="m-0 d-flex align-items-center gap-2">
                    <MdHistory className="text-primary" /> Bitácora de Accesos
                </h2>

                <div className="d-flex align-items-center gap-2">
                    <Button className='d-flex align-items-center' variant='outline-primary' onClick={() => setShowModal(true)}>
                        <p className='mb-0 mx-2'> Registrar visita</p>
                        <MdPersonAdd size={24} className='m-2'/>
                    </Button>

                    <div className="d-flex align-items-center gap-2 bg-white p-2 rounded shadow-sm border">
                        <MdPersonSearch size={24} className="text-muted" />
                        <Form.Control
                            type="date"
                            value={filtroFecha}
                            onChange={(e) => setFiltroFecha(e.target.value)}
                            className="border-0 bg-transparent fw-bold"
                            style={{ width: 'auto' }}
                        />
                        <Button variant="outline-primary" size="sm" onClick={cargarVisitas}>
                            Refrescar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="table-responsive shadow-sm rounded bg-white">
                <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                        <tr>
                            <th className="text-center">Hora</th>
                            <th>Visitante</th>
                            <th>Motivo</th>
                            <th className="text-center">Estado</th>
                            <th className="text-center">Salida</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-5">Cargando registros...</td></tr>
                        ) : visitasFiltradas.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-5 text-muted">No hay visitas registradas en esta fecha.</td></tr>
                        ) : (
                            visitasFiltradas.map((item) => {
                                const activo = estaEnSitio(item);
                                return (
                                    <tr key={item.idBitacoraVisitas}>
                                        <td className="text-center font-monospace fw-bold text-primary">
                                            {item.horaEntrada?.substring(0, 5)}
                                        </td>
                                        <td>
                                            <div className="fw-bold">{item.nombreVisitante}</div>
                                        </td>
                                        <td className="text-muted middle">{item.motivoVisita}</td>

                                        <td className="text-center">
                                            {activo ? (
                                                <Badge bg="success" className="d-flex align-items-center justify-content-center gap-1 mx-auto" style={{ width: 'fit-content' }}>
                                                    <span className="spinner-grow spinner-grow-sm" style={{ width: '6px', height: '6px' }}></span>
                                                    En Sitio
                                                </Badge>
                                            ) : (
                                                <Badge bg="secondary" text="light">Finalizado</Badge>
                                            )}
                                        </td>

                                        <td className="text-center font-monospace text-muted">
                                            {activo ? '--:--' : item.horaSalida?.substring(0, 5)}
                                        </td>

                                        <td className="text-center">
                                            {activo && (
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    onClick={() => handleMarcarSalida(item)}
                                                    className="d-flex align-items-center gap-1 mx-auto"
                                                    title="Registrar Salida"
                                                >
                                                    <MdExitToApp /> Salida
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </div>

            <RegistrarVisitaModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onSuccess={handleRegistrarVista}
            />
        </div>
    );
}