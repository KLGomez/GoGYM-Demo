// src/components/CameraUploader.jsx

import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { CloudArrowUpIcon, CameraIcon, XMarkIcon } from "@heroicons/react/24/outline";

// variable de entorno
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const videoConstraints = {
  width: 300,
  height: 300,
  facingMode: "user",
};


const CameraUploader = ({ onUploadComplete }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [error, setError] = useState(null); // por si algo falla
  const [showCamera, setShowCamera] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      setError(null); // limpiamos errores
      setShowCamera(false); // Ocultar cámara tras capturar
    } else {
      setError("No se pudo capturar la imagen. Asegurate de tener la cámara activa.");
    }
  }, []);

  const uploadToCloudinary = async () => {
    if (!imgSrc) return;

    setUploading(true);
    setError(null);

    // Convertir base64 a Blob
    function dataURLtoBlob(dataurl) {
      const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
      return new Blob([u8arr], { type: mime });
    }

    const formData = new FormData();
    formData.append("file", dataURLtoBlob(imgSrc));
    formData.append("upload_preset", "gogym_clientes");
    formData.append("folder", "clientes");

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload/`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        setUploadedUrl(data.secure_url);
        onUploadComplete(data.secure_url); // pasamos la URL al formulario
      } else {
        setError("Error al subir la imagen. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error al subir imagen:", err);
      setError("Error de conexión con Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto flex flex-col items-center justify-center">
      {!imgSrc ? (
        <>
          {!showCamera ? (
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto justify-center transition-colors duration-200"
            >
              <CameraIcon className="h-5 w-5 mr-2" />
              Abrir cámara
            </button>
          ) : (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="rounded-md w-full"
              />
              <div className="flex flex-col items-center justify-center sm:flex-row sm:flex-wrap gap-2 mt-4 w-full">
                <button
                  onClick={capture}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto justify-center transition-colors duration-200"
                >
                  <CameraIcon className="h-5 w-5 mr-2" />
                  Capturar Foto
                </button>
                <button
                  onClick={() => setShowCamera(false)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-4xl transition-colors duration-200"
                >
                  <XMarkIcon className="h-5 w-5 m-2" />
                </button>
              </div>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center">
          <img src={imgSrc} alt="Captura previa" className="rounded-md mb-4 w-64 h-64 object-cover" />
          {!uploadedUrl ? (
            <button
              onClick={uploadToCloudinary}
              disabled={uploading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto justify-center transition-colors duration-200"
            >
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              {uploading ? "Subiendo..." : "Subir a Cloudinary"}
            </button>
          ) : (
            <p className="text-green-400 text-sm">✅ Imagen subida correctamente</p>
          )}
          <button
            onClick={() => {
              setImgSrc(null);
              setUploadedUrl(null);
              setError(null);
            }}
            className="mt-2 text-sm text-orange-300 hover:underline w-full sm:w-auto"
          >
            Tomar otra foto
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraUploader;
