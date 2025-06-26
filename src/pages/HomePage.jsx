import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
// Html5QrcodeScanner se importará dinámicamente

const HomePage = () => {
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [scanError, setScanError] = useState('');

  const scannerRef = useRef(null);
  const scannerContainerRef = useRef(null); // Restaurar definición

  useEffect(() => {
    if (showCameraScanner && !scannerRef.current) {
      // Se asume que el div#camera-scanner-container existirá cuando esto se ejecute
      // si showCameraScanner es true, debido al renderizado condicional en JSX.
      // El console.warn problemático se elimina.

      import('html5-qrcode')
          .then(Html5QrcodeModule => {
            console.log('Html5QrcodeModule:', Html5QrcodeModule); // Inspeccionar el módulo
            if (!showCameraScanner) return;

            // Intentar acceder a Html5QrcodeScanner, ajustando según lo que muestre el console.log
            // Posibles intentos:
            // const Html5QrcodeScanner = Html5QrcodeModule.Html5QrcodeScanner;
            // const Html5QrcodeScanner = Html5QrcodeModule.default;
            // const Html5QrcodeScanner = Html5QrcodeModule; // Si el módulo exporta la clase directamente

            // Por ahora, mantenemos la forma original y vemos qué loguea:
            // const Html5QrcodeScanner = Html5QrcodeModule.Html5QrcodeScanner;

            console.log('Inspeccionando Html5QrcodeModule:', Html5QrcodeModule); // Debugging line

            const ScannerClass = Html5QrcodeModule.Html5QrcodeScanner ||
                               Html5QrcodeModule.default?.Html5QrcodeScanner ||
                               Html5QrcodeModule.default ||
                               Html5QrcodeModule;

            console.log('Intentando usar ScannerClass:', typeof ScannerClass, ScannerClass); // Debugging line

            if (typeof ScannerClass !== 'function') {
              console.error("ScannerClass no es una función constructora:", ScannerClass, "Módulo original:", Html5QrcodeModule);
              setScanError("Error crítico: Fallo al cargar la librería de escaneo (constructor inválido).");
              setShowCameraScanner(false);
              return;
            }

            // Verificar existencia del div ANTES de instanciar
            const scannerContainerId = "camera-scanner-container";
            if (!document.getElementById(scannerContainerId)) {
                console.error(`Error: El div #${scannerContainerId} NO está en el DOM antes de new ScannerClass().`);
                setScanError("Error de UI: No se pudo preparar el visor de la cámara.");
                setShowCameraScanner(false);
                return;
            }

            let html5QrcodeScannerInstance;
            try {
                html5QrcodeScannerInstance = new ScannerClass( // Usar ScannerClass
                scannerContainerId, // Usar la variable del ID
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false // verbose
              );
            } catch (instantiationError) {
              console.error("Error al instanciar ScannerClass:", instantiationError);
              setScanError("Error al iniciar el escáner. Verifique la consola para más detalles.");
              setShowCameraScanner(false);
              return;
            }

            if (!html5QrcodeScannerInstance) {
                console.error("La instanciación de ScannerClass devolvió undefined.");
                setScanError("Fallo al inicializar el escáner (instancia nula).");
                setShowCameraScanner(false);
                return;
            }

            const qrCodeSuccessCallback = (decodedText, decodedResult) => {
              processQrData(decodedText, "Cámara");
              setShowCameraScanner(false);
            };

            const qrCodeErrorCallback = (errorMessage) => { /* Silenciado por ahora */ };

            html5QrcodeScannerInstance.render(qrCodeSuccessCallback, qrCodeErrorCallback)
              .then(() => {
                  if(showCameraScanner) {
                      scannerRef.current = html5QrcodeScannerInstance;
                  } else {
                      html5QrcodeScannerInstance.clear().catch(e => console.error("Scanner limpiado post-render (estado cambiado)", e));
                  }
              })
              .catch(renderError => {
                  console.error("Error al renderizar Html5QrcodeScanner:", renderError);
                  setScanError("No se pudo iniciar el escáner de cámara. Verifique permisos/cámara.");
                  setShowCameraScanner(false);
              });
          })
          .catch(error => {
            console.error("Error al cargar html5-qrcode:", error);
            setScanError("Error al cargar componente de escaneo.");
            setShowCameraScanner(false);
          });
    } else if (!showCameraScanner && scannerRef.current) {
      // Si showCameraScanner es false y hay una instancia, limpiarla
      scannerRef.current.clear().then(() => {
        scannerRef.current = null;
      }).catch(err => {
        // console.error("Error al limpiar scanner (al ocultar): ", err);
        scannerRef.current = null;
      });
    }

    // Función de limpieza para el useEffect, se ejecuta cuando showCameraScanner cambia o el componente se desmonta
    return () => {
      // clearTimeout(timerId); // No necesitamos timerId si eliminamos el setTimeout
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => { /* console.error("Error al limpiar scanner en cleanup:", err); */ });
        scannerRef.current = null;
      }
    };
  }, [showCameraScanner]); // Dependencia simplificada


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
          <div ref={scannerContainerRef} id="camera-scanner-container" className="w-full h-auto min-h-[250px] bg-gray-700 rounded-md my-4 overflow-hidden">
            {/* Este div debe estar vacío para que html5-qrcode renderice aquí */}
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
