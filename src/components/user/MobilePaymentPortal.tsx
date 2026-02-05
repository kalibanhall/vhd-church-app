'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ArrowLeft, CheckCircle, XCircle, Phone, CreditCard } from 'lucide-react'
import { authenticatedFetch } from '@/lib/auth-fetch'

type PaymentProvider = 'VODACOM_MPESA' | 'AIRTEL_MONEY' | 'ORANGE_MONEY'

interface PaymentData {
  amount: number
  donationType: string
  provider: PaymentProvider
  phoneNumber: string
  transactionId?: string
}

interface MobilePaymentPortalProps {
  paymentData: PaymentData
  onBack: () => void
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
}

export default function MobilePaymentPortal({ 
  paymentData, 
  onBack, 
  onSuccess, 
  onError 
}: MobilePaymentPortalProps) {
  const [step, setStep] = useState<'select' | 'phone' | 'confirm' | 'processing'>('select')
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const providers = [
    {
      id: 'VODACOM_MPESA' as PaymentProvider,
      name: 'Vodacom M-PESA',
      logo: '📱',
      color: 'bg-red-500',
      textColor: 'text-white',
      prefix: '+243 81/82/83/84',
      description: 'Paiement sécurisé via M-PESA'
    },
    {
      id: 'AIRTEL_MONEY' as PaymentProvider,
      name: 'Airtel Money',
      logo: '💰',
      color: 'bg-red-600',
      textColor: 'text-white', 
      prefix: '+243 97/98/99',
      description: 'Paiement sécurisé via Airtel Money'
    },
    {
      id: 'ORANGE_MONEY' as PaymentProvider,
      name: 'Orange Money',
      logo: '🧡',
      color: 'bg-orange-500',
      textColor: 'text-white',
      prefix: '+243 89/85',
      description: 'Paiement sécurisé via Orange Money'
    }
  ]

  const handleProviderSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider)
    setStep('phone')
  }

  const handlePhoneSubmit = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      onError('Veuillez entrer un numéro de téléphone valide')
      return
    }
    setStep('confirm')
  }

  const handlePaymentConfirm = async () => {
    if (!selectedProvider) return

    setLoading(true)
    setStep('processing')

    try {
      // Simuler l'appel API vers le provider de paiement mobile
      const response = await authenticatedFetch('/api/mobile-payment/initiate', {
        method: 'POST',
        body: JSON.stringify({
          amount: paymentData.amount,
          donationType: paymentData.donationType,
          provider: selectedProvider,
          phoneNumber: phoneNumber
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Simuler le délai de traitement
        setTimeout(() => {
          if (result.success) {
            onSuccess(result.transactionId)
          } else {
            onError(result.message || 'Échec du paiement')
          }
        }, 3000)
      } else {
        throw new Error('Erreur de connexion')
      }
    } catch (error) {
      onError('Erreur lors du traitement du paiement')
      setLoading(false)
    }
  }

  const selectedProviderData = providers.find(p => p.id === selectedProvider)

  const renderSelectProvider = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre opérateur</h2>
        <p className="text-gray-600">Montant à payer : <span className="font-bold text-green-600">${paymentData.amount}</span></p>
      </div>

      <div className="grid gap-4">
        {providers.map((provider) => (
          <Card 
            key={provider.id}
            className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-[#ffc200]"
            onClick={() => handleProviderSelect(provider.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${provider.color}`}>
                  <span className="text-2xl">{provider.logo}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{provider.name}</h3>
                  <p className="text-gray-600">{provider.description}</p>
                  <p className="text-sm text-gray-500 mt-1">Numéros : {provider.prefix}</p>
                </div>
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderPhoneInput = () => (
    <div className="space-y-6">
      <Button 
        onClick={() => setStep('select')}
        variant="outline"
        size="sm"
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <div className="text-center">
        <div className={`inline-flex items-center gap-2 p-3 rounded-full ${selectedProviderData?.color} mb-4`}>
          <span className="text-2xl">{selectedProviderData?.logo}</span>
          <span className={`font-semibold ${selectedProviderData?.textColor}`}>
            {selectedProviderData?.name}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Numéro de téléphone</h2>
        <p className="text-gray-600">Entrez votre numéro {selectedProviderData?.name}</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="tel"
            placeholder="Ex: +243 81 234 5678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="pl-10 h-14 text-lg border-2"
          />
        </div>
        
        <p className="text-sm text-gray-500 text-center">
          Format accepté : {selectedProviderData?.prefix}
        </p>

        <Button 
          onClick={handlePhoneSubmit}
          className="w-full h-14 text-lg font-semibold"
          disabled={!phoneNumber}
        >
          Continuer
        </Button>
      </div>
    </div>
  )

  const renderConfirmation = () => (
    <div className="space-y-6">
      <Button 
        onClick={() => setStep('phone')}
        variant="outline"
        size="sm"
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmer le paiement</h2>
        <p className="text-gray-600">Vérifiez les détails avant de procéder</p>
      </div>

      <Card className="bg-gray-50 border-2">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Opérateur :</span>
            <div className="flex items-center gap-2">
              <span>{selectedProviderData?.logo}</span>
              <span className="font-semibold">{selectedProviderData?.name}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Numéro :</span>
            <span className="font-semibold">{phoneNumber}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Montant :</span>
            <span className="font-bold text-green-600 text-xl">${paymentData.amount}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Type :</span>
            <span className="font-semibold">{paymentData.donationType}</span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-[#fff3cc] border border-[#ffc200] rounded-lg p-4">
        <p className="text-[#cc9b00] text-sm">
          📱 Vous recevrez une notification sur votre téléphone pour confirmer le paiement.
        </p>
      </div>

      <Button 
        onClick={handlePaymentConfirm}
        className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
        disabled={loading}
      >
        {loading ? 'Traitement en cours...' : `Payer $${paymentData.amount}`}
      </Button>
    </div>
  )

  const renderProcessing = () => (
    <div className="text-center space-y-6">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ffc200] mx-auto"></div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Traitement en cours...</h2>
        <p className="text-gray-600 mb-4">Vérifiez votre téléphone pour confirmer le paiement</p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            📱 Une demande de paiement de <strong>${paymentData.amount}</strong> a été envoyée à votre numéro {phoneNumber}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="animate-pulse bg-gray-200 h-2 rounded"></div>
        <p className="text-sm text-gray-500">En attente de confirmation...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-gray-50 py-6">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Paiement Mobile Money</h1>
          <Button 
            onClick={onBack}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {step === 'select' && renderSelectProvider()}
        {step === 'phone' && renderPhoneInput()}
        {step === 'confirm' && renderConfirmation()}
        {step === 'processing' && renderProcessing()}
      </div>
    </div>
  )
}