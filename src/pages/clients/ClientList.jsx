import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Para enlaces de navegación
import { TrashIcon, PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline'; // Iconos
import { confirmAction, showSuccess, showError } from '../../utils/alerts'; // Nuestro módulo de alertas (ajusta la ruta si es necesario)

const ClientList = () => {
  const [clients, setClients] = useState([]);

  // Cargar clientes de localStorage al montar el componente
  useEffect(() => {
    const storedClients = JSON.parse(localStorage.getItem('clients')) || [];
    setClients(storedClients);
  }, []);

  const handleDeleteClient = (dniToDelete) => {
    confirmAction(
      '¿Eliminar Cliente?',
      'Esta acción es irreversible y el cliente será eliminado permanentemente.',
      () => {
        try {
          const updatedClients = clients.filter(client => client.dni !== dniToDelete);
          localStorage.setItem('clients', JSON.stringify(updatedClients));
          setClients(updatedClients); // Actualizar el estado para re-renderizar la lista
          showSuccess('Cliente Eliminado', 'El cliente ha sido eliminado correctamente.');
        } catch (error) {
          showError('Error al Eliminar', 'No se pudo eliminar el cliente del localStorage.');
          console.error("Error deleting client from localStorage:", error);
        }
      }
    );
  };

  return (
    <div className="bg-gray-800 p-6 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-400">Lista de Clientes</h1>
          <Link
            to="/admin/clients/add" // Asumiendo que esta es la ruta para añadir cliente
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150 flex items-center"
          >
            <PencilSquareIcon className="w-5 h-5 mr-2" />
            Añadir Cliente
          </Link>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-10 bg-gray-700 rounded-lg shadow">
            <p className="text-xl text-gray-400">No hay clientes registrados.</p>
            <p className="mt-2 text-gray-500">Empieza añadiendo uno nuevo.</p>
          </div>
        ) : (
          <div className="bg-gray-900 shadow-xl rounded-lg overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">DNI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {clients.map((client) => (
                  <tr key={client.dni} className="hover:bg-gray-800 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{client.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.dni}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <Link 
                        to={`/admin/clients/qr/${client.dni}`} // Asumiendo que ClientQR puede tomar DNI como param
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-150"
                        title="Ver QR"
                      >
                        <EyeIcon className="w-5 h-5 inline" />
                      </Link>
                      {/* Futuro botón de editar
                      <button 
                        onClick={() => console.log('Editar cliente:', client.dni)} 
                        className="text-yellow-400 hover:text-yellow-300 transition-colors duration-150"
                        title="Editar Cliente"
                      >
                        <PencilSquareIcon className="w-5 h-5 inline" />
                      </button>
                      */}
                      <button
                        onClick={() => handleDeleteClient(client.dni)}
                        className="text-red-500 hover:text-red-400 transition-colors duration-150"
                        title="Eliminar Cliente"
                      >
                        <TrashIcon className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
         <div className="mt-8 text-center">
            <Link 
                to="/admin/clients" // Ruta para volver al dashboard de clientes
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors duration-150"
            >
                &larr; Volver a Clientes
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientList;