import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { SharedDataContext } from '../contexts/SharedDataContext';
import { showError, showSuccess } from '../utils/alerts';
import { calculateMembershipDetails } from '../utils/membershipUtils';
import { QrCodeIcon, UserIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { startQRScanner } from '../utils/readQr.js';
import { processManualEntry } from '../utils/manualEntry';
import { registerAccessLog } from '../api/accessLogs';





const CheckInPage = () => {
  const navigate = useNavigate();
  const { clients, isLoading, addAttendanceRecord } = useContext(SharedDataContext);
  const [manualCode, setManualCode] = useState('');
  const [clientDetails, setClientDetails] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [processing, setProcessing] = useState(false);

  const scannerRef = useRef(null);
  const processCheckIn = useCallback(async (identifier, type) => {
    if (processing) return;
    setProcessing(true);
    setClientDetails(null);

    let foundClient = null;

    if (type === 'qr') {
      try {
        const qrData = JSON.parse(identifier);
        // Asumimos que el QR contiene clientId o alphanumericCode
        if (qrData.clientId) {
          foundClient = clients.find(c => c.id === qrData.clientId || c._id === qrData.clientId);
        } else if (qrData.alphanumericCode) {
          foundClient = clients.find(c => c.alphanumericCode === qrData.alphanumericCode);
        } else {
          console.warn('[CHECKIN][QR] El QR no contiene clientId ni alphanumericCode:', qrData);
          showError("QR Inválido", "El código QR no contiene la información necesaria.");
          setProcessing(false);
          return;
        }
      } catch (err) {
        showError("Error de QR", "No se pudo procesar el código QR.");
        setProcessing(false);
        return;
      }
    } else if (type === 'manual') {
      const result = processManualEntry({ identifier, clients, addAttendanceRecord });

      if (!result) {
        setProcessing(false);
        return;
      }

      setClientDetails(result);
      // Personalizar el alert para ingreso manual
      if (result.membershipStatusDetails?.status === 'Active') {
        showSuccess('checkinSuccess', {
          title: `¡Acceso concedido!`,
          text: `Bienvenido/a. Tu membresía está activa.`
        });
        try {
          const clientId = result.id || result._id;
          const clientName = `${result.firstName || result.nombre || ''} ${result.lastName || result.apellido || ''}`.trim();
          const dni = result.dni;
          await registerAccessLog({
            clientId,
            clientName,
            checkInTime: new Date().toISOString(),
            dni,
            checkInType: 'manual'
          });
        } catch (error) {
          showError('backendError', {
            title: 'Error al registrar acceso en backend',
            text: 'No se pudo guardar el registro de acceso. Intente nuevamente.'
          });
        }
      } else {
        showError('checkinDenied', {
          title: `Acceso denegado para ${result.firstName} ${result.lastName}`,
          text: `Tu membresía está ${result.membershipStatusDetails?.status?.toLowerCase() || 'inactiva'}. Por favor, regulariza tu situación para ingresar.`
        });
      }
      setProcessing(false);
      setManualCode('');
      return;
    }



    if (!foundClient) {
      showError("Cliente No Encontrado", "No se encontró ningún cliente con ese código o DNI.");
      setProcessing(false);
      return;
    }

    // Sincronizar estado de membresía con backend si es posible
    // Si tienes un endpoint para validar membresía, úsalo aquí. Por ahora, se mantiene la lógica local:
    // Adaptar los datos para la función de membresía
    let startDate = foundClient.membership?.membershipStartDate || foundClient.fechaInicioMembresia;
    let durationDays = foundClient.membership?.membershipDurationDays;
    if (!durationDays && foundClient.fechaInicioMembresia && foundClient.fechaFinMembresia) {
      const inicio = new Date(foundClient.fechaInicioMembresia);
      const fin = new Date(foundClient.fechaFinMembresia);
      durationDays = Math.ceil((fin - inicio) / (1000 * 3600 * 24));
    }
    const membershipInfo = calculateMembershipDetails(startDate, durationDays);

    setClientDetails({ ...foundClient, membershipStatusDetails: membershipInfo });

    if (membershipInfo.status === "Active") {
      // Registrar acceso general en backend
      try {
        const clientId = foundClient.id || foundClient._id;
        const clientName = `${foundClient.firstName || foundClient.nombre || ''} ${foundClient.lastName || foundClient.apellido || ''}`.trim();
        const dni = foundClient.dni;
        await registerAccessLog({
          clientId,
          clientName,
          checkInTime: new Date().toISOString(),
          dni,
          checkInType: type
        });
        addAttendanceRecord({
          clientId,
          clientName,
          checkInTime: new Date().toISOString(),
          type: type,
        });
        showSuccess('checkinSuccess', {
          title: `¡Acceso concedido!`,
          text: `Bienvenido/a. Tu membresía está ${membershipInfo.status === 'Active' ? 'activa' : membershipInfo.status.toLowerCase()} y el acceso fue registrado.`
        });
      } catch (error) {
        console.error('[CHECKIN][QR] Error al registrar acceso en backend:', error);
        showError('backendError', {
          title: 'Error al registrar acceso en backend',
          text: 'No se pudo guardar el registro de acceso. Intente nuevamente.'
        });
      }
    } else {
      console.warn('[CHECKIN][QR] Membresía inactiva para cliente:', foundClient, membershipInfo);
      showError('checkinDenied', {
        title: `Acceso denegado para ${foundClient.firstName} ${foundClient.lastName}`,
        text: `Tu membresía está ${membershipInfo.status.toLowerCase()}. Por favor, regulariza tu situación para ingresar.`
      });
    }
    setProcessing(false);
    setManualCode(''); // Limpiar input manual
  }, [clients, processing, addAttendanceRecord]);

  // Configuración del scanner
  const stopScannerRef = useRef(null); // para guardar la función de cleanup del scanner

  useEffect(() => {
    if (scannerActive && scannerRef.current) {
      startQRScanner(
        scannerRef.current,
        (result) => {
          setScannerActive(false);
          processCheckIn(result, 'qr');
        },
        (error) => {
          console.error("Error escaneando QR:", error);
        }
      ).then(stop => {
        stopScannerRef.current = stop;
      });
    }

    return () => {
      if (stopScannerRef.current) {
        stopScannerRef.current();
        stopScannerRef.current = null;
      }
    };
  }, [scannerActive, processCheckIn]);




  const handleManualSubmit = (event) => {
    event.preventDefault();
    processCheckIn(manualCode, 'manual');
  };

  const toggleScanner = () => {
    setScannerActive(!scannerActive);
    setClientDetails(null);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center"><p>Cargando datos...</p></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center">

      <button
        onClick={() => navigate('/admin')} // o la ruta de tu dashboard
        className="mb-6 text-orange-400 hover:text-orange-500 flex items-center font-semibold"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver al Dashboard
      </button>
      <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg hover:shadow-orange-500 shadow-md">


        <h1 className="text-3xl font-bold text-white mb-6 text-center">Registro de Ingreso</h1>

        {/* Botón para activar/desactivar scanner */}
        <button
          onClick={toggleScanner}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 mb-6 rounded-md font-semibold text-white transition-colors
                        ${scannerActive ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'}`}
        >
          <QrCodeIcon className="w-6 h-6" />
          {scannerActive ? 'Desactivar Escáner QR' : 'Activar Escáner QR'}
        </button>

        {/* Contenedor del Scanner QR */}
        {scannerActive && (
          <div className="mb-6 relative">
            <video ref={scannerRef} className="w-full rounded-lg border-2 border-orange-400" />
            <p className="text-sm text-gray-400 mt-2 text-center">Colocá el código QR frente a la cámara.</p>
          </div>
        )}


        {/* Formulario para ingreso manual */}
        {!scannerActive && (
          <form onSubmit={handleManualSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="manualCode" className="block text-sm font-medium text-gray-300 mb-1">
                Ingreso Manual (Ingrese el DNI del cliente):
              </label>
              <div className="flex">
                <div className="flex flex-col xs:flex-row w-full gap-2">
                  <input
                    type="text"
                    id="manualCode"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ej: JP12345678 o DNI"
                    className="flex-grow p-3 bg-gray-700 border border-gray-600 text-white rounded-md xs:rounded-l-md xs:rounded-r-none focus:ring-orange-500 focus:border-orange-500"
                    disabled={processing}
                  />
                  <button
                    type="submit"
                    disabled={processing || !manualCode.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold p-3 rounded-md xs:rounded-r-md xs:rounded-l-none disabled:opacity-50 flex items-center justify-center min-w-[90px] sm:min-w-[120px] text-xs sm:text-base"
                  >
                    {processing ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                    <span className="ml-1 sm:ml-2 truncate">Verificar</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Resultados del Check-in */}
        {clientDetails && (
          <div className={`mt-6 p-4 rounded-md border-l-4 ${clientDetails.membershipStatusDetails.status === "Active" ? 'bg-green-900 border-green-500' : 'bg-red-900 border-red-500'}`}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {clientDetails.fotoUrl && (
                <img
                  src={clientDetails.fotoUrl}
                  alt="Foto del cliente"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-600 mb-4 md:mb-0"
                  style={{ background: '#222' }}
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{clientDetails.firstName || clientDetails.nombre} {clientDetails.lastName || clientDetails.apellido}</h3>
                <p>Email: {clientDetails.email}</p>
                <p>DNI: {clientDetails.dni}</p>
                {/* <p>Código: {clientDetails.alphanumericCode || clientDetails.codigo || 'N/A'}</p> */}
                {/* <p>Plan: {clientDetails.membership?.planName || clientDetails.planAsignadoId || 'N/A'}</p> */}
                <p>Estado Membresía: <span className={`font-bold ${clientDetails.membershipStatusDetails.status === "Active" ? 'text-green-400' : 'text-red-400'}`}>
                  {clientDetails.membershipStatusDetails.status}
                </span></p>
                {clientDetails.membershipStatusDetails.status !== "Active" && clientDetails.membershipStatusDetails.membershipEndDate && (
                  <p>Venció el: {new Date(clientDetails.membershipStatusDetails.membershipEndDate).toLocaleDateString()}</p>
                )}
                {clientDetails.membershipStatusDetails.status === "Active" && clientDetails.membershipStatusDetails.membershipEndDate && (
                  <p>Vence el: {new Date(clientDetails.membershipStatusDetails.membershipEndDate).toLocaleDateString()} ({clientDetails.membershipStatusDetails.daysRemaining} días restantes)</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInPage;
