'use client'

import React, { useState, useEffect } from 'react'
import { 
  Gift, DollarSign, CreditCard, Smartphone, Building, Clock, CheckCircle, 
  X, Heart, TrendingUp, Calendar, Loader2, Wallet, Gift as GiftIcon
} from 'lucide-react'
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
  const [selectedAmount, setSelectedAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'CDF'>('CDF')
  const [donationType, setDonationType] = useState('FREEWILL')
  const [paymentMethod, setPaymentMethod] = useState('MOBILE_MONEY')
  const [projectName, setProjectName] = useState('')
  const [notes, setNotes] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])

  const predefinedAmounts = {
    USD: [5, 10, 20, 50, 100, 200],
    CDF: [5000, 10000, 20000, 50000, 100000, 200000]
  }

  const donationTypes = [
    { id: 'OFFERING', label: 'Offrande', description: 'Don libre pour l\'œuvre', icon: Gift },
    { id: 'TITHE', label: 'Dîme', description: 'Consécration du dixième', icon: TrendingUp },
    { id: 'FREEWILL', label: 'Libéralité', description: 'Don selon votre cœur', icon: Heart },
    { id: 'PROJECT', label: 'Projet', description: 'Construction du temple', icon: Building },
  ]

  const paymentMethods = [
    { id: 'MOBILE_MONEY', label: 'Mobile Money', description: 'M-Pesa, Airtel Money, Orange', icon: Smartphone },
    { id: 'CARD', label: 'Carte bancaire', description: 'Visa, Mastercard', icon: CreditCard },
    { id: 'BANK_TRANSFER', label: 'Virement', description: 'Rawbank, Equity BCDC', icon: Building },
    { id: 'CASH', label: 'Espèces', description: 'Au secrétariat', icon: Wallet },
  ]

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      setInitialLoading(true)
      const response = await authenticatedFetch('/api/donations-proxy')

      if (response.ok) {
        const data = await response.json()
        setDonations(data.donations || [])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des donations:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const getDonationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'OFFERING': 'Offrande',
      'TITHE': 'Dîme',
      'FREEWILL': 'Libéralité',
      'PROJECT': 'Projet',
      'BUILDING': 'Bâtiment',
      'OTHER': 'Autre'
    }
    return types[type] || type
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      'CARD': 'Carte bancaire',
      'BANK_TRANSFER': 'Virement',
      'MOBILE_MONEY': 'Mobile Money',
      'CASH': 'Espèces',
      'CHECK': 'Chèque'
    }
    return methods[method] || method
  }

  const redirectToMobilePayment = (amount: string, curr: string) => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams({
        amount: amount.toString(),
        currency: curr,
        purpose: donationType || 'OFFERING'
      })
      window.location.href = `/mobile-payment?${params.toString()}`
    }
  }

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const finalAmount = selectedAmount === 'custom' ? customAmount : selectedAmount

      if (!finalAmount || parseFloat(finalAmount) <= 0) {
        throw new Error('Veuillez sélectionner un montant valide')
      }

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
        setMessage({ type: 'success', text: `Don de ${finalAmount} ${currency === 'CDF' ? 'FC' : '$'} enregistré avec succès ! Que Dieu vous bénisse.` })
        
        setSelectedAmount('')
        setCustomAmount('')
        setDonationType('FREEWILL')
        setPaymentMethod('MOBILE_MONEY')
        setProjectName('')
        setNotes('')
      } else {
        throw new Error('Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement du don. Veuillez réessayer.' })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  const formatAmount = (amount: number, curr: string) => {
    if (curr === 'USD') return `$${amount.toLocaleString()}`
    return `${amount.toLocaleString()} FC`
  }

  const getTotalDonations = () => {
    return donations.filter(d => d.status === 'COMPLETED').reduce((sum, d) => {
      if (d.currency === 'CDF') return sum + d.amount
      return sum + (d.amount * 2800)
    }, 0)
  }

  // Loading state
  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-[#cc9b00] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Soutien à l'Œuvre</h1>
          <p className="text-gray-600 mt-2">Chargement...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 bg-gray-200 rounded-xl" />
                <div className="h-20 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffefa] via-[#fff3cc] to-[#fffefa]">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-[#ffc200] via-[#e6af00] to-[#cc9b00] text-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Soutien à l'Œuvre</h1>
            <p className="text-[#3d3200] text-sm">Participez à la mission de l'église</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-24 -mt-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#fff3cc] border border-[#ffc200] rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#cc9b00]">{donations.filter(d => d.status === 'COMPLETED').length}</p>
            <p className="text-xs text-gray-600">Dons validés</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-yellow-600">{donations.filter(d => d.status === 'PENDING').length}</p>
            <p className="text-xs text-gray-600">En attente</p>
          </div>
          <div className="bg-[#fff3cc] border border-[#ffc200] rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#cc9b00]">{getTotalDonations().toLocaleString()}</p>
            <p className="text-xs text-gray-600">Total (FC)</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <X className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Formulaire de don */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <form onSubmit={handleDonationSubmit} className="space-y-6">
            {/* Type de soutien */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-[#cc9b00]" />
                Type de soutien
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {donationTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setDonationType(type.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        donationType === type.id 
                          ? 'border-[#ffc200] bg-[#fff3cc]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          donationType === type.id ? 'bg-[#ffda66]' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            donationType === type.id ? 'text-[#cc9b00]' : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Devise */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#cc9b00]" />
                Devise
              </h3>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setCurrency('CDF'); setSelectedAmount(''); setCustomAmount(''); }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    currency === 'CDF' 
                      ? 'bg-[#ffc200] text-[#0a0a0a] shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇨🇩 Francs Congolais (FC)
                </button>
                <button
                  type="button"
                  onClick={() => { setCurrency('USD'); setSelectedAmount(''); setCustomAmount(''); }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    currency === 'USD' 
                      ? 'bg-[#ffc200] text-[#0a0a0a] shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇺🇸 Dollars (USD)
                </button>
              </div>
            </div>

            {/* Montant */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Montant</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {predefinedAmounts[currency].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => { setSelectedAmount(amount.toString()); setCustomAmount(''); }}
                    className={`py-4 rounded-xl font-bold transition-all ${
                      selectedAmount === amount.toString() 
                        ? 'bg-[#ffc200] text-[#0a0a0a] shadow-lg scale-105' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {currency === 'USD' ? `$${amount}` : `${amount.toLocaleString()} FC`}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <input
                  type="number"
                  placeholder={`Montant personnalisé en ${currency === 'CDF' ? 'FC' : 'USD'}`}
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount('custom'); }}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] text-lg"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {currency === 'CDF' ? 'FC' : 'USD'}
                </span>
              </div>
            </div>

            {/* Mode de paiement */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#cc9b00]" />
                Mode de paiement
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === method.id 
                          ? 'border-[#ffc200] bg-[#fff3cc]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${
                          paymentMethod === method.id ? 'text-[#cc9b00]' : 'text-gray-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{method.label}</p>
                          <p className="text-xs text-gray-500">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Un message pour accompagner votre don..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
              />
            </div>

            {/* Résumé */}
            <div className="bg-gradient-to-br from-[#fff3cc] to-[#fffefa] p-4 rounded-xl border border-[#ffc200]">
              <h4 className="font-semibold text-gray-900 mb-3">Résumé</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type :</span>
                  <span className="font-medium">{getDonationTypeLabel(donationType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant :</span>
                  <span className="font-bold text-[#cc9b00] text-lg">
                    {formatAmount(
                      parseFloat(selectedAmount === 'custom' ? customAmount || '0' : selectedAmount || '0'),
                      currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Méthode :</span>
                  <span className="font-medium">{getPaymentMethodLabel(paymentMethod)}</span>
                </div>
              </div>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={submitting || (!selectedAmount && !customAmount)}
              className="w-full bg-gradient-to-r from-[#ffc200] to-[#cc9b00] text-[#0a0a0a] py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#e6af00] hover:to-[#cc9b00] transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5" />
                  Faire mon don
                </>
              )}
            </button>
          </form>
        </div>

        {/* Historique */}
        {donations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#cc9b00]" />
              Mes dons récents
            </h2>
            <div className="space-y-3">
              {donations.slice(0, 5).map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      donation.status === 'COMPLETED' ? 'bg-green-100' :
                      donation.status === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {donation.status === 'COMPLETED' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : donation.status === 'PENDING' ? (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatAmount(donation.amount, donation.currency)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getDonationTypeLabel(donation.donationType)} • {formatDate(donation.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    donation.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    donation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {donation.status === 'COMPLETED' ? 'Validé' :
                     donation.status === 'PENDING' ? 'En attente' : 'Échoué'}
                  </span>
                </div>
              ))}
            </div>
            {donations.length > 5 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Et {donations.length - 5} autre{donations.length - 5 > 1 ? 's' : ''} don{donations.length - 5 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Info bottom */}
        <div className="mt-6 bg-gradient-to-r from-[#fff3cc] to-[#fffefa] rounded-xl p-4 text-center">
          <p className="text-sm text-[#cc9b00]">
            « Celui qui sème généreusement moissonnera aussi avec abondance » - 2 Corinthiens 9:6
          </p>
        </div>
      </div>
    </div>
  )
}

export default DonationsPage
