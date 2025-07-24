import React, { useContext } from 'react';
import { SharedDataContext } from '../contexts/SharedDataContext';
import { UsersIcon, RectangleStackIcon, CurrencyDollarIcon, DocumentChartBarIcon, CalendarDaysIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

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
  const { clients, gymClasses, teachers, attendanceRecords, isLoading } = useContext(SharedDataContext);

  if (isLoading) {
    return <div className="text-center py-10"><p className="text-white">Cargando dashboard...</p></div>;
  }

  const activeClients = clients?.filter(c => c.membershipStatusDetails?.status === 'Active').length || 0;
  const totalClassesToday = gymClasses?.filter(c => c.day === new Date().toLocaleDateString('es-ES', { weekday: 'long' })).length || 0;
  const recentCheckIns = attendanceRecords?.slice(-5).reverse() || []; // Últimos 5 check-ins

  // Si `HomePage` también sirve como página de Check-in, se debe incluir esa funcionalidad aquí.
  // Por ahora, este es un Dashboard de Admin. La `CheckInPage.jsx` es la dedicada para check-in.

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-orange-400 mb-8">Dashboard Principal</h1>

      {/* Sección de Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        <StatCard title="Clientes Activos" value={activeClients} icon={UsersIcon} color="border-green-500" linkTo="/admin/clients" />
        <StatCard title="Clases Hoy" value={totalClassesToday} icon={CalendarDaysIcon} color="border-blue-500" linkTo="/admin/classes" />
        <StatCard title="Total Profesores" value={teachers?.length || 0} icon={UsersIcon} color="border-purple-500" linkTo="/admin/classes" />
        {/* El linkTo para profesores debería ser a ManageTeachersView, pero ClassesAdmin lo maneja internamente */}
        <StatCard title="Clases Totales" value={gymClasses?.length || 0} icon={RectangleStackIcon} color="border-yellow-500" linkTo="/admin/classes" />
      </div>

      {/* Sección de Últimos Check-ins (si aplica para el dashboard admin) */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-xl font-semibold text-orange-400 mb-4">Últimos Registros de Ingreso</h2>
        {attendanceRecords && attendanceRecords.length > 0 ? (
          <ul className="space-y-3 max-h-60 overflow-y-auto">
            {recentCheckIns.map(record => (
              <li key={record.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                <div>
                  <p className="text-white font-medium">{record.clientName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(record.checkInTime).toLocaleString('es-ES')} - {record.type === 'qr' ? 'QR' : 'Manual'}
                    {record.className && <span className="ml-2 text-orange-300">({record.className})</span>}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                    clients.find(c=>c.id === record.clientId)?.membershipStatusDetails?.status === "Active" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}>
                  {clients.find(c=>c.id === record.clientId)?.membershipStatusDetails?.status || 'N/A'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No hay registros de ingreso recientes.</p>
        )}
      </div>

      {/* Accesos Rápidos */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-orange-400 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <Link to="/admin/clients" className="bg-orange-500 hover:bg-orange-600 text-white text-center font-medium py-3 px-4 rounded-lg transition-colors">Gestionar Clientes</Link>
          <Link to="/admin/classes" className="bg-orange-500 hover:bg-orange-600 text-white text-center font-medium py-3 px-4 rounded-lg transition-colors">Gestionar Clases</Link>
          <Link to="/admin/memberships" className="bg-orange-500 hover:bg-orange-600 text-white text-center font-medium py-3 px-4 rounded-lg transition-colors">Membresías</Link>
          <Link to="/check-in" className="bg-teal-500 hover:bg-teal-600 text-white text-center font-medium py-3 px-4 rounded-lg transition-colors">Página de Check-In</Link>
        </div>
      </div>

    </div>
  );
};

export default HomePage;
