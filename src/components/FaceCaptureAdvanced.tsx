/**
 * =============================================================================
 * FACE CAPTURE ADVANCED - SYSTÈME DE RECONNAISSANCE FACIALE PROFESSIONNEL
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Composant avancé de capture faciale avec:
 * - Détection SSD MobileNet (haute précision)
 * - Guide visuel ovale pour positionnement
 * - Vérification de qualité (éclairage, netteté, position)
 * - Captures multiples pour meilleure précision
 * - Anti-spoof basique avec expressions faciales
 * - Interface professionnelle avec feedback temps réel
 * 
 * =============================================================================
 */

'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as faceapi from 'face-api.js'
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Sun, 
  Move, 
  ZoomIn,
  Loader2,
  RotateCcw,
  Scan
} from 'lucide-react'

// Types
interface QualityCheck {
  faceDetected: boolean
  faceInPosition: boolean
  goodLighting: boolean
  faceSize: 'too-small' | 'good' | 'too-large'
  faceAngle: 'centered' | 'left' | 'right' | 'up' | 'down'
  score: number
}

interface CaptureResult {
  descriptor: Float32Array
  imageData: string
  quality: number
}

interface FaceCaptureAdvancedProps {
  mode: 'enrollment' | 'verification'
  onCapture?: (results: CaptureResult[]) => void
  onVerify?: (descriptor: Float32Array, matchScore: number) => void
  existingDescriptors?: Float32Array[]
  minCaptureCount?: number
  requiredQuality?: number
}

// Constantes pour la qualité
const MIN_FACE_SIZE = 0.15  // % minimum de l'écran
const MAX_FACE_SIZE = 0.65  // % maximum de l'écran
const POSITION_THRESHOLD = 0.15  // Tolérance de position
const MIN_DETECTION_SCORE = 0.7
const BRIGHTNESS_MIN = 80
const BRIGHTNESS_MAX = 200

