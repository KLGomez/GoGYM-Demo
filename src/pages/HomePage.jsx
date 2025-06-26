import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { QrReader } from '@blackbox-vision/react-qr-reader';
import { showError } from '../utils/alerts';

const HomePage = () => {
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState('');
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // codeReaderRef ya no es necesario si confiamos en el desmontaje del componente.
  // const codeReaderRef = useRef(null);

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
             clientDetailsToDisplay["Info Membresía"] = "Datos de inicio/duración no en QR, cálculo no realizado.";
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

  const handleCameraScan = (result, error /*, codeReader */) => { // codeReader ya no se usa aquí directamente
    // Ya no se guarda codeReader en una ref.
    // if (codeReader) {
    //     codeReaderRef.current = codeReader;
    // }

    if (result) {
      const qrText = result?.getText();
      if (qrText) {
        processQrData(qrText, "Cámara");
        // La llamada explícita a reset() se elimina.
        // if (codeReaderRef.current) {
        //   codeReaderRef.current.reset();
        // }
        setShowCameraScanner(false); // Esto desmontará <QrReader /> y debería detener la cámara.
      }
    }
    if (error) {
      // Ignorar errores comunes que no son críticos para la UX
      const ignoredErrorNames = ["NotFoundException", "ChecksumException", "FormatException"];
      if (error.name && !ignoredErrorNames.includes(error.name) && !error.message?.includes("No QR code found")) {
          // console.error("Error de QR Scanner (@blackbox-vision/react-qr-reader):", error);
          // Podríamos querer ser más selectivos con los errores que mostramos al usuario.
          // Errores como NotAllowedError (permisos) o NotFoundError (cámara no encontrada) son importantes.
          if (error.name === "NotAllowedError" || error.name === "NotFoundError" || error.name === "OverconstrainedError") {
              setScanError(`Error de cámara: ${error.message}. Verifique permisos y que no esté en uso.`);
              setShowCameraScanner(false); // Ocultar si hay un error de cámara fundamental
          } else {
              // Para otros errores menos críticos, podríamos solo loguearlos o ignorarlos.
              // setScanError(`Error de escaneo: ${error.name}`);
          }
      }
    }
  };

  // useEffect para detener la cámara si se oculta manualmente
  // Este useEffect ya no es necesario si confiamos en el desmontaje del QrReader.
  /*
  useEffect(() => {
    if (!showCameraScanner && codeReaderRef.current) {
      // console.log("Ocultando cámara manualmente, reseteando lector...");
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
  }, [showCameraScanner]);
  */

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
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
              scanDelay={300} // algunas versiones usan 'delay'
              className="w-full h-auto" // Asegúrate de que el componente tenga un tamaño visible
              videoStyle={{ width: '100%', height: 'auto' }} // Estilo para el video interno
              // videoContainerStyle={{ paddingTop: '0' }} // Ajustes si es necesario
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
