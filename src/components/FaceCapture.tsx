'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceCaptureProps {
  onFaceDetected?: (descriptor: Float32Array, imageData: string) => void;
  mode?: 'capture' | 'verify';
  existingDescriptor?: Float32Array;
}

export default function FaceCapture({ 
  onFaceDetected, 
  mode = 'capture',
  existingDescriptor 
}: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [match, setMatch] = useState<number | null>(null);

  // Charger les modèles face-api.js
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
        setIsLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des modèles de reconnaissance faciale');
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Démarrer la caméra
  useEffect(() => {
    if (!isModelLoaded) return;

    const startVideo = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      }
    };

    startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isModelLoaded]);

  // Détection en temps réel
  useEffect(() => {
    if (!isModelLoaded || !videoRef.current || mode !== 'verify' || !existingDescriptor) return;

    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          const distance = faceapi.euclideanDistance(
            detection.descriptor,
            existingDescriptor
          );
          
          // Distance < 0.6 = même personne
          const matchPercentage = Math.max(0, (1 - distance) * 100);
          setMatch(matchPercentage);

          // Dessiner le cadre
          const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
          const resizedDetection = faceapi.resizeResults(detection, dims);
          
          canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          const boxColor = matchPercentage > 60 ? '#4ade80' : '#f87171';
          faceapi.draw.drawDetections(canvasRef.current, [resizedDetection], { boxColor });
          faceapi.draw.drawFaceLandmarks(canvasRef.current, [resizedDetection]);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isModelLoaded, mode, existingDescriptor]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Caméra non initialisée. Veuillez recharger la page.');
      return;
    }

    try {
      setError('Détection du visage en cours...');
      
      // Options de détection plus permissives
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,  // Augmenté pour meilleure détection
        scoreThreshold: 0.3  // Plus permissif (0.5 par défaut)
      });

      const detection = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('❌ Aucun visage détecté. Assurez-vous que:\n• Votre visage est bien éclairé\n• Vous regardez la caméra\n• Vous êtes à environ 50cm de l\'écran');
        return;
      }

      // Vérifier la qualité de la détection
      if (detection.detection.score < 0.4) {
        setError('⚠️ Détection de faible qualité. Améliorez l\'éclairage et rapprochez-vous légèrement.');
        return;
      }

      setError('✅ Visage détecté ! Traitement en cours...');

      // Capturer l'image
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setError('Erreur de contexte canvas. Réessayez.');
        return;
      }
      
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);  // Qualité augmentée

      console.log('📸 Descripteur capturé:', {
        descriptorLength: detection.descriptor.length,
        detectionScore: detection.detection.score,
        imageSizeKB: Math.round(imageData.length / 1024)
      });

      // Retourner le descripteur et l'image
      if (onFaceDetected) {
        onFaceDetected(detection.descriptor, imageData);
      }

      setError('');
    } catch (err: any) {
      console.error('❌ Erreur capture:', err);
      setError(`Erreur lors de la capture: ${err.message || 'Erreur inconnue'}. Réessayez.`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffc200] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des modèles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className={`border rounded-lg p-4 ${
          error.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : error.includes('⚠️')
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <p className={`text-sm whitespace-pre-line ${
            error.includes('✅') 
              ? 'text-green-600 dark:text-green-400'
              : error.includes('⚠️')
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-red-600 dark:text-red-400'
          }`}>{error}</p>
        </div>
      )}

      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto"
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            if (canvasRef.current) {
              canvasRef.current.width = video.videoWidth;
              canvasRef.current.height = video.videoHeight;
            }
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        
        {mode === 'verify' && match !== null && (
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white font-semibold">
              Correspondance: {match.toFixed(0)}%
            </p>
            {match > 60 && (
              <p className="text-green-400 text-sm">✓ Visage reconnu</p>
            )}
          </div>
        )}
      </div>

      {mode === 'capture' && (
        <button
          onClick={capturePhoto}
          className="w-full bg-[#ffc200] hover:bg-[#cc9b00] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          📸 Capturer le visage
        </button>
      )}

      <div className="bg-[#fffefa] dark:bg-[#3d3200]/20 border border-[#e6af00] dark:border-[#cc9b00] rounded-lg p-4">
        <p className="text-sm text-[#3d3200] dark:text-[#ffc200]">
          💡 <strong>Conseil:</strong> Positionnez votre visage face à la caméra, bien éclairé et à environ 50cm de l'écran.
        </p>
      </div>
    </div>
  );
}

