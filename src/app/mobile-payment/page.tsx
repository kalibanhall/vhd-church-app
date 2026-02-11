'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ArrowLeft, Phone, Smartphone, Wallet, CreditCard } from 'lucide-react'

function MobilePaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'select' | 'phone' | 'confirm' | 'processing'>('select')
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)

  // Données de donation récupérées depuis les paramètres URL
  const amount = searchParams?.get('amount') || '0'
  const donationType = searchParams?.get('donationType') || ''
  const projectName = searchParams?.get('projectName') || ''
  const notes = searchParams?.get('notes') || ''

  const providers = [
    {
      id: 'VODACOM_MPESA',
      name: 'Vodacom M-PESA',
      icon: Smartphone,
      color: 'bg-red-500',
      prefix: '+243 81/82/83/84',
      description: 'Paiement sécurisé via M-PESA'
    },
    {
      id: 'AIRTEL_MONEY',
      name: 'Airtel Money',
      icon: Wallet,
      color: 'bg-red-600',
      prefix: '+243 97/98/99',
      description: 'Paiement sécurisé via Airtel Money'
    },
    {
      id: 'ORANGE_MONEY',
      name: 'Orange Money',
      icon: CreditCard,
      color: 'bg-orange-500',
      prefix: '+243 89/85',
      description: 'Paiement sécurisé via Orange Money'
    }
  ]

  const handlePaymentSubmit = async () => {
    setLoading(true)
    setStep('processing')

    try {
      const response = await fetch('/api/mobile-payment/initiate', {
        method: 'POST',
        headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({
          amount: parseFloat(amount),
          donationType: donationType,
          provider: selectedProvider,
          phoneNumber: phoneNumber,
          projectName: projectName,
          notes: notes
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        setTimeout(() => {
          if (result.success) {
            // Succès - rediriger avec message de succès
            router.push(`/?success=true&transaction=${result.transactionId}&amount=${amount}`)
          } else {
            // Échec - rediriger avec message d'erreur
            router.push(`/?error=true&message=${encodeURIComponent(result.message || 'Échec du paiement')}`)
          }
        }, 3000)
      } else {
        throw new Error('Erreur de connexion')
      }
    } catch (error) {
      router.push('/?error=true&message=' + encodeURIComponent('Erreur lors du traitement du paiement'))
    }
  }

  const selectedProviderData = providers.find(p => p.id === selectedProvider)

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-gray-50 py-6">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><CreditCard className="h-7 w-7" /> Paiement Mobile Money</h1>
          <Button 
            onClick={() => router.back()}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {step === 'select' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre opérateur</h2>
              <p className="text-gray-600">
                Montant à payer : <span className="font-bold text-green-600">${amount}</span>
                {projectName && <><br/>Projet : <span className="font-medium">{projectName}</span></>}
              </p>
            </div>

            <div className="grid gap-4">
              {providers.map((provider) => (
                <Card 
                  key={provider.id}
                  className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-blue-300"
                  onClick={() => {
                    setSelectedProvider(provider.id)
                    setStep('phone')
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${provider.color}`}>
                        <provider.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{provider.name}</h3>
                        <p className="text-gray-600">{provider.description}</p>
                        <p className="text-sm text-gray-500 mt-1">Numéros : {provider.prefix}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'phone' && (
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
                {selectedProviderData && <selectedProviderData.icon className="h-6 w-6 text-white" />}
                <span className="font-semibold text-white">{selectedProviderData?.name}</span>
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
                onClick={() => setStep('confirm')}
                className="w-full h-14 text-lg font-semibold"
                disabled={!phoneNumber}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
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
                    {selectedProviderData && <selectedProviderData.icon className="h-4 w-4" />}
                    <span className="font-semibold">{selectedProviderData?.name}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Numéro :</span>
                  <span className="font-semibold">{phoneNumber}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Montant :</span>
                  <span className="font-bold text-green-600 text-xl">${amount}</span>
                </div>

                {projectName && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Projet :</span>
                    <span className="font-semibold">{projectName}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm flex items-start gap-2">
                <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" /> Vous recevrez une notification sur votre téléphone pour confirmer le paiement.
              </p>
            </div>

            <Button 
              onClick={handlePaymentSubmit}
              className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Traitement en cours...' : `Payer $${amount}`}
            </Button>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center space-y-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Traitement en cours...</h2>
              <p className="text-gray-600 mb-4">Vérifiez votre téléphone pour confirmer le paiement</p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm flex items-start gap-2">
                  <Smartphone className="h-4 w-4 mt-0.5 flex-shrink-0" /> Une demande de paiement de <strong>${amount}</strong> a été envoyée à votre numéro {phoneNumber}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="animate-pulse bg-gray-200 h-2 rounded"></div>
              <p className="text-sm text-gray-500">En attente de confirmation...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MobilePaymentPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <MobilePaymentContent />
    </Suspense>
  )
}