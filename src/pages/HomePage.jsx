import React, { useState, useEffect, useRef } from 'react'; // Asegurar useEffect y useRef
import { CameraIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { QrReader } from '@blackbox-vision/react-qr-reader';
import { showError } from '../utils/alerts';
// Asumimos que getClients y calculateMembershipDetails están en utils y funcionan
// import { getClients } from '../utils/storage';
// import { calculateMembershipDetails } from '../utils/membershipUtils';

const HomePage = () => {
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState('');
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // const codeReaderRef = useRef(null); // No se usa si confiamos en el desmontaje del componente

  const handleExternalScan = (e) => {
    e.preventDefault();
    if (!qrInput.trim()) {
      setScanError("Por favor, ingrese o escanee un código QR.");
      setScanResult('');
      return;
    }
    setScanError('');
    processQrData(qrInput, "Escáner Externo");
    setQrInput('');
  };

  const processQrData = (qrString, sourceType) => {
    try {
      const parsedData = JSON.parse(qrString);
      if (parsedData && parsedData.clientId && parsedData.name) {
        // Simulación de búsqueda de cliente y cálculo de membresía
        // En una app real, aquí se buscaría en `clients` y se usaría `calculateMembershipDetails`
        let clientDetailsToDisplay = {
            Nombre: parsedData.name,
            Email: parsedData.email || 'N/A',
            Plan: parsedData.plan || 'N/A',
            "ID Cliente": parsedData.clientId,
        };

        if (parsedData.membershipEndDate && parsedData.status) {
            const endDate = new Date(parsedData.membershipEndDate);
            const today = new Date();
            today.setHours(0,0,0,0);
            const endOfDayEndDate = new Date(endDate);
            endOfDayEndDate.setHours(23,59,59,999);
            const timeDiff = endOfDayEndDate.getTime() - today.getTime();
            const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

            clientDetailsToDisplay = {
                ...clientDetailsToDisplay,
                "Estado Membresía": parsedData.status,
                "Vencimiento": endDate.toLocaleDateString('es-ES'),
                "Días Restantes": daysRemaining < 0 ? 0 : daysRemaining,
            };
        } else if (parsedData.membershipStartDate && typeof parsedData.membershipDurationDays === 'number') {
             // Esta lógica requeriría importar y usar calculateMembershipDetails
             // y tener acceso a la lista completa de clientes si el QR solo trae el ID.
             // Por ahora, lo dejamos así para simplificar.
             clientDetailsToDisplay["Info Membresía"] = "Datos de membresía completos no en QR (se requiere cálculo).";
        }

        setScanResult({
          source: sourceType,
          data: clientDetailsToDisplay,
          raw: qrString,
        });
        setScanError('');
      } else {
        setScanError(`Error (${sourceType}): QR no reconocido como un código de cliente válido.`);
        setScanResult('');
      }
    } catch (error) {
      setScanError(`Error (${sourceType}): El código QR no es un JSON válido. (${error.message})`);
      setScanResult('');
    }
  };

  const handleCameraScan = (result, error /*, codeReader */) => { // codeReader no se usa explicitamente aquí
    if (result) {
      const qrText = result?.getText(); // Algunas versiones usan result.text
      if (qrText) {
        processQrData(qrText, "Cámara");
        setShowCameraScanner(false); // Esto debería desmontar <QrReader /> y detener la cámara.
      }
    }
    if (error) {
      const ignoredErrorNames = ["NotFoundException", "ChecksumException", "FormatException", "ReaderException"];
      if (error.name && !ignoredErrorNames.includes(error.name) && !error.message?.includes("No QR code found") && !error.message?.includes("service unavailable")) {
          if (error.name === "NotAllowedError" || error.name === "NotFoundError" || error.name === "OverconstrainedError") {
              setScanError(`Error de cámara: ${error.message}. Verifique permisos y que no esté en uso.`);
              setShowCameraScanner(false);
          } else {
              // console.info("Error de escaneo QR no crítico:", error.name, error.message);
          }
      }
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4"> {/* bg-gray-900 eliminado */}
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl space-y-6">
        <h1 className="text-4xl font-bold text-orange-400 text-center mb-8">
          GoGYM - Control de Acceso
        </h1>

        <button
          onClick={() => {
            setShowCameraScanner(prev => !prev);
            setScanResult('');
            setScanError('');
          }}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-500 transition-transform transform hover:scale-105"
        >
          <CameraIcon className="h-6 w-6" aria-hidden="true" />
          {showCameraScanner ? "Ocultar Cámara" : "Escanear con Cámara"}
        </button>

        {showCameraScanner && (
          <div className="my-4 p-4 bg-gray-700 rounded-md">
            <QrReader
              onResult={handleCameraScan}
              constraints={{ facingMode: 'environment' }}
              scanDelay={300}
              className="w-full h-auto"
              videoStyle={{ width: '100%', height: 'auto' }}
            />
            <p className="text-center text-sm text-gray-400 mt-2">Apunte la cámara al código QR.</p>
          </div>
        )}

        <form onSubmit={handleExternalScan} className="space-y-4">
          <div>
            <label htmlFor="qrCodeInput" className="block text-sm font-medium text-gray-300 mb-1">
              Entrada QR (Escáner Externo o Manual):
            </label>
            <input
              type="text"
              name="qrCodeInput"
              id="qrCodeInput"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Esperando datos del QR..."
              className="w-full px-4 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-transform transform hover:scale-105"
          >
            <DocumentTextIcon className="h-6 w-6" aria-hidden="true" />
            Procesar Entrada
          </button>
        </form>

        {scanError &&
          <div className="mt-6 p-3 bg-red-800 rounded-md text-center">
            <p className="text-sm text-red-100">{scanError}</p>
          </div>
        }
        {scanResult && typeof scanResult === 'object' && scanResult.data && (
          <div className="mt-6 p-4 bg-gray-700 rounded-md">
            <h3 className="text-lg font-semibold text-orange-300 mb-2">
              Cliente Verificado ({scanResult.source}):
            </h3>
            {Object.entries(scanResult.data).map(([key, value]) => (
              <p key={key} className="text-sm text-gray-100">
                <span className="font-semibold">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
              </p>
            ))}
             <details className="mt-2 text-xs text-gray-400">
                <summary>Datos crudos del QR</summary>
                <pre className="whitespace-pre-wrap break-all bg-gray-800 p-2 rounded mt-1">{scanResult.raw}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
