import { useEffect, useState } from 'react';
import { comunitarioService } from '../../services/comunitarioService';
import { ComunitarioForm } from './ComunitarioForm';
import { ComunitarioEntradaModal } from './ComunitarioEntradaModal'; // <--- Importamos el nuevo modal
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Form from 'react-bootstrap/Form';
import Swal from 'sweetalert2'; // <--- Importamos SweetAlert
import { MdPersonAdd, MdPlayArrow, MdStop, MdSearch } from "react-icons/md";

export function ComunitarioPage() {
    const [perfiles, setPerfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Estados de Modales
    const [showModal, setShowModal] = useState(false);
    const [showEntradaModal, setShowEntradaModal] = useState(false);
    
    // Estados de Selección
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        cargarPerfiles();
    }, []);

    const cargarPerfiles = async () => {
        setLoading(true);
        try {
            const data = await comunitarioService.getAll();
            setPerfiles(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!busqueda) return cargarPerfiles();
        try {
            const data = await comunitarioService.buscar(busqueda);
            setPerfiles(data);
        } catch (error) {
            console.error(error);
        }
    };

    // --- ACCIONES DE ASISTENCIA (LÓGICA CORREGIDA) ---

    // 1. Abrir el Modal
    const handleEntradaClick = (perfil) => {
        setPerfilSeleccionado(perfil);
        setShowEntradaModal(true);
    };

    // 2. Procesar la confirmación del Modal
    const procesarEntrada = async (perfilId, horas) => {
        // NOTA: No usamos try/catch aquí porque el Modal ya maneja los errores
        // y nos interesa que si falla, el modal NO se cierre.
        
        await comunitarioService.registrarEntrada(perfilId, horas);
        
        // Alerta Bonita con SweetAlert2
        Swal.fire({
            title: "¡Entrada Registrada!",
            text: "El tiempo empieza a correr ahora.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });

        cargarPerfiles(); // Recargamos la tabla para ver cambios
        // El modal se cierra automáticamente desde el componente hijo al llamar a esta función
    };

    const handleSalida = async (perfil) => {
        // Usamos SweetAlert para confirmar salida también
        const result = await Swal.fire({
            title: `¿Cerrar sesión de ${perfil.nombre}?`,
            text: "Se calcularán las horas reales trabajadas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, registrar salida',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const resultado = await comunitarioService.registrarSalida(perfil.idPerfilComunitario);
                
                Swal.fire({
                    title: '¡Salida Exitosa!',
                    html: `Horas sumadas hoy: <b>${resultado.horasSumadas}</b><br/>Nuevo acumulado: <b>${resultado.totalAcumulado}</b>`,
                    icon: 'success'
                });
                
                cargarPerfiles();
            } catch (error) {
                Swal.fire('Error', error.response?.data || "No se pudo registrar la salida", 'error');
            }
        }
    };

    // --- CREACIÓN DE PERFIL ---
    const handleCreate = async (formData) => {
        try {
            await comunitarioService.create(formData);
            setShowModal(false);
            cargarPerfiles();
            Swal.fire("Creado", "Expediente creado correctamente", "success");
        } catch (error) {
            Swal.fire("Error", error.response?.data, "error");
        }
    };

    // Calcular porcentaje
    const getProgreso = (actual, total) => {
        if (!total) return 0;
        return Math.min(100, Math.round((actual / total) * 100));
    };

    return (
        <div>
            {/* Header y Buscador */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <h2>Servicio Comunitario</h2>

                <div className="d-flex gap-2">
                     <Button variant="outline-primary" onClick={() => setShowModal(true)}>
                        <MdPersonAdd /> Nuevo
                    </Button>
                    <Form onSubmit={handleSearch} className="d-flex gap-2">
                        <Form.Control 
                            placeholder="Buscar por nombre..." 
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <Button variant="outline-secondary" type="submit"><MdSearch /></Button>
                    </Form>
                   
                </div>
            </div>

            {/* Tabla */}
            <div className="table-responsive shadow-sm rounded bg-white">
                <Table hover className="mb-0 align-middle" class="table table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th style={{width: '30%'}}>Progreso Horas</th>
                            <th className="text-center">Deuda</th>
                            <th className="text-center">Control Asistencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {perfiles.map(p => {
                            const porcentaje = getProgreso(p.horasAcumuladasActuales, p.horasTotalesDeuda);
                            return (
                                <tr key={p.idPerfilComunitario}>
                                    <td>{p.idPerfilComunitario}</td>
                                    <td className="fw-bold">
                                        {p.nombre} {p.apellidoPaterno} {p.apellidoMaterno}
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <ProgressBar 
                                                now={porcentaje} 
                                                variant={porcentaje >= 100 ? "success" : "warning"} 
                                                style={{height: '10px', flexGrow: 1}} 
                                            />
                                            <small>{p.horasAcumuladasActuales} / {p.horasTotalesDeuda}</small>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg={porcentaje >= 100 ? "success" : "danger"}>
                                            {p.horasTotalesDeuda - p.horasAcumuladasActuales} h restantes
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <div className="btn-group">
                                            <Button  
                                                variant="outline-success" 
                                                size="sm"
                                                onClick={() => handleEntradaClick(p)} // <--- Aquí usamos la función del Modal
                                                title="Registrar Entrada"
                                            >
                                                <MdPlayArrow /> Entrada
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => handleSalida(p)}
                                                title="Registrar Salida"
                                            >
                                                <MdStop /> Salida
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>

            {/* Modal de Alta de Perfil */}
            <ComunitarioForm 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                handleSave={handleCreate} 
            />

            {/* NUEVO: Modal de Entrada (Conectado) */}
            <ComunitarioEntradaModal
                show={showEntradaModal}
                handleClose={() => setShowEntradaModal(false)}
                perfil={perfilSeleccionado}
                onConfirmar={procesarEntrada}
            />
        </div>
    );
}