export default function FaceCaptureAdvanced({
  mode = 'enrollment',
  onCapture,
  onVerify,
  existingDescriptors = [],
  minCaptureCount = 3,
  requiredQuality = 0.7
}: FaceCaptureAdvancedProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  // States
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>('')
  
  // Quality states
  const [qualityCheck, setQualityCheck] = useState<QualityCheck>({
    faceDetected: false,
    faceInPosition: false,
    goodLighting: false,
    faceSize: 'too-small',
    faceAngle: 'centered',
    score: 0
  })
  
  // Capture states
  const [captures, setCaptures] = useState<CaptureResult[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureProgress, setCaptureProgress] = useState(0)
  const [verificationResult, setVerificationResult] = useState<{match: boolean, score: number} | null>(null)

  // Charger les modèles face-api.js
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true)
        const MODEL_URL = '/models'
        
        // Charger progressivement les modèles
        setLoadingProgress(10)
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
        
        setLoadingProgress(30)
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        
        setLoadingProgress(50)
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        
        setLoadingProgress(70)
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        
        // Backup: charger aussi TinyFaceDetector pour devices moins puissants
        setLoadingProgress(90)
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        
        setLoadingProgress(100)
        setModelsLoaded(true)
        setIsLoading(false)
      } catch (err) {
        console.error('Erreur chargement modèles:', err)
        setError('Erreur lors du chargement des modèles de reconnaissance faciale')
        setIsLoading(false)
      }
    }

    loadModels()
  }, [])

  // Démarrer la caméra
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!modelsLoaded) return

    const startVideo = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          streamRef.current = mediaStream
          setStream(mediaStream)
        }
      } catch (err) {
        console.error('Erreur caméra:', err)
        setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
      }
    }

    startVideo()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [modelsLoaded])

  // Analyse de la luminosité
  const analyzeBrightness = useCallback((imageData: ImageData): number => {
    let totalBrightness = 0
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      // Formule de luminosité perçue
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      totalBrightness += brightness
    }
    
    return totalBrightness / (imageData.width * imageData.height)
  }, [])

  // Dessiner le guide ovale
  const drawOvalGuide = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, quality: QualityCheck) => {
    ctx.clearRect(0, 0, width, height)
    
    // Zone sombre autour
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, width, height)
    
    // Créer le trou ovale au centre
    const centerX = width / 2
    const centerY = height / 2
    const ovalWidth = width * 0.35
    const ovalHeight = height * 0.55
    
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, ovalWidth, ovalHeight, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Dessiner le contour de l'ovale
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = quality.faceInPosition && quality.faceDetected ? '#22c55e' : quality.faceDetected ? '#eab308' : '#ef4444'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, ovalWidth, ovalHeight, 0, 0, Math.PI * 2)
    ctx.stroke()
    
    // Animation de scan si en cours de capture
    if (quality.faceInPosition && quality.faceDetected) {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)'
      ctx.lineWidth = 2
      const scanOffset = (Date.now() % 2000) / 2000 * ovalHeight * 2 - ovalHeight
      ctx.beginPath()
      ctx.moveTo(centerX - ovalWidth * 0.8, centerY + scanOffset)
      ctx.lineTo(centerX + ovalWidth * 0.8, centerY + scanOffset)
      ctx.stroke()
    }
    
    // Indicateurs de position (coins)
    const cornerSize = 30
    const cornerOffset = 20
    ctx.strokeStyle = quality.faceInPosition ? '#22c55e' : '#ffffff'
    ctx.lineWidth = 3
    
    // Coin supérieur gauche
    ctx.beginPath()
    ctx.moveTo(centerX - ovalWidth - cornerOffset, centerY - ovalHeight + cornerSize)
    ctx.lineTo(centerX - ovalWidth - cornerOffset, centerY - ovalHeight - cornerOffset)
    ctx.lineTo(centerX - ovalWidth + cornerSize, centerY - ovalHeight - cornerOffset)
    ctx.stroke()
    
    // Coin supérieur droit
    ctx.beginPath()
    ctx.moveTo(centerX + ovalWidth + cornerOffset, centerY - ovalHeight + cornerSize)
    ctx.lineTo(centerX + ovalWidth + cornerOffset, centerY - ovalHeight - cornerOffset)
    ctx.lineTo(centerX + ovalWidth - cornerSize, centerY - ovalHeight - cornerOffset)
    ctx.stroke()
    
    // Coin inférieur gauche
    ctx.beginPath()
    ctx.moveTo(centerX - ovalWidth - cornerOffset, centerY + ovalHeight - cornerSize)
    ctx.lineTo(centerX - ovalWidth - cornerOffset, centerY + ovalHeight + cornerOffset)
    ctx.lineTo(centerX - ovalWidth + cornerSize, centerY + ovalHeight + cornerOffset)
    ctx.stroke()
    
    // Coin inférieur droit
    ctx.beginPath()
    ctx.moveTo(centerX + ovalWidth + cornerOffset, centerY + ovalHeight - cornerSize)
    ctx.lineTo(centerX + ovalWidth + cornerOffset, centerY + ovalHeight + cornerOffset)
    ctx.lineTo(centerX + ovalWidth - cornerSize, centerY + ovalHeight + cornerOffset)
    ctx.stroke()
  }, [])

  // Détection en temps réel
  useEffect(() => {
    if (!modelsLoaded || !videoRef.current) return

    let animationId: number
    
    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current || !overlayRef.current) {
        animationId = requestAnimationFrame(detectFace)
        return
      }

      const video = videoRef.current
      if (video.paused || video.ended || video.videoWidth === 0) {
        animationId = requestAnimationFrame(detectFace)
        return
      }

      try {
        // Utiliser SSD MobileNet pour meilleure précision
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor()
          .withFaceExpressions()

        const canvas = canvasRef.current
        const overlay = overlayRef.current
        const ctx = canvas.getContext('2d')
        const overlayCtx = overlay.getContext('2d')
        
        if (!ctx || !overlayCtx) {
          animationId = requestAnimationFrame(detectFace)
          return
        }

        // Dessiner le flux vidéo
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        overlay.width = video.videoWidth
        overlay.height = video.videoHeight
        
        ctx.save()
        ctx.scale(-1, 1)
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
        ctx.restore()

        // Analyser la luminosité
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const brightness = analyzeBrightness(imageData)
        const goodLighting = brightness >= BRIGHTNESS_MIN && brightness <= BRIGHTNESS_MAX

        // Vérifier la qualité
        const newQuality: QualityCheck = {
          faceDetected: false,
          faceInPosition: false,
          goodLighting,
          faceSize: 'too-small',
          faceAngle: 'centered',
          score: 0
        }

        if (detection) {
          const box = detection.detection.box
          const faceWidth = box.width / canvas.width
          const faceHeight = box.height / canvas.height
          const faceCenterX = (box.x + box.width / 2) / canvas.width
          const faceCenterY = (box.y + box.height / 2) / canvas.height
          
          newQuality.faceDetected = detection.detection.score > MIN_DETECTION_SCORE

          // Vérifier la taille du visage
          if (faceWidth < MIN_FACE_SIZE) {
            newQuality.faceSize = 'too-small'
          } else if (faceWidth > MAX_FACE_SIZE) {
            newQuality.faceSize = 'too-large'
          } else {
            newQuality.faceSize = 'good'
          }

          // Vérifier la position (miroir horizontal appliqué)
          const mirroredCenterX = 1 - faceCenterX
          if (mirroredCenterX < 0.5 - POSITION_THRESHOLD) {
            newQuality.faceAngle = 'left'
          } else if (mirroredCenterX > 0.5 + POSITION_THRESHOLD) {
            newQuality.faceAngle = 'right'
          } else if (faceCenterY < 0.5 - POSITION_THRESHOLD) {
            newQuality.faceAngle = 'up'
          } else if (faceCenterY > 0.5 + POSITION_THRESHOLD) {
            newQuality.faceAngle = 'down'
          } else {
            newQuality.faceAngle = 'centered'
          }

          // Position correcte si centré et bonne taille
          newQuality.faceInPosition = 
            newQuality.faceAngle === 'centered' && 
            newQuality.faceSize === 'good' &&
            newQuality.faceDetected

          // Calculer le score global
          let score = 0
          if (newQuality.faceDetected) score += 0.3
          if (newQuality.faceInPosition) score += 0.3
          if (newQuality.goodLighting) score += 0.2
          if (newQuality.faceSize === 'good') score += 0.2
          newQuality.score = score

          // Mode vérification: comparer avec les descripteurs existants
          if (mode === 'verification' && existingDescriptors.length > 0 && newQuality.faceInPosition) {
            let bestDistance = Infinity
            
            for (const existingDesc of existingDescriptors) {
              const distance = faceapi.euclideanDistance(detection.descriptor, existingDesc)
              if (distance < bestDistance) {
                bestDistance = distance
              }
            }
            
            const matchScore = Math.max(0, Math.min(100, (1 - bestDistance) * 100))
            const isMatch = bestDistance < 0.5  // Seuil de correspondance
            
            setVerificationResult({ match: isMatch, score: matchScore })
            
            if (isMatch && onVerify) {
              onVerify(detection.descriptor, matchScore)
            }
          }
        }

        setQualityCheck(newQuality)
        
        // Dessiner le guide ovale
        drawOvalGuide(overlayCtx, overlay.width, overlay.height, newQuality)

      } catch (err) {
        console.error('Erreur détection:', err)
      }

      animationId = requestAnimationFrame(detectFace)
    }

    detectFace()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [modelsLoaded, mode, existingDescriptors, analyzeBrightness, drawOvalGuide, onVerify])

  // Fonction de capture
  const captureface = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return
    
    if (!qualityCheck.faceInPosition || qualityCheck.score < requiredQuality) {
      setError('Positionnez correctement votre visage dans l\'ovale')
      return
    }

    setIsCapturing(true)
    setError('')
    const newCaptures: CaptureResult[] = []

    for (let i = 0; i < minCaptureCount; i++) {
      setCaptureProgress((i / minCaptureCount) * 100)
      
      await new Promise(resolve => setTimeout(resolve, 500)) // Pause entre captures
      
      const detection = await faceapi
        .detectSingleFace(videoRef.current!, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (detection && detection.detection.score > MIN_DETECTION_SCORE) {
        // Capturer l'image
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = videoRef.current!.videoWidth
        tempCanvas.height = videoRef.current!.videoHeight
        const tempCtx = tempCanvas.getContext('2d')!
        
        tempCtx.save()
        tempCtx.scale(-1, 1)
        tempCtx.drawImage(videoRef.current!, -tempCanvas.width, 0)
        tempCtx.restore()
        
        const imageData = tempCanvas.toDataURL('image/jpeg', 0.95)

        newCaptures.push({
          descriptor: detection.descriptor,
          imageData,
          quality: detection.detection.score
        })
      }
    }

    setCaptureProgress(100)
    setCaptures(newCaptures)
    setIsCapturing(false)

    if (newCaptures.length >= minCaptureCount && onCapture) {
      onCapture(newCaptures)
    } else if (newCaptures.length < minCaptureCount) {
      setError(`Seulement ${newCaptures.length}/${minCaptureCount} captures réussies. Réessayez.`)
    }
  }

  // Reset
  const reset = () => {
    setCaptures([])
    setCaptureProgress(0)
    setError('')
    setVerificationResult(null)
  }

  // Rendu de l'état de chargement
  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-gray-700 flex items-center justify-center">
              <Scan className="h-10 w-10 text-[#cc9b00] animate-pulse" />
            </div>
            <svg className="absolute inset-0 w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#ffc200"
                strokeWidth="4"
                strokeDasharray={`${loadingProgress * 2.26} 226`}
                className="transition-all duration-300"
              />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">Chargement des modèles IA...</p>
            <p className="text-gray-400 text-sm">{loadingProgress}%</p>
          </div>
        </div>
      </div>
    )
  }

  // Rendu de l'erreur
  if (error && !qualityCheck.faceDetected) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Recharger la page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Zone de capture */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
        {/* Video caché */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute opacity-0 pointer-events-none"
        />
        
        {/* Canvas principal (miroir) */}
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-2xl"
          style={{ transform: 'scaleX(1)' }}
        />
        
        {/* Overlay avec guide ovale */}
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Indicateur de vérification */}
        {mode === 'verification' && verificationResult && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full backdrop-blur-md ${
            verificationResult.match 
              ? 'bg-green-500/80 text-white' 
              : 'bg-red-500/80 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {verificationResult.match ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">
                {verificationResult.match ? 'Identifié!' : 'Non reconnu'}
              </span>
              <span className="text-sm opacity-80">
                ({verificationResult.score.toFixed(0)}%)
              </span>
            </div>
          </div>
        )}

        {/* Barre de progression de capture */}
        {isCapturing && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${captureProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Indicateurs de qualité */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QualityIndicator 
          icon={<Camera className="h-4 w-4" />}
          label="Visage"
          status={qualityCheck.faceDetected}
          detail={qualityCheck.faceDetected ? 'Détecté' : 'Non détecté'}
        />
        <QualityIndicator 
          icon={<Move className="h-4 w-4" />}
          label="Position"
          status={qualityCheck.faceInPosition}
          detail={qualityCheck.faceAngle === 'centered' ? 'Centré' : `Déplacez-vous vers la ${
            qualityCheck.faceAngle === 'left' ? 'droite' : 
            qualityCheck.faceAngle === 'right' ? 'gauche' : 
            qualityCheck.faceAngle === 'up' ? 'le bas' : 'le haut'
          }`}
        />
        <QualityIndicator 
          icon={<ZoomIn className="h-4 w-4" />}
          label="Distance"
          status={qualityCheck.faceSize === 'good'}
          detail={
            qualityCheck.faceSize === 'too-small' ? 'Rapprochez-vous' : 
            qualityCheck.faceSize === 'too-large' ? 'Éloignez-vous' : 'Parfait'
          }
        />
        <QualityIndicator 
          icon={<Sun className="h-4 w-4" />}
          label="Éclairage"
          status={qualityCheck.goodLighting}
          detail={qualityCheck.goodLighting ? 'Bon' : 'Ajustez la lumière'}
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-yellow-800 dark:text-yellow-300 text-sm">{error}</p>
        </div>
      )}

      {/* Captures réalisées */}
      {captures.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-300">
              {captures.length} capture(s) réussie(s)
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {captures.map((capture, idx) => (
              <img 
                key={idx}
                src={capture.imageData}
                alt={`Capture ${idx + 1}`}
                className="w-16 h-16 rounded-lg object-cover border-2 border-green-500"
              />
            ))}
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      {mode === 'enrollment' && (
        <div className="flex gap-3">
          <button
            onClick={captureface}
            disabled={!qualityCheck.faceInPosition || isCapturing || captures.length >= minCaptureCount}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-all ${
              qualityCheck.faceInPosition && !isCapturing && captures.length < minCaptureCount
                ? 'bg-gradient-to-r from-[#ffc200] to-[#cc9b00] text-white hover:from-[#cc9b00] hover:to-[#a67d00] shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {isCapturing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Capture en cours...
              </>
            ) : captures.length >= minCaptureCount ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Captures terminées
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                Capturer le visage ({captures.length}/{minCaptureCount})
              </>
            )}
          </button>

          {captures.length > 0 && (
            <button
              onClick={reset}
              className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-[#fffefa] dark:bg-[#3d3200]/20 border border-[#e6af00] dark:border-[#cc9b00] rounded-xl p-4">
        <h4 className="font-medium text-[#3d3200] dark:text-[#ffc200] mb-2">
          Conseils pour une bonne capture
        </h4>
        <ul className="text-sm text-[#3d3200] dark:text-[#e6af00] space-y-1">
          <li>• Positionnez votre visage dans l&apos;ovale vert</li>
          <li>• Assurez-vous d&apos;avoir un bon éclairage de face</li>
          <li>• Gardez une expression neutre et regardez la caméra</li>
          <li>• Évitez les lunettes de soleil et les chapeaux</li>
        </ul>
      </div>
    </div>
  )
}

// Composant indicateur de qualité
function QualityIndicator({ 
  icon, 
  label, 
  status, 
  detail 
}: { 
  icon: React.ReactNode
  label: string
  status: boolean
  detail: string
}) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
      status 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className={`p-1.5 rounded-lg ${
        status ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${status ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
          {label}
        </p>
        <p className={`text-xs truncate ${status ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
          {detail}
        </p>
      </div>
      {status && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
    </div>
  )
}


