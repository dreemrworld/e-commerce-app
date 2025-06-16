import React, { useState, useRef, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { useNotification } from '../../context/NotificationContext';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    // Cleanup function to stop camera when component unmounts or modal closes
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } else {
        setError('A API de multimédia não é suportada neste navegador.');
        showNotification('A API de multimédia não é suportada neste navegador.', 'error');
      }
    } catch (err) {
      console.error("Erro ao aceder à câmera:", err);
      let userMessage = 'Erro ao aceder à câmera.';
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
            userMessage = "Permissão para aceder à câmera foi negada. Por favor, autorize nas configurações do seu navegador.";
        } else if (err.name === "NotFoundError") {
            userMessage = "Nenhuma câmera compatível foi encontrada no seu dispositivo.";
        } else if (err.name === "NotReadableError") {
            userMessage = "A câmera está a ser usada por outra aplicação ou houve um erro de hardware.";
        }
      }
      setError(userMessage);
      showNotification(userMessage, 'error');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Set canvas dimensions to video stream dimensions for better quality
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg', 0.9); // Adjust quality as needed
        onCapture(base64Image);
        onClose(); // Close modal after capture
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tirar Foto do Produto">
      <div className="space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
        <div className="relative w-full aspect-[4/3] bg-gray-800 rounded-md overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            aria-label="Pré-visualização da câmera"
          />
          {!stream && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              A iniciar câmera...
            </div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleCapture} 
            disabled={!stream || !!error}
            className="bg-primary text-white"
          >
            Capturar Foto
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CameraCaptureModal;