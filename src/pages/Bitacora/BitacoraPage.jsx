import { useEffect, useState } from 'react';
import { visitasService } from '../../services/visitasService';
import { RegistrarVisitaModal } from '../../components/ui/RegistrarVisitaModal';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { MdHistory, MdExitToApp, MdPersonSearch, MdPersonAdd } from "react-icons/md";

export function BitacoraPage() {
    const [visitas, setVisitas] = useState([]);
    const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0]); // Fecha de hoy
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        cargarVisitas();
    }, []);

    const cargarVisitas = async () => {
        setLoading(true);
        try {
            const data = await visitasService.getAll();
            console.log('Datos recibidos del backend:', data);
            // Ordenamos para ver las más recientes primero
            const ordenadas = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setVisitas(ordenadas);
            console.log('Visitas ordenadas:', ordenadas);
        } catch (error) {
            console.error("Error cargando bitácora:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarSalida = async (visita) => {
        if (window.confirm(`¿Confirmar salida de ${visita.nombreVisitante}?`)) {
            try {
                await visitasService.marcarSalida(visita.idBitacoraVisitas);
                cargarVisitas(); // Recargamos para ver el cambio
            } catch (error) {
                console.error(error);
                alert("No se pudo registrar la salida. Revisa la consola.");
            }
        }
    };

    const handleRegistrarVista = async (data) => {
        await visitasService.create(data);
        await cargarVisitas();
        alert("¡Vista registrada exitosamente!");
    };

    // LÓGICA CRÍTICA: Según tu backend, si horaEntrada == horaSalida, sigue adentro.
    const estaEnSitio = (v) => {
        if (!v.horaSalida) return true; // Si es null, sigue dentro
        return v.horaEntrada === v.horaSalida; 
    };

    // Filtramos los datos según la fecha seleccionada
    // Temporalmente sin filtro para debuggear
    const visitasFiltradas = visitas;
    console.log('Total visitas:', visitas.length, 'Filtradas:', visitasFiltradas.length);

    return (
        <div>
            {/* Cabecera y Filtros */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <h2 className="m-0 d-flex align-items-center gap-2">
                    <MdHistory className="text-primary"/> Bitácora de Accesos
                </h2>
                
                <div className="d-flex align-items-center gap-2">
                    {/* Botón para registrar nueva visita */}
                    <Button variant="primary" onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2">
                        <MdPersonAdd /> Registrar Visita
                    </Button>

                    <div className="d-flex align-items-center gap-2 bg-white p-2 rounded shadow-sm border">
                        <MdPersonSearch size={24} className="text-muted"/>
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

            {/* Tabla de Registros */}
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
                                            {/* Cortamos para mostrar solo HH:MM */}
                                            {item.horaEntrada?.substring(0, 5)} 
                                        </td>
                                        <td>
                                            <div className="fw-bold">{item.nombreVisitante}</div>
                                            {/* Si tuviéramos empresa, iría aquí debajo */}
                                        </td>
                                        <td className="text-muted small">{item.motivoVista}</td>
                                        
                                        <td className="text-center">
                                            {activo ? (
                                                <Badge bg="success" className="d-flex align-items-center justify-content-center gap-1 mx-auto" style={{width: 'fit-content'}}>
                                                    <span className="spinner-grow spinner-grow-sm" style={{width:'6px', height:'6px'}}></span>
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

            {/* Modal para registrar visitas */}
            <RegistrarVisitaModal 
                show={showModal}
                handleClose={() => setShowModal(false)}
                onSuccess={handleRegistrarVista}
            />
        </div>
    );
}
