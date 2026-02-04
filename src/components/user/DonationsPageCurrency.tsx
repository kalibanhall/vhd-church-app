'use client'

import React, { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface Donation {
  id: string
  amount: number
  currency: string
  donationType: string
  paymentMethod: string
  projectName?: string
  notes?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

interface Message {
  type: 'success' | 'error'
  text: string
}

const DonationsPage: React.FC = () => {
  // États du formulaire
  const [selectedAmount, setSelectedAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'CDF'>('USD')
  const [donationType, setDonationType] = useState('FREEWILL')
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [projectName, setProjectName] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  // États des données
  const [donations, setDonations] = useState<Donation[]>([])

  // Montants prédéfinis par devise
  const predefinedAmounts = {
    USD: [5, 10, 20, 50, 100],
    CDF: [5000, 10000, 20000, 50000, 100000]
  }

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      const response = await authenticatedFetch('/api/donations-proxy')

      if (response.ok) {
        const data = await response.json()
        setDonations(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des donations:', error)
    }
  }

  // Fonctions helper pour les labels
  const getDonationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'OFFERING': 'Offrande',
      'TITHE': 'Dîme',
      'FREEWILL': 'Libéralité',
      'PROJECT': 'Projet construction',
      'BUILDING': 'Bâtiment',
      'OTHER': 'Autre'
    }
    return types[type] || type
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      'CARD': 'Carte bancaire',
      'BANK_TRANSFER': 'Virement bancaire',
      'MOBILE_MONEY': 'Mobile Money',
      'CASH': 'Espèces',
      'CHECK': 'Chèque'
    }
    return methods[method] || method
  }

  // Fonction pour rediriger vers Mobile Money si nécessaire
  const redirectToMobilePayment = (amount: string, currency: string) => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams({
        amount: amount.toString(),
        currency: currency,
        purpose: donationType || 'OFFERING'
      });
      window.location.href = `/mobile-payment?${params.toString()}`;
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Non authentifié')
      }

      // Calculer le montant final
      const finalAmount = selectedAmount === 'custom' ? customAmount : selectedAmount

      if (!finalAmount || parseFloat(finalAmount) <= 0) {
        throw new Error('Veuillez sélectionner un montant valide')
      }

      // Si Mobile Money est sélectionné, rediriger vers la page de paiement
      if (paymentMethod === 'MOBILE_MONEY') {
        redirectToMobilePayment(finalAmount, currency)
        return
      }

      const response = await authenticatedFetch('/api/donations-proxy', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(finalAmount),
          currency: currency,
          donationType,
          paymentMethod,
          projectName: donationType === 'PROJECT' ? projectName : undefined,
          notes
        })
      })

      if (response.ok) {
        const newDonation = await response.json()
        setDonations([newDonation, ...donations])
        setMessage({ type: 'success', text: `Don de ${finalAmount} ${currency} enregistré avec succès ! Merci pour votre générosité.` })
        
        // Réinitialiser le formulaire
        setSelectedAmount('')
        setCustomAmount('')
        setDonationType('FREEWILL')
        setPaymentMethod('CARD')
        setProjectName('')
        setNotes('')
      } else {
        throw new Error('Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement du don. Veuillez réessayer.' })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✓ Complété</span>
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">⏳ En attente</span>
      case 'FAILED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">✗ Échoué</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Interface moderne de soutien */}
      <div className="bg-white rounded-lg shadow-church p-6">
        <form onSubmit={handleDonationSubmit} className="space-y-8">
          {/* Type de soutien */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Type de soutien</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  donationType === 'OFFERING' ? 'border-[#ffc200] bg-[#fff3cc]' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setDonationType('OFFERING')}
              >
                <h4 className="font-medium">Offrande</h4>
                <p className="text-sm text-gray-500">Don libre pour soutenir l'œuvre</p>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  donationType === 'TITHE' ? 'border-[#ffc200] bg-[#fff3cc]' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setDonationType('TITHE')}
              >
                <h4 className="font-medium">Dîme</h4>
                <p className="text-sm text-gray-500">Consécration du dixième</p>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  donationType === 'FREEWILL' ? 'border-[#ffc200] bg-[#fff3cc]' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setDonationType('FREEWILL')}
              >
                <h4 className="font-medium">Libéralité</h4>
                <p className="text-sm text-gray-500">Don spécial selon le cœur</p>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  donationType === 'PROJECT' ? 'border-[#ffc200] bg-[#fff3cc]' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setDonationType('PROJECT')}
              >
                <h4 className="font-medium">Projet construction</h4>
                <p className="text-sm text-gray-500">Contribution aux projets d'infrastructure</p>
              </div>
            </div>
          </div>

          {/* Montant avec devises */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Montant</h3>
            
            {/* Sélecteur de devise */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currency === 'USD' 
                    ? 'bg-[#ffc200] text-[#0a0a0a]' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => {
                  setCurrency('USD')
                  setSelectedAmount('')
                  setCustomAmount('')
                }}
              >
                USD ($)
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currency === 'CDF' 
                    ? 'bg-[#ffc200] text-[#0a0a0a]' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => {
                  setCurrency('CDF')
                  setSelectedAmount('')
                  setCustomAmount('')
                }}
              >
                CDF (FC)
              </button>
            </div>

            {/* Boutons de montant prédéfinis */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              {predefinedAmounts[currency].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`p-3 border-2 rounded-lg font-medium transition-all ${
                    selectedAmount === amount.toString() 
                      ? 'border-[#ffc200] bg-[#fff3cc] text-[#cc9b00]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedAmount(amount.toString())
                    setCustomAmount('')
                  }}
                >
                  {currency === 'USD' ? `$${amount}` : `${amount} FC`}
                </button>
              ))}
              <button
                type="button"
                className={`p-3 border-2 rounded-lg font-medium transition-all ${
                  selectedAmount === 'custom' 
                    ? 'border-[#ffc200] bg-[#fff3cc] text-[#cc9b00]' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAmount('custom')}
              >
                Autre
              </button>
            </div>
            
            {selectedAmount === 'custom' && (
              <input
                type="number"
                placeholder={`Montant personnalisé en ${currency}`}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
              />
            )}
          </div>

          {/* Mode de paiement */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mode de paiement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'CARD' ? 'border-[#ffc200] bg-[#fff3cc]' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('CARD')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Carte bancaire</h4>
                    <p className="text-sm text-gray-500">Visa, Mastercard</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'MOBILE_MONEY' ? 'border-[#ffc200] bg-[#fff3cc]' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('MOBILE_MONEY')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Mobile Money</h4>
                    <p className="text-sm text-gray-500">Orange Money, Airtel Money</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Résumé</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Type :</span>
                <span>{getDonationTypeLabel(donationType)}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant :</span>
                <span>{currency === 'USD' ? '$' : ''}{selectedAmount === 'custom' ? customAmount || '0' : selectedAmount || '0'}{currency === 'CDF' ? ' FC' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span>Méthode :</span>
                <span>{getPaymentMethodLabel(paymentMethod)}</span>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading || (!selectedAmount && !customAmount)}
            className="w-full bg-gray-300 text-gray-600 py-4 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Envoyer le don
              </>
            )}
          </button>

          <div className="text-right">
            <p className="text-xs text-gray-400">Made in Bolt</p>
          </div>
        </form>
      </div>

      {/* Historique des donations */}
      {donations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-church">
          <h2 className="text-xl font-semibold text-[#0a0a0a] mb-4">Historique des donations</h2>
          <div className="space-y-4">
            {donations.slice(0, 5).map((donation) => (
              <div key={donation.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-[#0a0a0a]">
                      {donation.currency === 'USD' ? '$' : ''}{donation.amount}{donation.currency === 'CDF' ? ' FC' : ''} - {getDonationTypeLabel(donation.donationType)}
                    </h3>
                    <p className="text-sm text-gray-500">{getPaymentMethodLabel(donation.paymentMethod)}</p>
                    {donation.notes && (
                      <p className="text-sm text-gray-600 mt-1">{donation.notes}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{formatDate(donation.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(donation.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {donations.length > 5 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              ... et {donations.length - 5} autre{donations.length - 5 > 1 ? 's' : ''} donation{donations.length - 5 > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default DonationsPage
