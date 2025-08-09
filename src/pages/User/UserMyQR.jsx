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
    showError("Acceso Denegado", "Debes iniciar sesión para ver tu código QR.");
    navigate('/login');
    return null;
  }

  const clientNameForDisplay = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();

  const qrDataToEncode = {
    clientId: currentUser.id,
    name: clientNameForDisplay,
    email: currentUser.email,
    plan: currentUser.membership?.planName,
    alphanumericCode: currentUser.alphanumericCode,
  };

  const qrDataString = JSON.stringify(qrDataToEncode);

  const handleDownloadPDF = () => {
    if (qrCardRef.current) {
      html2canvas(qrCardRef.current, {
        scale: 2,
        backgroundColor: '#1f2937'
      })
        .then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`GoGym_QR_${currentUser.alphanumericCode || 'Usuario'}.pdf`);
        })
        .catch(err => {
          console.error("Error generando PDF:", err);
          showError("Error de Descarga", "No se pudo generar el PDF del código QR.");
        });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 text-white">

      <h1 className="text-3xl font-bold text-center text-orange-400 mb-8">Mi Código QR de Acceso</h1>

      {/* Zona segura para html2canvas */}
      <div
        ref={qrCardRef}
        style={{
          backgroundColor: '#1f2937', // gray-800
          color: '#f5f5f5',
          border: '1px solid #374151', // gray-700
          padding: '2rem',
          borderRadius: '1rem',
          maxWidth: '24rem',
          margin: '0 auto',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '0.5rem' }}>
          <QRCodeCanvas
            value={qrDataString}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff' }}>
            {clientNameForDisplay}
          </p>
          <p style={{ color: '#9ca3af' }}>{currentUser.email}</p>
          {currentUser.alphanumericCode && (
            <p style={{ marginTop: '0.75rem', fontSize: '1.125rem' }}>
              <span style={{ color: '#d1d5db', fontWeight: '500' }}>Tu Código: </span>
              <span
                style={{
                  color: '#fb923c',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  backgroundColor: '#374151',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                }}
              >
                {currentUser.alphanumericCode}
              </span>
            </p>
          )}
          {currentUser.membership?.planName && (
            <p style={{ color: '#d1d5db', marginTop: '0.25rem' }}>
              Plan: {currentUser.membership.planName}
            </p>
          )}
        </div>

        <p
          style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            textAlign: 'center',
            marginTop: '1rem',
            padding: '0 1rem',
          }}
        >
          Presenta este código QR en la recepción para registrar tu ingreso.
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
