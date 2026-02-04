'use client'

import { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { Heart, Wallet, TrendingUp, History, Loader2, ChevronRight, Target } from 'lucide-react'

interface Donation {
  id: string
  amount: number
  donationType: string
  paymentMethod: string
  donationDate: string
  status: string
  notes?: string
  projectName?: string
}

export default function DonationsPage() {
  const [amount, setAmount] = useState('')
  const [donationType, setDonationType] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [projectName, setProjectName] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [donations, setDonations] = useState<Donation[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      setLoadingData(true)
      const response = await authenticatedFetch('/api/donations-proxy')

      if (response.ok) {
        const data = await response.json()
        setDonations(data)
      }
    } catch (error) {
      console.error('[Donations] Error loading donations:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !donationType || !paymentMethod) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' })
      return
    }

    setLoading(true)
    
    try {
      const response = await authenticatedFetch('/api/donations-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          donationType,
          paymentMethod,
          projectName: projectName || null,
          notes: notes || null,
          isAnonymous: false
        })
      })

      if (response.ok) {
        const newDonation = await response.json()
        setDonations([newDonation, ...donations])
        setMessage({ type: 'success', text: `Don de ${amount} FC enregistre avec succes. Merci pour votre generosite.` })
        
        setAmount('')
        setDonationType('')
        setPaymentMethod('')
        setProjectName('')
        setNotes('')
      } else {
        throw new Error('Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement du don. Veuillez reessayer.' })
    } finally {
      setLoading(false)
    }
  }

  const getDonationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'OFFERING': 'Offrande generale',
      'TITHE': 'Dime',
      'FREEWILL': 'Don libre',
      'PROJECT': 'Projet specifique',
      'BUILDING': 'Batiment',
      'OTHER': 'Autre'
    }
    return types[type] || type
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      'CARD': 'Carte bancaire',
      'BANK_TRANSFER': 'Virement bancaire',
      'MOBILE_MONEY': 'Mobile Money',
      'CASH': 'Especes',
      'CHECK': 'Cheque'
    }
    return methods[method] || method
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const totalDonations = donations.reduce((sum, don) => sum + don.amount, 0)

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#fffefa] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#ffc200] animate-spin mx-auto mb-4" />
          <p className="text-[#999]">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffefa]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#ffc200] via-[#ffda66] to-[#fff3cc]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-14 h-14 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="h-7 w-7 text-[#0a0a0a]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">Soutien et Offrandes</h1>
            <p className="text-[#0a0a0a]/70 text-sm">Soutenez la mission de notre eglise</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 -mt-4">
        {/* Message de feedback */}
        {message && (
          <div className={`mb-4 p-4 rounded-xl shadow-church border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-church border border-[rgba(201,201,201,0.3)]">
            <div className="w-10 h-10 bg-[#fff3cc] rounded-lg flex items-center justify-center mb-3">
              <Wallet className="h-5 w-5 text-[#cc9b00]" />
            </div>
            <p className="text-xl font-bold text-[#0a0a0a]">{totalDonations.toLocaleString()}</p>
            <p className="text-xs text-[#999]">FC - Total</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-church border border-[rgba(201,201,201,0.3)]">
            <div className="w-10 h-10 bg-[#fff3cc] rounded-lg flex items-center justify-center mb-3">
              <History className="h-5 w-5 text-[#cc9b00]" />
            </div>
            <p className="text-xl font-bold text-[#0a0a0a]">{donations.length}</p>
            <p className="text-xs text-[#999]">Contributions</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-church border border-[rgba(201,201,201,0.3)]">
            <div className="w-10 h-10 bg-[#fff3cc] rounded-lg flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5 text-[#cc9b00]" />
            </div>
            <p className="text-xl font-bold text-[#0a0a0a]">
              {donations.length > 0 ? Math.round(totalDonations / donations.length).toLocaleString() : '0'}
            </p>
            <p className="text-xs text-[#999]">FC - Moyenne</p>
          </div>
        </div>

        {/* Formulaire de nouveau don */}
        <div className="bg-white rounded-xl shadow-church border border-[rgba(201,201,201,0.3)] p-5 mb-6">
          <h2 className="font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#cc9b00]" />
            Faire un nouveau don
          </h2>
          
          <form onSubmit={handleDonationSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Montant (FC) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-[rgba(201,201,201,0.3)] rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] bg-[#fffefa]"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Type de don *
                </label>
                <select
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value)}
                  className="w-full px-4 py-3 border border-[rgba(201,201,201,0.3)] rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] bg-[#fffefa]"
                  required
                >
                  <option value="">Choisir le type</option>
                  <option value="OFFERING">Offrande generale</option>
                  <option value="TITHE">Dime</option>
                  <option value="FREEWILL">Don libre</option>
                  <option value="PROJECT">Projet specifique</option>
                  <option value="BUILDING">Batiment</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Methode de paiement *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-[rgba(201,201,201,0.3)] rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] bg-[#fffefa]"
                  required
                >
                  <option value="">Choisir la methode</option>
                  <option value="CARD">Carte bancaire</option>
                  <option value="BANK_TRANSFER">Virement bancaire</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CASH">Especes</option>
                  <option value="CHECK">Cheque</option>
                </select>
              </div>

              {donationType === 'PROJECT' && (
                <div>
                  <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                    Nom du projet
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-3 border border-[rgba(201,201,201,0.3)] rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] bg-[#fffefa]"
                    placeholder="Ex: Nouvelle salle, Orphelinat, etc."
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0a0a0a] mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-[rgba(201,201,201,0.3)] rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] bg-[#fffefa]"
                placeholder="Message ou intention particuliere pour ce don..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-[#ccc] cursor-not-allowed text-[#666]' 
                  : 'bg-[#ffc200] hover:bg-[#ffda66] text-[#0a0a0a]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5" />
                  Enregistrer le don
                </>
              )}
            </button>
          </form>
        </div>

        {/* Historique des soutiens */}
        <div className="bg-white rounded-xl shadow-church border border-[rgba(201,201,201,0.3)] p-5">
          <h2 className="font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-[#cc9b00]" />
            Historique des dons
          </h2>
          
          {donations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#fff3cc] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-[#cc9b00]" />
              </div>
              <h3 className="font-medium text-[#0a0a0a] mb-2">Aucun soutien enregistre</h3>
              <p className="text-sm text-[#999]">Votre premier soutien apparaitra ici une fois enregistre</p>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((donation) => (
                <div key={donation.id} className="p-4 bg-[#fffefa] rounded-lg border border-[rgba(201,201,201,0.2)] hover:border-[#ffc200]/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[#cc9b00] bg-[#fff3cc] px-2 py-0.5 rounded">
                          {getDonationTypeLabel(donation.donationType)}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          donation.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-[#fff3cc] text-[#cc9b00]'
                        }`}>
                          {donation.status === 'completed' ? 'Complete' : 'En cours'}
                        </span>
                      </div>
                      <p className="text-sm text-[#666]">
                        {formatDate(donation.donationDate)} - {getPaymentMethodLabel(donation.paymentMethod)}
                      </p>
                      {donation.projectName && (
                        <p className="text-sm text-[#cc9b00] mt-1 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Projet: {donation.projectName}
                        </p>
                      )}
                      {donation.notes && (
                        <p className="text-sm text-[#999] italic mt-1">"{donation.notes}"</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#cc9b00]">
                        {donation.amount.toLocaleString()} FC
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
