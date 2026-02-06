/**
 * FollowUpPage - Être suivi
 * Page pour demander un suivi pastoral ou un accompagnement spirituel
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState } from 'react';
import { 
  Heart, 
  Users, 
  Calendar,
  MessageCircle,
  Check,
  ChevronRight,
  Star,
  Shield,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  User,
  Send
} from 'lucide-react';

interface FollowUpRequest {
  type: string;
  reason: string;
  preferredContact: string;
  availability: string;
  notes: string;
}

export default function FollowUpPage() {
  const [step, setStep] = useState(1);
  const [request, setRequest] = useState<FollowUpRequest>({
    type: '',
    reason: '',
    preferredContact: '',
    availability: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const followUpTypes = [
    {
      id: 'spiritual',
      title: 'Croissance spirituelle',
      description: 'Accompagnement pour approfondir votre foi et votre relation avec Dieu',
      icon: TrendingUp,
      color: 'text-[#cc9b00]',
      bgColor: 'bg-[#fff3cc]',
    },
    {
      id: 'new-believer',
      title: 'Nouveau croyant',
      description: 'Suivi pour les personnes qui viennent de donner leur vie à Christ',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      id: 'discipleship',
      title: 'Discipulat',
      description: 'Formation approfondie pour devenir un disciple de Christ',
      icon: BookOpen,
      color: 'text-[#cc9b00]',
      bgColor: 'bg-[#fff3cc]',
    },
    {
      id: 'crisis',
      title: 'Traversée de crise',
      description: 'Soutien pour surmonter une période difficile de votre vie',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      id: 'integration',
      title: 'Intégration à l\'église',
      description: 'Aide pour trouver votre place et vous intégrer dans la communauté',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      id: 'accountability',
      title: 'Partenaire de responsabilité',
      description: 'Avoir quelqu\'un pour vous aider à rester fidèle à vos engagements',
      icon: Target,
      color: 'text-[#cc9b00]',
      bgColor: 'bg-[#fff3cc]',
    },
  ];

  const reasons = [
    'Je veux grandir dans ma foi',
    'J\'ai besoin de soutien spirituel',
    'Je traverse une période difficile',
    'Je veux mieux comprendre la Bible',
    'Je cherche ma place dans l\'église',
    'J\'ai des questions sur ma foi',
    'Autre',
  ];

  const contactPreferences = [
    { id: 'phone', label: 'Téléphone', icon: '📞' },
    { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'in-person', label: 'En personne', icon: '🤝' },
  ];

  const availabilities = [
    { id: 'morning', label: 'Matin (8h-12h)', icon: '🌅' },
    { id: 'afternoon', label: 'Après-midi (12h-18h)', icon: '☀️' },
    { id: 'evening', label: 'Soir (18h-21h)', icon: '🌙' },
    { id: 'weekend', label: 'Week-end', icon: '📅' },
  ];

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/followup-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto p-4 text-center pt-20">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h1>
        <p className="text-gray-600 mb-6">
          Un responsable vous contactera très bientôt pour organiser votre accompagnement.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setRequest({
              type: '',
              reason: '',
              preferredContact: '',
              availability: '',
              notes: '',
            });
          }}
          className="px-6 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] shadow-church"
        >
          Nouvelle demande
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-[#cc9b00]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Être suivi</h1>
        <p className="text-gray-600 mt-2">
          Demandez un accompagnement personnalisé pour votre vie spirituelle
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div
            key={s}
            className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s <= step
                  ? 'bg-[#ffc200] text-[#0a0a0a]'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  s < step ? 'bg-[#ffc200]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Type of Follow-up */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quel type d'accompagnement recherchez-vous ?
          </h2>
          <div className="grid gap-3">
            {followUpTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setRequest({ ...request, type: type.id });
                    setStep(2);
                  }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    request.type === type.id
                      ? 'border-[#ffc200] bg-[#fff3cc]'
                      : 'border-gray-200 hover:border-[#ffda66] bg-white'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${type.bgColor}`}>
                    <Icon className={`h-6 w-6 ${type.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{type.title}</p>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Reason */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Qu'est-ce qui vous motive à demander un suivi ?
          </h2>
          <div className="grid gap-2">
            {reasons.map(reason => (
              <button
                key={reason}
                onClick={() => setRequest({ ...request, reason })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  request.reason === reason
                    ? 'border-[#ffc200] bg-[#fff3cc]'
                    : 'border-gray-200 hover:border-[#ffda66] bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    request.reason === reason ? 'border-[#ffc200] bg-[#ffc200]' : 'border-gray-300'
                  }`}>
                    {request.reason === reason && <Check className="h-3 w-3 text-[#0a0a0a]" />}
                  </div>
                  <span className="text-gray-900">{reason}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
            >
              Retour
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!request.reason}
              className="flex-1 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] disabled:opacity-50 disabled:cursor-not-allowed shadow-church"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Contact Preferences */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Comment préférez-vous être contacté ?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {contactPreferences.map(pref => (
                <button
                  key={pref.id}
                  onClick={() => setRequest({ ...request, preferredContact: pref.id })}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    request.preferredContact === pref.id
                      ? 'border-[#ffc200] bg-[#fff3cc]'
                      : 'border-gray-200 hover:border-[#ffda66] bg-white'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{pref.icon}</span>
                  <span className="text-gray-900 font-medium">{pref.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Quand êtes-vous disponible ?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {availabilities.map(avail => (
                <button
                  key={avail.id}
                  onClick={() => setRequest({ ...request, availability: avail.id })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    request.availability === avail.id
                      ? 'border-[#ffc200] bg-[#fff3cc]'
                      : 'border-gray-200 hover:border-[#ffda66] bg-white'
                  }`}
                >
                  <span className="text-xl mb-1 block">{avail.icon}</span>
                  <span className="text-sm text-gray-900">{avail.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
            >
              Retour
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!request.preferredContact || !request.availability}
              className="flex-1 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] disabled:opacity-50 disabled:cursor-not-allowed shadow-church"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Additional Notes & Confirm */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Avez-vous quelque chose à ajouter ?
          </h2>
          
          <textarea
            value={request.notes}
            onChange={(e) => setRequest({ ...request, notes: e.target.value })}
            placeholder="Partagez ici toute information que vous jugez utile pour votre accompagnement (optionnel)"
            className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#ffc200] focus:border-transparent"
          />

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type de suivi</span>
                <span className="font-medium text-gray-900">
                  {followUpTypes.find(t => t.id === request.type)?.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Motivation</span>
                <span className="font-medium text-gray-900">{request.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contact préféré</span>
                <span className="font-medium text-gray-900">
                  {contactPreferences.find(c => c.id === request.preferredContact)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Disponibilité</span>
                <span className="font-medium text-gray-900">
                  {availabilities.find(a => a.id === request.availability)?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
            >
              Retour
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] flex items-center justify-center gap-2 shadow-church"
            >
              <Send className="h-5 w-5" />
              Envoyer la demande
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
