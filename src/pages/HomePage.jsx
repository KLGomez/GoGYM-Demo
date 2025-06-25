import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

const HomePage = () => {
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [scanError, setScanError] = useState('');

  const scannerRef = useRef(null); // Ref para el objeto scanner

  // Configuración del scanner
  useEffect(() => {
    if (showCameraScanner && !scannerRef.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "camera-scanner-container", // ID del div contenedor
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        },
        false // verbose
      );

      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        processQrData(decodedText, "Cámara");
        setShowCameraScanner(false);
      };

      const qrCodeErrorCallback = (errorMessage) => {
        // No hacer nada con errores comunes como "QR code not found."
        // setScanError(`Error de cámara: ${errorMessage}`);
        // console.warn(`QR Error: ${errorMessage}`);
      };

      html5QrcodeScanner.render(qrCodeSuccessCallback, qrCodeErrorCallback);
      scannerRef.current = html5QrcodeScanner;
    } else if (!showCameraScanner && scannerRef.current) {
      // Detener y limpiar el scanner si se oculta
      scannerRef.current.clear().then(() => {
        scannerRef.current = null;
      }).catch(err => {
        console.error("Error al limpiar el scanner: ", err);
      });
    }

    // Limpieza al desmontar el componente
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => {
          console.error("Error al limpiar el scanner al desmontar: ", err);
        });
      }
    };
  }, [showCameraScanner]);


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
      if (parsedData && parsedData.clientId && parsedData.name) { // Verificar campos mínimos
        // Aquí podríamos buscar el cliente en LocalStorage para obtener más detalles si es necesario
        // o si el QR solo contuviera el clientId.
        // Por ahora, asumimos que el QR tiene los datos necesarios o los mostramos tal cual.

        // Para mostrar estado de membresía, necesitamos la función de cálculo y los datos de inicio/duración
        // Esto asume que el QR contiene membershipStartDate y membershipDurationDays, o que los obtenemos de otra forma.
        // Si el QR ya tiene membershipEndDate y status (como definimos al generar), es más simple:

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
            // Si el QR tiene estos datos, podemos calcularlo (requiere importar calculateMembershipDetails)
            // import { calculateMembershipDetails } from "../utils/membershipUtils";
            // const details = calculateMembershipDetails(parsedData.membershipStartDate, parsedData.membershipDurationDays);
            // clientDetailsToDisplay = { ...clientDetailsToDisplay, ...details };
            // Por simplicidad, si no vienen en el QR, no los mostramos ahora.
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
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

        {showCameraScanner && (
          <div id="camera-scanner-container" className="w-full h-auto min-h-[250px] bg-gray-700 rounded-md flex items-center justify-center my-4 overflow-hidden">
            {/* El visor de html5-qrcode se renderizará aquí */}
          </div>
        )}

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
