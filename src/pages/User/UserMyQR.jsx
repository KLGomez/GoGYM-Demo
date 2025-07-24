import React, { useContext, useRef } from 'react';
import { SharedDataContext } from '../../contexts/SharedDataContext';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowDownTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { showError } from '../../utils/alerts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const UserMyQRPage = () => {
  const { currentUser, isLoading } = useContext(SharedDataContext);
  const navigate = useNavigate();
  const qrCardRef = useRef(null);

  if (isLoading) {
    return <div className="text-center py-10"><p className="text-white">Cargando tu información...</p></div>;
  }

  if (!currentUser) {
    // Esto no debería suceder si AppUser protege bien la ruta, pero es un fallback.
    showError("Acceso Denegado", "Debes iniciar sesión para ver tu código QR.");
    navigate('/login');
    return null;
  }

  const clientNameForDisplay = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();

  // Datos a codificar en el QR. Deben coincidir con lo que CheckInPage espera.
  const qrDataToEncode = {
    clientId: currentUser.id,
    name: clientNameForDisplay,
    email: currentUser.email,
    plan: currentUser.membership?.planName,
    alphanumericCode: currentUser.alphanumericCode, // Incluir el código alfanumérico
    // No incluimos membershipEndDate o status directamente en el QR para que CheckInPage siempre valide con datos frescos del contexto.
  };
  const qrDataString = JSON.stringify(qrDataToEncode);

  const handleDownloadPDF = () => {
    if (qrCardRef.current) {
      html2canvas(qrCardRef.current, {
        scale: 2, // Aumentar escala para mejor resolución en PDF
        backgroundColor: '#1f2937' // Color de fondo del div, para que no sea transparente
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height] // Ajustar tamaño del PDF al del canvas
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`GoGym_QR_${currentUser.alphanumericCode || 'Usuario'}.pdf`);
      }).catch(err => {
        console.error("Error generando PDF:", err);
        showError("Error de Descarga", "No se pudo generar el PDF del código QR.");
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 text-white">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-orange-400 hover:text-orange-500 flex items-center font-semibold"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver
      </button>

      <h1 className="text-3xl font-bold text-center text-orange-400 mb-8">Mi Código QR de Acceso</h1>

      <div
        ref={qrCardRef}
        className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl max-w-sm mx-auto flex flex-col items-center space-y-5 border border-gray-700"
      >
        <div className="p-3 bg-white rounded-lg shadow-md">
          <QRCodeCanvas
            value={qrDataString}
            size={200} // Tamaño del QR
            bgColor="#ffffff"
            fgColor="#000000"
            level="H" // Nivel de corrección de errores (L, M, Q, H)
            imageSettings={{ // Opcional: para añadir un logo en el centro si se desea
              // src: "/path-to-your-logo-for-qr.png",
              // height: 40,
              // width: 40,
              // excavate: true,
            }}
          />
        </div>

        <div className="text-center">
          <p className="text-2xl font-semibold text-white">{clientNameForDisplay}</p>
          <p className="text-gray-400">{currentUser.email}</p>
          {currentUser.alphanumericCode && (
            <p className="mt-3 text-lg">
              <span className="text-gray-300 font-medium">Tu Código: </span>
              <span className="text-orange-400 font-bold tracking-wider bg-gray-700 px-2 py-1 rounded">
                {currentUser.alphanumericCode}
              </span>
            </p>
          )}
          {currentUser.membership?.planName && (
            <p className="text-gray-300 mt-1">Plan: {currentUser.membership.planName}</p>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center mt-4 px-4">
          Presenta este código QR o tu código alfanumérico en la recepción para registrar tu ingreso.
        </p>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={handleDownloadPDF}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center mx-auto gap-2"
        >
          <ArrowDownTrayIcon className="w-6 h-6" />
          Descargar QR (PDF)
        </button>
      </div>
    </div>
  );
};

export default UserMyQRPage;
