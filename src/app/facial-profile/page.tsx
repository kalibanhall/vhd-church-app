/**
 * =============================================================================
 * PAGE DE GESTION FACIALE PERSONNELLE
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Page permettant aux membres d'enregistrer, modifier ou supprimer
 * leur visage pour la reconnaissance faciale lors des cultes.
 * 
 * =============================================================================
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  Camera, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  RefreshCw,
  Shield,
  Info,
  Loader2,
  Sun,
  Move,
  ZoomIn,
  User
} from 'lucide-react'
import * as faceapi from 'face-api.js'

// Types
interface QualityCheck {
  faceDetected: boolean
  faceInPosition: boolean
  goodLighting: boolean
  faceSize: 'too-small' | 'good' | 'too-large'
  score: number
}

interface FacialData {
  hasDescriptor: boolean
  photoUrl?: string
  lastUpdated?: string
}

export default function FacialProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  
  // States
  const [step, setStep] = useState<'info' | 'capture' | 'processing' | 'success'>('info')
  const [isLoading, setIsLoading] = useState(true)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [facialData, setFacialData] = useState<FacialData>({ hasDescriptor: false })
  
  // Quality check
  const [qualityCheck, setQualityCheck] = useState<QualityCheck>({
    faceDetected: false,
    faceInPosition: false,
    goodLighting: false,
    faceSize: 'too-small',
    score: 0
  })
  
  // Captures
  const [captures, setCaptures] = useState<{ descriptor: Float32Array; imageData: string; quality: number }[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureCount, setCaptureCount] = useState(0)

  // Vérifier l'authentification
  useEffect(() => {
    if (!user) {
      router.push('/auth')
    }
  }, [user, router])

  // Charger les données faciales existantes
  useEffect(() => {
    const loadFacialData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/profile/facial', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setFacialData({
            hasDescriptor: data.hasFaceDescriptor,
            photoUrl: data.photoUrl,
            lastUpdated: data.lastUpdated
          })
        }
      } catch (err) {
        console.error('Erreur chargement données faciales:', err)
      }
    }
    
    if (user) {
      loadFacialData()
    }
  }, [user])

  // Charger les modèles face-api.js
  const loadModels = useCallback(async () => {
    try {
      setIsLoading(true)
      const MODEL_URL = '/models'
      
      setLoadingProgress(20)
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
      
      setLoadingProgress(50)
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      
      setLoadingProgress(80)
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      
      setLoadingProgress(100)
      setModelsLoaded(true)
      setIsLoading(false)
    } catch (err) {
      console.error('Erreur chargement modèles:', err)
      setError('Erreur lors du chargement des modèles IA')
      setIsLoading(false)
    }
  }, [])

  // Démarrer la caméra
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    } catch (err) {
      console.error('Erreur caméra:', err)
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
    }
  }, [])

  // Arrêter la caméra
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  // Quand on passe à l'étape capture
  useEffect(() => {
    if (step === 'capture') {
      loadModels()
    } else {
      stopCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [step, loadModels, stopCamera])

  // Démarrer la caméra après chargement des modèles
  useEffect(() => {
    if (modelsLoaded && step === 'capture') {
      startCamera()
    }
  }, [modelsLoaded, step, startCamera])

  // Analyse de la luminosité
  const analyzeBrightness = useCallback((imageData: ImageData): number => {
    let totalBrightness = 0
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      totalBrightness += brightness
    }
    
    return totalBrightness / (imageData.width * imageData.height)
  }, [])

  // Dessiner le guide ovale
  const drawOvalGuide = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, quality: QualityCheck) => {
    ctx.clearRect(0, 0, width, height)
    
    // Zone sombre autour
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, width, height)
    
    // Trou ovale au centre
    const centerX = width / 2
    const centerY = height / 2
    const ovalWidth = width * 0.32
    const ovalHeight = height * 0.52
    
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, ovalWidth, ovalHeight, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Contour de l'ovale
    ctx.globalCompositeOperation = 'source-over'
    const isGood = quality.faceInPosition && quality.faceDetected && quality.goodLighting
    ctx.strokeStyle = isGood ? '#22c55e' : quality.faceDetected ? '#eab308' : '#ef4444'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, ovalWidth, ovalHeight, 0, 0, Math.PI * 2)
    ctx.stroke()
    
    // Animation de scan
    if (isGood) {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)'
      ctx.lineWidth = 2
      const scanY = centerY + (Math.sin(Date.now() / 300) * ovalHeight * 0.8)
      ctx.beginPath()
      ctx.moveTo(centerX - ovalWidth * 0.9, scanY)
      ctx.lineTo(centerX + ovalWidth * 0.9, scanY)
      ctx.stroke()
    }
  }, [])

  // Détection en temps réel
  useEffect(() => {
    if (!modelsLoaded || !videoRef.current || step !== 'capture') return

    let animationId: number
    let isRunning = true
    
    const detectFace = async () => {
      if (!isRunning || !videoRef.current || !canvasRef.current || !overlayRef.current) {
        return
      }

      const video = videoRef.current
      if (video.paused || video.ended || video.videoWidth === 0) {
        animationId = requestAnimationFrame(detectFace)
        return
      }

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor()

        const canvas = canvasRef.current
        const overlay = overlayRef.current
        const ctx = canvas.getContext('2d')
        const overlayCtx = overlay.getContext('2d')
        
        if (!ctx || !overlayCtx) {
          animationId = requestAnimationFrame(detectFace)
          return
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        overlay.width = video.videoWidth
        overlay.height = video.videoHeight
        
        // Dessiner vidéo miroir
        ctx.save()
        ctx.scale(-1, 1)
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
        ctx.restore()

        // Analyser luminosité
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const brightness = analyzeBrightness(imageData)
        const goodLighting = brightness >= 70 && brightness <= 210

        const newQuality: QualityCheck = {
          faceDetected: false,
          faceInPosition: false,
          goodLighting,
          faceSize: 'too-small',
          score: 0
        }

        if (detection) {
          const box = detection.detection.box
          const faceWidth = box.width / canvas.width
          const faceCenterX = 1 - (box.x + box.width / 2) / canvas.width
          const faceCenterY = (box.y + box.height / 2) / canvas.height
          
          newQuality.faceDetected = detection.detection.score > 0.7

          if (faceWidth < 0.15) {
            newQuality.faceSize = 'too-small'
          } else if (faceWidth > 0.55) {
            newQuality.faceSize = 'too-large'
          } else {
            newQuality.faceSize = 'good'
          }

          const inPosition = 
            faceCenterX > 0.35 && faceCenterX < 0.65 &&
            faceCenterY > 0.3 && faceCenterY < 0.7 &&
            newQuality.faceSize === 'good'

          newQuality.faceInPosition = inPosition && newQuality.faceDetected
          
          let score = 0
          if (newQuality.faceDetected) score += 0.3
          if (newQuality.faceInPosition) score += 0.3
          if (newQuality.goodLighting) score += 0.2
          if (newQuality.faceSize === 'good') score += 0.2
          newQuality.score = score
        }

        setQualityCheck(newQuality)
        drawOvalGuide(overlayCtx, overlay.width, overlay.height, newQuality)

      } catch (err) {
        console.error('Erreur détection:', err)
      }

      if (isRunning) {
        animationId = requestAnimationFrame(detectFace)
      }
    }

    detectFace()

    return () => {
      isRunning = false
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [modelsLoaded, step, analyzeBrightness, drawOvalGuide])

  // Capturer le visage
  const captureface = async () => {
    if (!videoRef.current || !qualityCheck.faceInPosition || isCapturing) return

    setIsCapturing(true)
    setError('')
    const newCaptures: typeof captures = []
    const totalCaptures = 5

    for (let i = 0; i < totalCaptures; i++) {
      setCaptureCount(i + 1)
      
      await new Promise(resolve => setTimeout(resolve, 400))
      
      if (!videoRef.current) break

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (detection && detection.detection.score > 0.7) {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = videoRef.current.videoWidth
        tempCanvas.height = videoRef.current.videoHeight
        const tempCtx = tempCanvas.getContext('2d')!
        
        tempCtx.save()
        tempCtx.scale(-1, 1)
        tempCtx.drawImage(videoRef.current, -tempCanvas.width, 0)
        tempCtx.restore()
        
        const imageData = tempCanvas.toDataURL('image/jpeg', 0.92)

        newCaptures.push({
          descriptor: detection.descriptor,
          imageData,
          quality: detection.detection.score
        })
      }
    }

    setCaptureCount(0)
    setIsCapturing(false)

    if (newCaptures.length >= 3) {
      setCaptures(newCaptures)
      await saveCaptures(newCaptures)
    } else {
      setError(`Seulement ${newCaptures.length} captures réussies. Réessayez avec un meilleur éclairage.`)
    }
  }

  // Sauvegarder les captures
  const saveCaptures = async (captureList: typeof captures) => {
    setStep('processing')

    try {
      // Calculer le descripteur moyen
      const avgDescriptor = new Float32Array(128)
      for (const capture of captureList) {
        for (let i = 0; i < 128; i++) {
          avgDescriptor[i] += capture.descriptor[i] / captureList.length
        }
      }

      // Meilleure capture pour la photo
      const bestCapture = captureList.reduce((best, current) => 
        current.quality > best.quality ? current : best
      )

      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/facial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          descriptor: Array.from(avgDescriptor),
          imageData: bestCapture.imageData
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFacialData({
          hasDescriptor: true,
          photoUrl: data.photoUrl,
          lastUpdated: new Date().toISOString()
        })
        setStep('success')
      } else {
        throw new Error('Erreur serveur')
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      setError('Erreur lors de l\'enregistrement. Réessayez.')
      setStep('capture')
    }
  }

  // Supprimer les données faciales
  const deleteFacialData = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer vos données faciales ?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/facial', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        setFacialData({ hasDescriptor: false })
        setCaptures([])
      }
    } catch (err) {
      console.error('Erreur suppression:', err)
      setError('Erreur lors de la suppression')
    }
  }

  // Page d'information (étape initiale)
  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/profile')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Reconnaissance Faciale</h1>
              <p className="text-blue-200 text-sm">Gérez vos données biométriques</p>
            </div>
          </div>

          {/* Carte statut actuel */}
          <div className={`rounded-2xl p-6 mb-6 ${
            facialData.hasDescriptor 
              ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30' 
              : 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30'
          }`}>
            <div className="flex items-start gap-4">
              {facialData.hasDescriptor ? (
                <>
                  {facialData.photoUrl ? (
                    <img 
                      src={facialData.photoUrl} 
                      alt="Votre visage"
                      className="w-20 h-20 rounded-full object-cover border-4 border-green-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-green-300 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Visage enregistré
                    </h2>
                    <p className="text-green-200/80 text-sm mt-1">
                      Votre visage est enregistré et sera utilisé pour le pointage automatique lors des cultes.
                    </p>
                    {facialData.lastUpdated && (
                      <p className="text-green-200/60 text-xs mt-2">
                        Mis à jour le {new Date(facialData.lastUpdated).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-yellow-600/50 flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-yellow-300" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-yellow-300 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Non enregistré
                    </h2>
                    <p className="text-yellow-200/80 text-sm mt-1">
                      Enregistrez votre visage pour bénéficier du pointage automatique lors des cultes.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Informations sur le système */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              Comment ça fonctionne ?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Enregistrement</p>
                  <p className="text-gray-400 text-sm">Capturez votre visage via la caméra de votre appareil</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">Stockage sécurisé</p>
                  <p className="text-gray-400 text-sm">Vos données biométriques sont chiffrées et stockées de manière sécurisée</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">Pointage automatique</p>
                  <p className="text-gray-400 text-sm">Lors des cultes, les caméras vous identifient automatiquement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={() => setStep('capture')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
            >
              <Camera className="h-5 w-5" />
              {facialData.hasDescriptor ? 'Mettre à jour mon visage' : 'Enregistrer mon visage'}
            </button>

            {facialData.hasDescriptor && (
              <button
                onClick={deleteFacialData}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-red-600/20 text-red-400 rounded-xl font-semibold hover:bg-red-600/30 transition-colors border border-red-500/30"
              >
                <Trash2 className="h-5 w-5" />
                Supprimer mes données faciales
              </button>
            )}
          </div>

          {/* Note de sécurité */}
          <div className="mt-6 p-4 bg-blue-900/30 rounded-xl border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-sm font-medium">Protection des données</p>
                <p className="text-blue-200/70 text-xs mt-1">
                  Vos données biométriques sont utilisées uniquement pour le pointage de présence et ne sont jamais partagées avec des tiers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Page de capture
  if (step === 'capture') {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => {
                stopCamera()
                setStep('info')
              }}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Capture du visage</h1>
              <p className="text-gray-400 text-sm">Positionnez votre visage dans l&apos;ovale</p>
            </div>
          </div>

          {/* Zone de chargement des modèles */}
          {isLoading && (
            <div className="bg-gray-800 rounded-2xl p-8 text-center mb-4">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
                <svg className="absolute inset-0 w-20 h-20 -rotate-90">
                  <circle
                    cx="40" cy="40" r="36"
                    fill="none" stroke="#3b82f6" strokeWidth="4"
                    strokeDasharray={`${loadingProgress * 2.26} 226`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scan className="h-8 w-8 text-blue-500 animate-pulse" />
                </div>
              </div>
              <p className="text-white font-medium">Chargement de l&apos;IA...</p>
              <p className="text-gray-400 text-sm">{loadingProgress}%</p>
            </div>
          )}

          {/* Zone de capture */}
          {!isLoading && (
            <>
              <div className="relative bg-black rounded-2xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute opacity-0 pointer-events-none"
                />
                
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto rounded-2xl"
                />
                
                <canvas
                  ref={overlayRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />

                {/* Indicateur de capture en cours */}
                {isCapturing && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Capture {captureCount}/5</span>
                  </div>
                )}
              </div>

              {/* Indicateurs de qualité */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <QualityIndicator 
                  icon={<User className="h-4 w-4" />}
                  label="Visage"
                  status={qualityCheck.faceDetected}
                  detail={qualityCheck.faceDetected ? 'Détecté' : 'Non détecté'}
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
                  label="Lumière"
                  status={qualityCheck.goodLighting}
                  detail={qualityCheck.goodLighting ? 'Bonne' : 'Insuffisante'}
                />
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Bouton de capture */}
              <button
                onClick={captureface}
                disabled={!qualityCheck.faceInPosition || isCapturing}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all ${
                  qualityCheck.faceInPosition && !isCapturing
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Capture en cours...
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    {qualityCheck.faceInPosition ? 'Capturer mon visage' : 'Positionnez votre visage'}
                  </>
                )}
              </button>

              {/* Instructions */}
              <div className="mt-4 p-4 bg-gray-800 rounded-xl">
                <p className="text-gray-300 text-sm">
                  <strong>Conseils :</strong> Regardez directement la caméra, dans un endroit bien éclairé, sans lunettes ni chapeau.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Page de traitement
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
            <div className="relative w-full h-full bg-blue-600 rounded-full flex items-center justify-center">
              <Scan className="h-12 w-12 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Traitement en cours...</h2>
          <p className="text-gray-400">Enregistrement de vos données faciales</p>
        </div>
      </div>
    )
  }

  // Page de succès
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-14 w-14 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Enregistrement réussi !</h2>
          <p className="text-gray-400 mb-8">
            Votre visage a été enregistré avec succès. Vous serez automatiquement identifié lors des prochains cultes.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/profile')}
              className="w-full py-4 px-6 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Retour au profil
            </button>
            <button
              onClick={() => {
                setCaptures([])
                setStep('info')
              }}
              className="w-full py-4 px-6 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              Voir mes données faciales
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
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
        ? 'bg-green-900/30 border-green-500/30' 
        : 'bg-gray-800 border-gray-700'
    }`}>
      <div className={`p-1.5 rounded-lg ${
        status ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${status ? 'text-green-300' : 'text-gray-400'}`}>
          {label}
        </p>
        <p className={`text-xs truncate ${status ? 'text-green-400' : 'text-gray-500'}`}>
          {detail}
        </p>
      </div>
    </div>
  )
}
