/**
 * Composant de scan facial progressif avec vérification d'unicité
 * @author VHD Church Management System
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { CheckCircle, AlertCircle, Scan } from 'lucide-react';

interface FaceScannerProps {
  userId: string;
  onScanComplete: (descriptor: Float32Array, imageData: string) => void;
  onAlreadyRegistered?: () => void;
}

export default function FaceScanner({ userId, onScanComplete, onAlreadyRegistered }: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [scanStage, setScanStage] = useState<'idle' | 'detecting' | 'scanning' | 'processing' | 'complete'>('idle');
  const [detections, setDetections] = useState<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>[]>([]);

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

  // Vérifier si l'utilisateur a déjà enregistré son visage
  const checkExistingRegistration = async () => {
    setCheckingExisting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/facial-recognition-proxy?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setError('❌ Visage déjà enregistré. Vous ne pouvez enregistrer qu\'une seule fois.');
          setCheckingExisting(false);
          if (onAlreadyRegistered) {
            onAlreadyRegistered();
          }
          return true;
        }
      }
      setCheckingExisting(false);
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setCheckingExisting(false);
      return false;
    }
  };

  // Lancer le scan progressif
  const startScan = async () => {
    // Vérifier d'abord si déjà enregistré
    const alreadyRegistered = await checkExistingRegistration();
    if (alreadyRegistered) {
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      setError('Caméra non initialisée. Veuillez recharger la page.');
      return;
    }

    setIsScanning(true);
    setScanStage('detecting');
    setScanProgress(0);
    setDetections([]);
    setError('');

    try {
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.4
      });

      // Scanner le visage 10 fois pour obtenir une moyenne des descripteurs
      const totalScans = 10;
      const collectedDetections: typeof detections = [];

      for (let i = 0; i < totalScans; i++) {
        setScanStage('scanning');
        setScanProgress(((i + 1) / totalScans) * 100);
        
        const detection = await faceapi
          .detectSingleFace(videoRef.current, options)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          setError('❌ Visage perdu pendant le scan. Gardez votre visage face à la caméra.');
          setIsScanning(false);
          setScanStage('idle');
          return;
        }

        // Vérifier la qualité
        if (detection.detection.score < 0.5) {
          setError('⚠️ Qualité insuffisante. Améliorez l\'éclairage.');
          setIsScanning(false);
          setScanStage('idle');
          return;
        }

        collectedDetections.push(detection);
        setDetections([...collectedDetections]);

        // Dessiner la détection sur le canvas
        if (canvasRef.current && videoRef.current) {
          const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
          const resizedDetection = faceapi.resizeResults(detection, dims);
          
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            faceapi.draw.drawDetections(canvasRef.current, [resizedDetection], { boxColor: '#4ade80' });
            faceapi.draw.drawFaceLandmarks(canvasRef.current, [resizedDetection]);
          }
        }

        // Pause entre les scans
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Calculer le descripteur moyen
      setScanStage('processing');
      const avgDescriptor = new Float32Array(128);
      for (let i = 0; i < 128; i++) {
        let sum = 0;
        collectedDetections.forEach(det => {
          sum += det.descriptor[i];
        });
        avgDescriptor[i] = sum / collectedDetections.length;
      }

      // Capturer l'image finale
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.95);

        console.log('✅ Scan facial terminé:', {
          totalScans: collectedDetections.length,
          avgQualityScore: collectedDetections.reduce((sum, d) => sum + d.detection.score, 0) / collectedDetections.length,
          descriptorLength: avgDescriptor.length
        });

        setScanStage('complete');
        
        // Retourner le résultat
        setTimeout(() => {
          onScanComplete(avgDescriptor, imageData);
        }, 500);
      }

    } catch (err: any) {
      console.error('❌ Erreur scan:', err);
      setError(`Erreur lors du scan: ${err.message || 'Erreur inconnue'}`);
      setIsScanning(false);
      setScanStage('idle');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des modèles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Messages d'erreur/succès */}
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

      {/* Vidéo + Canvas */}
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
        
        {/* Overlay de scan */}
        {isScanning && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <Scan className="w-16 h-16 mx-auto mb-4 animate-pulse" />
              <p className="text-lg font-semibold mb-2">
                {scanStage === 'detecting' && 'Détection du visage...'}
                {scanStage === 'scanning' && `Scan en cours... ${Math.round(scanProgress)}%`}
                {scanStage === 'processing' && 'Traitement des données...'}
                {scanStage === 'complete' && 'Scan terminé!'}
              </p>
              <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bouton de scan */}
      <button
        onClick={startScan}
        disabled={isScanning || checkingExisting || !!error.includes('déjà enregistré')}
        className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors ${
          isScanning || checkingExisting
            ? 'bg-gray-400 cursor-not-allowed'
            : error.includes('déjà enregistré')
            ? 'bg-red-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {checkingExisting ? '🔍 Vérification...' : isScanning ? '⏳ Scan en cours...' : '📸 Enregistrer mon visage'}
      </button>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>💡 Instructions:</strong>
        </p>
        <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1 list-disc list-inside">
          <li>Positionnez votre visage face à la caméra</li>
          <li>Assurez-vous d'avoir un bon éclairage</li>
          <li>Restez immobile pendant le scan (environ 2 secondes)</li>
          <li>Le scan capture 10 images pour plus de précision</li>
          <li><strong>Vous ne pouvez enregistrer votre visage qu'une seule fois</strong></li>
        </ul>
      </div>
    </div>
  );
}
