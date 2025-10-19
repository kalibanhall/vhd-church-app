'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { CreditCard, Heart, TrendingUp, Users, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface Donation {
  id: string
  amount: number
  donationType: string
  paymentMethod: string
  donationDate: string
  status: string
  notes?: string
}

export default function DonationsPage() {
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [donationType, setDonationType] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [donations, setDonations] = useState<Donation[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Charger les donations de l'utilisateur
  useEffect(() => {
    if (user) {
      // Données de démonstration - en production, cela viendrait de l'API
      setDonations([
        {
          id: '1',
          amount: 50,
          donationType: 'OFFERING',
          paymentMethod: 'CARD',
          donationDate: '2025-09-20',
          status: 'COMPLETED',
          notes: 'Pour la gloire de Dieu'
        },
        {
          id: '2',
          amount: 100,
          donationType: 'PROJECT',
          paymentMethod: 'BANK_TRANSFER',
          donationDate: '2025-09-15',
          status: 'COMPLETED',
          notes: 'Soutien pour la nouvelle salle'
        },
        {
          id: '3',
          amount: 75,
          donationType: 'TITHE',
          paymentMethod: 'CARD',
          donationDate: '2025-09-01',
          status: 'COMPLETED'
        }
      ])
    }
  }, [user])

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !donationType || !paymentMethod) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' })
      return
    }

    setLoading(true)
    
    try {
      // Ici on ferait l'appel API pour créer la donation
      const newDonation: Donation = {
        id: Date.now().toString(),
        amount: parseFloat(amount),
        donationType,
        paymentMethod,
        donationDate: new Date().toISOString().split('T')[0],
        status: 'COMPLETED',
        notes: notes || undefined
      }

      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1500))

      setDonations([newDonation, ...donations])
      setMessage({ type: 'success', text: `Don de ${amount}€ enregistré avec succès ! Merci pour votre générosité.` })
      
      // Réinitialiser le formulaire
      setAmount('')
      setDonationType('')
      setPaymentMethod('')
      setNotes('')
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

  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Donations & Offrandes</h1>
        <p className="text-gray-600">Soutenez notre mission et contribuez à la croissance de notre communauté de foi</p>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Statistiques personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mes donations totales</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDonated}€</div>
            <p className="text-xs text-muted-foreground">Depuis votre inscription</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois-ci</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50€</div>
            <p className="text-xs text-muted-foreground">1 donation ce mois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de dons</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donations.length}</div>
            <p className="text-xs text-muted-foreground">Donations effectuées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Don moyen</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donations.length > 0 ? Math.round(totalDonated / donations.length) : 0}€
            </div>
            <p className="text-xs text-muted-foreground">Par donation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire de don */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Faire un don
            </CardTitle>
            <CardDescription>
              "Que chacun donne comme il l'a résolu en son cœur" - 2 Corinthiens 9:7
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDonationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setAmount('20')}
                  className="text-sm"
                >
                  20€
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setAmount('50')}
                  className="text-sm"
                >
                  50€
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setAmount('100')}
                  className="text-sm"
                >
                  100€
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setAmount('200')}
                  className="text-sm"
                >
                  200€
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="donation-type">Type de don *</Label>
                <Select value={donationType} onValueChange={setDonationType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFFERING">🙏 Offrande générale</SelectItem>
                    <SelectItem value="TITHE">📊 Dîme</SelectItem>
                    <SelectItem value="FREEWILL">❤️ Don libre</SelectItem>
                    <SelectItem value="PROJECT">🏗️ Projet spécifique</SelectItem>
                    <SelectItem value="BUILDING">🏢 Bâtiment</SelectItem>
                    <SelectItem value="OTHER">➕ Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Méthode de paiement *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir la méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CARD">💳 Carte bancaire</SelectItem>
                    <SelectItem value="BANK_TRANSFER">🏦 Virement bancaire</SelectItem>
                    <SelectItem value="MOBILE_MONEY">📱 Mobile Money</SelectItem>
                    <SelectItem value="CASH">💵 Espèces</SelectItem>
                    <SelectItem value="CHECK">📋 Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note personnelle (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Écrivez une note, une intention de prière ou un témoignage..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={loading || !amount || !donationType || !paymentMethod}
              >
                {loading ? (
                  '⏳ Traitement en cours...'
                ) : (
                  `🎁 Confirmer le don de ${amount || '0'}€`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Historique et projets */}
        <div className="space-y-6">
          {/* Projets actifs */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Projets en cours</CardTitle>
              <CardDescription>Soutenez nos projets communautaires</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">🏛️ Nouvelle salle de prière</span>
                  <Badge variant="secondary">75%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                </div>
                <p className="text-sm text-gray-600">45,000€ collectés sur 60,000€</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">👨‍👩‍👧‍👦 Aide aux familles</span>
                  <Badge variant="secondary">40%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-2/5"></div>
                </div>
                <p className="text-sm text-gray-600">8,000€ collectés sur 20,000€</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">🎵 Équipement audiovisuel</span>
                  <Badge variant="secondary">90%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-[90%]"></div>
                </div>
                <p className="text-sm text-gray-600">13,500€ collectés sur 15,000€</p>
              </div>
            </CardContent>
          </Card>

          {/* Historique personnel */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Mes donations récentes</CardTitle>
              <CardDescription>Historique de vos contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donations.length > 0 ? (
                  donations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{getDonationTypeLabel(donation.donationType)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(donation.donationDate).toLocaleDateString('fr-FR')} • {getPaymentMethodLabel(donation.paymentMethod)}
                        </p>
                        {donation.notes && (
                          <p className="text-xs text-gray-500 italic">"{donation.notes}"</p>
                        )}
                      </div>
                      <span className="font-bold text-green-600">+{donation.amount}€</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune donation pour le moment</p>
                    <p className="text-sm">Votre première contribution apparaîtra ici</p>
                  </div>
                )}
                
                {donations.length > 5 && (
                  <Button variant="outline" className="w-full mt-4">
                    📜 Voir tout l'historique ({donations.length} donations)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}