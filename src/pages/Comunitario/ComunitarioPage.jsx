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
// AGREGAMOS MdFileDownload AL IMPORT DE ÍCONOS
import { MdPersonAdd, MdPlayArrow, MdStop, MdSearch, MdEdit, MdFileDownload, MdAdd, MdDock, MdDomainAdd } from "react-icons/md";

// IMPORTS DE REPORTES
import { ComunitarioEvidenciaModal } from './ComunitarioEvidenciaModal.jsx';
import { ComunitarioReporteModal } from './ComunitarioReporteModal.jsx';

export function ComunitarioPage() {
    const [perfiles, setPerfiles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estados de Modales
    const [showModal, setShowModal] = useState(false);
    const [showEntradaModal, setShowEntradaModal] = useState(false);

    // Estados de Selección
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    // Estado para saber a quién vamos a editar
    const [perfilAEditar, setPerfilAEditar] = useState(null);

    // Estados para subir los modales de reportes
    const [showEvidencia, setShowEvidencia] = useState(false);
    const [showReporte, setShowReporte] = useState(false);
    const [perfilEvidencia, setPerfilEvidencia] = useState(null);


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

    const handleSavePerfil = async (datosFormulario, fotoRostro) => {
        try {
            // Empaquetamos todo en un FormData porque ahora enviamos archivos y texto juntos
            const formData = new FormData();
            
            formData.append('IdPerfilComunitario', datosFormulario.idPerfilComunitario);
            formData.append('Nombre', datosFormulario.nombre);
            formData.append('ApellidoPaterno', datosFormulario.apellidoPaterno);
            formData.append('ApellidoMaterno', datosFormulario.apellidoMaterno || '');
            formData.append('HorasTotalesDeuda', datosFormulario.horasTotalesDeuda);
            formData.append('HorasAcumuladasActuales', datosFormulario.horasAcumuladasActuales || 0);

            // Si el usuario seleccionó una foto, la adjuntamos
            if (fotoRostro) {
                formData.append('FotoRostro', fotoRostro);
            }

            // Enviamos un único request al backend
            if (datosFormulario.idPerfilComunitario === 0) {
                await comunitarioService.create(formData);
                Swal.fire("Creado", "Expediente y foto guardados correctamente", "success");
            } else {
                await comunitarioService.update(datosFormulario.idPerfilComunitario, formData);
                Swal.fire("Actualizado", "Expediente y foto guardados correctamente", "success");
            }

            setShowModal(false);
            cargarPerfiles();

        } catch (error) {
            Swal.fire("Error", error.response?.data || "Ocurrió un error al guardar", "error");
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

    return (
        <div>
            {/* Header y Buscador */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <h2>Servicio Comunitario</h2>

                <div className="d-flex gap-2">
                    <Button variant="primary" onClick={abrirModalCreacion}>
                        <MdPersonAdd /> Nuevo
                    </Button>

                    <Button variant="success" onClick={() => setShowReporte(true)} className="d-flex align-items-center gap-2">
                        <MdFileDownload size={20} />
                        Generar Reporte Excel
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
                                                style={{ height: '10px', flexGrow: 1 }}
                                            />
                                            <small>{p.horasAcumuladasActuales} / {p.horasTotalesDeuda}</small>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        {p.horasAcumuladasActuales >= p.horasTotalesDeuda ? (
                                            <Badge bg="success">
                                                {p.horasAcumuladasActuales > p.horasTotalesDeuda
                                                    ? `+${p.horasAcumuladasActuales - p.horasTotalesDeuda} h extra realizadas`
                                                    : "0 h restantes"
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

                                            {/* BOTÓN DESCOMENTADO Y ARREGLADO CON 'p' */}
                                            <Button
                                                variant="outline-dark"
                                                size="sm"
                                                onClick={() => abrirModalEvidencia(p)}
                                                title="Subir evidencia fotográfica"
                                            >
                                                <MdAdd /> Subir Evidencia
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>

            {/* ZONA DE MODALES (AQUÍ DEBEN IR SIEMPRE) */}
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