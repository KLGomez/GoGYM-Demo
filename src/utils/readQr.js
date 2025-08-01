import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";

export const startQRScanner = async (videoElement, onResult, onError) => {
  try {
    const codeReader = new BrowserMultiFormatReader();

    const devices = await BrowserMultiFormatReader.listVideoInputDevices();
    if (!devices.length) throw new Error("No se encontraron cámaras");

    let activeControl = null;

    await codeReader.decodeFromVideoDevice(
      null,
      videoElement,
      (result, error, control) => {
        if (!activeControl) activeControl = control;

        if (result) {
          onResult(result.getText());
          control.stop(); // Detenemos el escaneo después de una lectura exitosa
        } else if (error && !(error instanceof NotFoundException)) {
          console.warn("Error escaneando:", error);
          if (onError) onError(error);
        }
      }
    );

    return () => {
      if (activeControl) activeControl.stop(); // Esta es la función de cleanup que se ejecuta desde el useEffect
    };
  } catch (err) {
    console.error("Error inicializando el lector QR:", err);
    if (onError) onError(err);
  }
};
