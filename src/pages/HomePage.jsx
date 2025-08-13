import React, { useEffect, useState, useContext } from 'react';
import { UsersIcon, RectangleStackIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getDashboardMetrics } from '../api/metrics';
import { getTodayAccessLogs } from '../api/accessLogs';
import { getClasses } from '../api/classes';
import { SharedDataContext } from '../contexts/SharedDataContext';

const StatCard = ({ title, value, icon, color, linkTo }) => (
  <Link to={linkTo || '#'} className={`bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-orange-400/30 transition-shadow duration-300 flex items-center space-x-4 border-l-4 ${color}`}>
    <div className={`p-3 rounded-full bg-gray-700`}>{React.createElement(icon, { className: "h-7 w-7 text-orange-400" })}</div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  </Link>
);


const HomePage = () => {
  const { clients } = useContext(SharedDataContext);
  const [todayAccessLogs, setTodayAccessLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classesToday, setClassesToday] = useState(0);

  useEffect(() => {
    async function fetchMetricsAndClasses() {
      try {
        const metricsData = await getDashboardMetrics();
        setMetrics(metricsData);
        console.log('[LOG][DASHBOARD] Métricas recibidas:', metricsData);

        // Obtener todas las clases
        const classes = await getClasses();
        console.log('[LOG] Todas las clases recibidas:', classes);

        // Obtener la fecha actual (solo día, mes, año)
        // Obtener el día actual en español (Ej: 'Miércoles')
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const today = new Date();
        const todayName = diasSemana[today.getDay()];

        // Filtrar clases que sean para hoy usando el campo 'dia'
        const classesForToday = classes.filter(clase => {
          if (!clase.dia) {
            console.log('[LOG] Clase sin campo dia:', clase);
            return false;
          }
          const isToday = clase.dia.trim().toLowerCase() === todayName.toLowerCase();
          const isActive = clase.activo === true;
          if (isToday && isActive) {
            console.log(`[LOG] Clase activa para hoy encontrada:`, clase);
          }
          return isToday && isActive;
        });
        setClassesToday(classesForToday.length);
        console.log(`[LOG] Total clases activas para hoy (${todayName}):`, classesForToday.length);

        // Obtener los registros de ingreso del día desde el backend
        try {
          const logs = await getTodayAccessLogs();
          setTodayAccessLogs(logs);
          if (logs && logs.length > 0) {
            console.log('[LOG][DASHBOARD] Registros de ingreso del día recibidos del backend:', logs);
          } else {
            console.log('[LOG][DASHBOARD] No hay registros de ingreso del día en el backend.');
          }
        } catch (error) {
          console.error('[ERROR][DASHBOARD] Falló la obtención de logs del día:', error);
        }
      } catch (error) {
        setMetrics(null);
        setClassesToday(0);
        console.error('[ERROR] Al obtener métricas o clases:', error);
      } finally {
        setLoading(false);
      }
      // Ya no se usa attendanceRecords, solo logs del backend
    }
    fetchMetricsAndClasses();
  }, []);

  if (loading) {
    return <div className="text-center py-10"><p className="text-white">Cargando dashboard...</p></div>;
  }

  // Si no hay métricas, mostrar mensaje de error
  if (!metrics) {
    return <div className="text-center py-10"><p className="text-red-400">No se pudieron cargar las métricas.</p></div>;
  }

  // Extraer los valores del objeto de métricas
  const activeClients = metrics.usuarios?.activos ?? 0;
  const totalTeachers = metrics.profesores?.total ?? 0;
  const totalClasses = metrics.clases?.total ?? 0;
  const recentCheckIns = todayAccessLogs || [];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-orange-400 mb-8">Dashboard Principal</h1>

      {/* Sección de Estadísticas Rápidas .*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        <StatCard title="Clientes Activos" value={activeClients} icon={UsersIcon} color="border-green-500" linkTo="/admin/clients" />
        <StatCard title="Clases Hoy" value={classesToday} icon={CalendarDaysIcon} color="border-blue-500" linkTo="/admin/classes" />
        <StatCard title="Total Profesores" value={totalTeachers} icon={UsersIcon} color="border-purple-500" linkTo="/admin/classes" />
        <StatCard title="Clases Totales" value={totalClasses} icon={RectangleStackIcon} color="border-yellow-500" linkTo="/admin/classes" />
      </div>

      {/* Accesos Rápidos */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-xl font-semibold text-orange-400 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          <Link to="/admin/clients" className="w-full min-w-0 bg-orange-500 hover:bg-orange-600 text-white text-center font-medium py-3 px-2 sm:px-4 rounded-lg transition-colors break-words">Gestionar Clientes</Link>
          <Link to="/admin/classes" className="w-full min-w-0 bg-orange-500 hover:bg-orange-600 text-white text-center font-medium py-3 px-2 sm:px-4 rounded-lg transition-colors break-words">Gestionar Clases</Link>
          <Link to="/admin/memberships" className="w-full min-w-0 bg-orange-500 hover:bg-orange-600 text-white text-center font-medium py-3 px-2 sm:px-4 rounded-lg transition-colors break-words">Membresías</Link>
          <Link to="/admin/check-in" className="w-full min-w-0 bg-teal-500 hover:bg-teal-600 text-white text-center font-medium py-3 px-2 sm:px-4 rounded-lg transition-colors break-words">Página de Check-In</Link>
        </div>
      </div>

      {/* Sección de Últimos Check-ins (si aplica para el dashboard admin) */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-xl font-semibold text-orange-400 mb-4">Últimos Registros de Ingreso</h2>
        {(!clients || clients.length === 0) ? (
          <p className="text-gray-400">Cargando datos de clientes...</p>
        ) : todayAccessLogs && todayAccessLogs.length > 0 ? (
          <>
            {console.log('[LOG][DASHBOARD] Estado de clients al renderizar:', clients)}
            <ul className="space-y-3 max-h-60 overflow-y-auto">
              {recentCheckIns.map(record => {
                console.log('[LOG][DASHBOARD] Renderizando registro desde backend:', record);
                // Buscar cliente por _id, id, o dni
                let client = clients.find(c => c._id === record.userId || c.id === record.userId);
                if (!client && record.dni) {
                  client = clients.find(c => c.dni === record.dni);
                }
                console.log('[LOG][DASHBOARD] Cliente resuelto:', client);
                return (
                  <li key={record._id || record.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                    <div>
                      <p className="text-white font-medium">{client ? `${client.nombre || client.firstName || ''} ${client.apellido || client.lastName || ''}` : `DNI: ${record.dni}`}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(record.checkInTime).toLocaleString('es-ES')} - {record.checkInType === 'qr' ? 'QR' : 'Manual'}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="text-gray-400">No hay registros de ingreso recientes.</p>
        )}
      </div>

    </div>
  );
};

export default HomePage;
