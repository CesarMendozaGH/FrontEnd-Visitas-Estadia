import { useEffect, useState } from 'react';
import { comunitarioService } from '../../services/comunitarioService';
import { ComunitarioForm } from './ComunitarioForm';
import { ComunitarioEntradaModal } from './ComunitarioEntradaModal'; 
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Form from 'react-bootstrap/Form';
import Swal from 'sweetalert2'; 
// AGREGAMOS MdDelete y MdRestore PARA LOS ICONOS DE BORRADO/ACTIVACIÓN
import { MdPersonAdd, MdPlayArrow, MdStop, MdSearch, MdEdit, MdFileDownload, MdAdd, MdDelete, MdRestore } from "react-icons/md";

// IMPORTS DE REPORTES
import { ComunitarioEvidenciaModal } from './ComunitarioEvidenciaModal.jsx';
import { ComunitarioReporteModal } from './ComunitarioReporteModal.jsx';

export function ComunitarioPage() {
    const [perfiles, setPerfiles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estados de Modales
    const [showModal, setShowModal] = useState(false);
    const [showEntradaModal, setShowEntradaModal] = useState(false);
    const [showEvidencia, setShowEvidencia] = useState(false);
    const [showReporte, setShowReporte] = useState(false);

    // Estados de Selección
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [perfilAEditar, setPerfilAEditar] = useState(null);
    const [perfilEvidencia, setPerfilEvidencia] = useState(null);

    // NUEVO: Estado para el filtro (Por defecto mostramos ACTIVOS)
    const [filtroEstatus, setFiltroEstatus] = useState('ACTIVO');

    // VERIFICADOR DE ROL
    const isSuperAdmin = localStorage.getItem('rol_dev') === 'SUPERADMIN';

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

    const abrirModalCreacion = () => {
        setPerfilAEditar(null); 
        setShowModal(true);
    };

    const abrirModalEdicion = (perfil) => {
        setPerfilAEditar(perfil); 
        setShowModal(true);
    };

    const handleEntradaClick = (perfil) => {
        setPerfilSeleccionado(perfil);
        setShowEntradaModal(true);
    };

    const procesarEntrada = async (perfilId, horas) => {
        await comunitarioService.registrarEntrada(perfilId, horas);
        Swal.fire({
            title: "¡Entrada Registrada!",
            text: "El tiempo empieza a correr ahora.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });
        cargarPerfiles(); 
    };

    const handleSalida = async (perfil) => {
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

    // NUEVO: Función para Desactivar/Reactivar (Borrado Lógico)
    const handleToggleStatus = async (perfil) => {
        const esActivo = perfil.estatusServicio === 'ACTIVO';
        const accion = esActivo ? 'desactivar' : 'reactivar';
        
        const result = await Swal.fire({
            title: `¿${esActivo ? 'Desactivar' : 'Reactivar'} expediente?`,
            text: `El perfil de ${perfil.nombre} pasará a estar ${esActivo ? 'INACTIVO' : 'ACTIVO'}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: esActivo ? '#d33' : '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await comunitarioService.toggleStatus(perfil.idPerfilComunitario);
                Swal.fire('¡Éxito!', `Expediente modificado correctamente.`, 'success');
                cargarPerfiles();
            } catch (error) {
                Swal.fire('Error', error.response?.data || "Error al cambiar el estatus", 'error');
            }
        }
    };

    const handleSavePerfil = async (formData, fotoRostro) => {
        try {
            const dataForm = new FormData();
            dataForm.append('IdPerfilComunitario', formData.idPerfilComunitario);
            dataForm.append('Nombre', formData.nombre);
            dataForm.append('ApellidoPaterno', formData.apellidoPaterno);
            dataForm.append('ApellidoMaterno', formData.apellidoMaterno || '');
            dataForm.append('HorasTotalesDeuda', formData.horasTotalesDeuda);
            dataForm.append('HorasAcumuladasActuales', formData.horasAcumuladasActuales || 0);

            if (fotoRostro) {
                dataForm.append('FotoRostro', fotoRostro);
            }

            if (formData.idPerfilComunitario === 0) {
                await comunitarioService.create(dataForm);
                Swal.fire("Creado", "Expediente creado correctamente", "success");
            } else {
                await comunitarioService.update(formData.idPerfilComunitario, dataForm);
                Swal.fire("Actualizado", "Datos guardados correctamente", "success");
            }
            setShowModal(false);
            cargarPerfiles();
        } catch (error) {
            Swal.fire("Error", error.response?.data || "Ocurrió un error", "error");
        }
    };

    const getProgreso = (actual, total) => {
        if (!total) return 0;
        return Math.min(100, Math.round((actual / total) * 100));
    };

    const abrirModalEvidencia = (perfil) => {
        setPerfilEvidencia(perfil);
        setShowEvidencia(true);
    };

    // LOGICA DE FILTRADO
    const perfilesFiltrados = perfiles.filter(p => {
        // Si NO es SuperAdmin, obligamos a que solo vea los ACTIVOS
        if (!isSuperAdmin) return p.estatusServicio === 'ACTIVO';
        
        // Si ES SuperAdmin, respetamos lo que diga el Select desplegable
        if (filtroEstatus === 'TODOS') return true;
        return p.estatusServicio === filtroEstatus;
    });

    return (
        <div>
            {/* Header y Buscador */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <h2>Servicio Comunitario</h2>

                <div className="d-flex flex-wrap gap-2 align-items-center">
                    <Button variant="primary" onClick={abrirModalCreacion}>
                        <MdPersonAdd /> Nuevo
                    </Button>

                    <Button variant="success" onClick={() => setShowReporte(true)} className="d-flex align-items-center gap-2">
                        <MdFileDownload size={20} />
                        Reporte Excel
                    </Button>

                    {/* NUEVO: Filtro desplegable SOLO PARA SUPERADMIN */}
                    {isSuperAdmin && (
                        <Form.Select 
                            value={filtroEstatus} 
                            onChange={(e) => setFiltroEstatus(e.target.value)}
                            className="w-auto shadow-sm border-secondary"
                        >
                            <option value="ACTIVO">Ver Activos</option>
                            <option value="INACTIVO">Ver Inactivos</option>
                            <option value="TODOS">Ver Todos</option>
                        </Form.Select>
                    )}

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
                <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th style={{ width: '30%' }}>Progreso Horas</th>
                            <th className="text-center">Deuda</th>
                            <th className="text-center">Control Asistencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Usamos perfilesFiltrados en lugar de perfiles */}
                        {perfilesFiltrados.map(p => {
                            const porcentaje = getProgreso(p.horasAcumuladasActuales, p.horasTotalesDeuda);
                            const esInactivo = p.estatusServicio === 'INACTIVO';

                            return (
                                <tr key={p.idPerfilComunitario} className={esInactivo ? 'table-secondary text-muted' : ''}>
                                    <td>{p.idPerfilComunitario}</td>
                                    <td className="fw-bold">
                                        {p.nombre} {p.apellidoPaterno} {p.apellidoMaterno}
                                        {/* ETIQUETA ROJA SI ESTÁ INACTIVO */}
                                        {esInactivo && <Badge bg="danger" className="ms-2">INACTIVO</Badge>}
                                    </td>
                                    <td style={{ opacity: esInactivo ? 0.6 : 1 }}>
                                        <div className="d-flex align-items-center gap-2">
                                            <ProgressBar
                                                now={porcentaje}
                                                variant={porcentaje >= 100 ? "success" : "warning"}
                                                style={{ height: '10px', flexGrow: 1 }}
                                            />
                                            <small>{p.horasAcumuladasActuales} / {p.horasTotalesDeuda}</small>
                                        </div>
                                    </td>
                                    <td className="text-center" style={{ opacity: esInactivo ? 0.6 : 1 }}>
                                        {p.horasAcumuladasActuales >= p.horasTotalesDeuda ? (
                                            <Badge bg="success">
                                                {p.horasAcumuladasActuales > p.horasTotalesDeuda
                                                    ? `+${p.horasAcumuladasActuales - p.horasTotalesDeuda} h extra`
                                                    : "Completado"
                                                }
                                            </Badge>
                                        ) : (
                                            <Badge bg="danger">
                                                {p.horasTotalesDeuda - (p.horasAcumuladasActuales || 0)} h restantes
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <div className="btn-group">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => abrirModalEdicion(p)}
                                                title="Editar Expediente"
                                            >
                                                <MdEdit /> Editar
                                            </Button>

                                            {/* Ocultar botones de entrada/salida/evidencia si está inactivo */}
                                            {!esInactivo && (
                                                <>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => handleEntradaClick(p)}
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
                                                    <Button
                                                        variant="outline-dark"
                                                        size="sm"
                                                        onClick={() => abrirModalEvidencia(p)}
                                                        title="Subir evidencia"
                                                    >
                                                    <MdAdd/> Evidencia
                                                    </Button>
                                                </>
                                            )}

                                            {/* BOTÓN EXCLUSIVO DE SUPERADMIN PARA BORRADO LÓGICO / ACTIVACIÓN */}
                                            {isSuperAdmin && (
                                                <Button
                                                    variant={esInactivo ? "outline-success" : "outline-danger"}
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(p)}
                                                    title={esInactivo ? "Reactivar Perfil" : "Desactivar Perfil"}
                                                >
                                                    {esInactivo ? <MdRestore /> : <MdDelete />}
                                                    {esInactivo ? ' Reactivar' : ' Borrar'}
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {perfilesFiltrados.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="text-center text-muted py-4">
                                    No se encontraron perfiles con el filtro actual.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* MODALES */}
            <ComunitarioForm
                show={showModal}
                handleClose={() => setShowModal(false)}
                handleSave={handleSavePerfil}
                perfilEditar={perfilAEditar}
            />

            <ComunitarioEntradaModal
                show={showEntradaModal}
                handleClose={() => setShowEntradaModal(false)}
                perfil={perfilSeleccionado}
                onConfirmar={procesarEntrada}
            />

            <ComunitarioEvidenciaModal
                show={showEvidencia}
                handleClose={() => setShowEvidencia(false)}
                perfil={perfilEvidencia}
            />

            <ComunitarioReporteModal
                show={showReporte}
                handleClose={() => setShowReporte(false)}
            />
        </div>
    );
}