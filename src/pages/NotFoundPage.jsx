import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white text-center p-6">
      <ExclamationTriangleIcon className="w-24 h-24 text-orange-400 mb-4" />
      <h1 className="text-4xl font-bold text-orange-400 mb-2">404 - Página No Encontrada</h1>
      <p className="text-lg text-gray-300 mb-6">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link
        to="/"
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105"
      >
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;