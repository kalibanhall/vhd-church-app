'use client'

import { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'

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
  const [donations, setDonations] = useState<Donation[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Charger les donations de l'utilisateur depuis l'API
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
      console.error('Erreur chargement donations:', error)
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
      // Appel API pour créer la donation
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
        setMessage({ type: 'success', text: `Don de ${amount}€ enregistré avec succès ! Merci pour votre générosité.` })
        
        // Réinitialiser le formulaire
        setAmount('')
        setDonationType('')
        setPaymentMethod('')
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

  const getDonationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'OFFERING': 'Offrande générale',
      'TITHE': 'Dîme',
      'FREEWILL': 'Don libre',
      'PROJECT': 'Projet spécifique',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const totalDonations = donations.reduce((sum, don) => sum + don.amount, 0)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💝 Soutien à l'œuvre & Offrandes</h1>
        <p className="text-gray-600">Soutenez la mission de notre église avec générosité</p>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total de mon soutien</h3>
            <span className="text-green-500">💰</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalDonations.toFixed(2)}€</div>
          <p className="text-xs text-gray-500">Cette année</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Nombre de soutiens</h3>
            <span className="text-blue-500">📊</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{donations.length}</div>
          <p className="text-xs text-gray-500">Contributions enregistrées</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Don moyen</h3>
            <span className="text-purple-500">📈</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {donations.length > 0 ? (totalDonations / donations.length).toFixed(2) : '0.00'}€
          </div>
          <p className="text-xs text-gray-500">Par contribution</p>
        </div>
      </div>

      {/* Formulaire de nouveau don */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">💝 Faire un nouveau don</h2>
        
        <form onSubmit={handleDonationSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            {/* Type de don */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de don *
              </label>
              <select
                value={donationType}
                onChange={(e) => setDonationType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choisir le type</option>
                <option value="OFFERING">Offrande générale</option>
                <option value="TITHE">Dîme</option>
                <option value="FREEWILL">Don libre</option>
                <option value="PROJECT">Projet spécifique</option>
                <option value="BUILDING">Bâtiment</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>

            {/* Méthode de paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choisir la méthode</option>
                <option value="CARD">Carte bancaire</option>
                <option value="BANK_TRANSFER">Virement bancaire</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="CASH">Espèces</option>
                <option value="CHECK">Chèque</option>
              </select>
            </div>

            {/* Projet spécifique */}
            {donationType === 'PROJECT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du projet
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Nouvelle salle, Orphelinat, etc."
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Message ou intention particulière pour ce don..."
            />
          </div>

          {/* Bouton de soumission */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? '💭 Enregistrement...' : '💝 Enregistrer le don'}
            </button>
          </div>
        </form>
      </div>

      {/* Historique des soutiens */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 Historique de mon soutien à l'œuvre</h2>
        
        {donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-6xl mb-4">💝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun soutien enregistré</h3>
            <p className="text-gray-600">Votre premier soutien apparaîtra ici une fois enregistré</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <div key={donation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getDonationTypeLabel(donation.donationType)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(donation.donationDate)} • {getPaymentMethodLabel(donation.paymentMethod)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {donation.amount.toFixed(2)}€
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      donation.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {donation.status === 'completed' ? 'Complété' : 'En cours'}
                    </span>
                  </div>
                </div>
                
                {donation.projectName && (
                  <p className="text-sm text-blue-600 mb-2">
                    🎯 Projet: {donation.projectName}
                  </p>
                )}
                
                {donation.notes && (
                  <p className="text-sm text-gray-600 italic">
                    "{donation.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
