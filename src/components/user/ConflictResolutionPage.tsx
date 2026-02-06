/**
 * ConflictResolutionPage - Résoudre un conflit
 * Page pour la médiation et résolution de conflits entre membres
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState } from 'react';
import { 
  Scale,
  Users,
  Shield,
  Heart,
  MessageCircle,
  Send,
  Check,
  AlertTriangle,
  Lock,
  ChevronRight,
  Phone,
  Calendar
} from 'lucide-react';

export default function ConflictResolutionPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [request, setRequest] = useState({
    conflictType: '',
    parties: '',
    description: '',
    attempts: '',
    desiredOutcome: '',
    urgency: '',
    confidential: true,
  });

  const conflictTypes = [
    { id: 'personal', label: 'Conflit personnel avec un membre', icon: Users },
    { id: 'family', label: 'Conflit familial', icon: Heart },
    { id: 'ministry', label: 'Désaccord dans un ministère', icon: Shield },
    { id: 'leadership', label: 'Conflit avec un responsable', icon: Scale },
    { id: 'other', label: 'Autre situation', icon: MessageCircle },
  ];

  const urgencyLevels = [
    { id: 'low', label: 'Pas urgent', description: 'Peut attendre quelques semaines', color: 'text-green-600' },
    { id: 'medium', label: 'Modéré', description: 'À traiter dans les 2 semaines', color: 'text-yellow-600' },
    { id: 'high', label: 'Urgent', description: 'Nécessite une attention rapide', color: 'text-orange-600' },
    { id: 'critical', label: 'Très urgent', description: 'Situation critique', color: 'text-red-600' },
  ];

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/conflicts-proxy', {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Demande reçue</h1>
        <p className="text-gray-600 mb-6">
          Un responsable de médiation vous contactera très prochainement pour organiser une rencontre.
        </p>
        <div className="bg-[#fff3cc] rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-[#cc9b00]">
            <Lock className="h-4 w-4 inline mr-2" />
            Votre demande est traitée en toute confidentialité.
          </p>
        </div>
        <a
          href="/"
          className="px-6 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] inline-block shadow-church"
        >
          Retour à l'accueil
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
          <Scale className="h-8 w-8 text-[#cc9b00]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Résoudre un conflit</h1>
        <p className="text-gray-600 mt-2">
          L'église propose un service de médiation pour vous aider à restaurer vos relations
        </p>
      </div>

      {/* Biblical Reminder */}
      <div className="bg-[#fff3cc] rounded-xl p-4 mb-6">
        <p className="text-[#5c4d00] text-sm italic">
          "Si ton frère a péché contre toi, va et reprends-le entre toi et lui seul. S'il t'écoute, tu as gagné ton frère." - Matthieu 18:15
        </p>
      </div>

      {/* Confidentiality Notice */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl mb-6">
        <Lock className="h-5 w-5 text-gray-500 mt-0.5" />
        <div>
          <p className="font-medium text-gray-900">Confidentialité garantie</p>
          <p className="text-sm text-gray-600">
            Toutes les informations partagées sont strictement confidentielles et traitées avec le plus grand soin.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s <= step ? 'bg-[#ffc200] text-[#0a0a0a]' : 'bg-gray-200 text-gray-500'
            }`}>
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 mx-2 rounded ${s < step ? 'bg-[#ffc200]' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">De quel type de conflit s'agit-il ?</h2>
          <div className="space-y-3">
            {conflictTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setRequest({ ...request, conflictType: type.id });
                    setStep(2);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    request.conflictType === type.id
                      ? 'border-[#ffc200] bg-[#fff3cc]'
                      : 'border-gray-200 hover:border-[#ffda66] bg-white'
                  }`}
                >
                  <div className="p-2 bg-gray-100 rounded-xl">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">{type.label}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Décrivez la situation</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personnes concernées (sans obligation de nommer)
            </label>
            <input
              type="text"
              value={request.parties}
              onChange={(e) => setRequest({ ...request, parties: e.target.value })}
              placeholder="Ex: Un frère de la chorale, Ma belle-famille..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Décrivez brièvement la situation
            </label>
            <textarea
              value={request.description}
              onChange={(e) => setRequest({ ...request, description: e.target.value })}
              placeholder="Expliquez le contexte et la nature du conflit..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#ffc200]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avez-vous déjà essayé de résoudre ce conflit ?
            </label>
            <textarea
              value={request.attempts}
              onChange={(e) => setRequest({ ...request, attempts: e.target.value })}
              placeholder="Décrivez vos tentatives précédentes de résolution..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#ffc200]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quel résultat espérez-vous ?
            </label>
            <textarea
              value={request.desiredOutcome}
              onChange={(e) => setRequest({ ...request, desiredOutcome: e.target.value })}
              placeholder="Décrivez le résultat que vous souhaitez atteindre..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#ffc200]"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
            >
              Retour
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!request.description}
              className="flex-1 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] disabled:opacity-50 shadow-church"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Niveau d'urgence</h2>
          
          <div className="space-y-3">
            {urgencyLevels.map(level => (
              <button
                key={level.id}
                onClick={() => setRequest({ ...request, urgency: level.id })}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  request.urgency === level.id
                    ? 'border-[#ffc200] bg-[#fff3cc]'
                    : 'border-gray-200 hover:border-[#ffda66] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${level.color}`}>{level.label}</p>
                    <p className="text-sm text-gray-500">{level.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    request.urgency === level.id ? 'border-[#ffc200] bg-[#ffc200]' : 'border-gray-300'
                  }`}>
                    {request.urgency === level.id && <Check className="h-4 w-4 text-[#0a0a0a]" />}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={request.confidential}
              onChange={(e) => setRequest({ ...request, confidential: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-[#ffc200]"
            />
            <div>
              <p className="font-medium text-gray-900">Je souhaite que cette demande reste confidentielle</p>
              <p className="text-sm text-gray-500">Seul le médiateur assigné aura accès aux détails</p>
            </div>
          </label>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
            >
              Retour
            </button>
            <button
              onClick={handleSubmit}
              disabled={!request.urgency}
              className="flex-1 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] disabled:opacity-50 flex items-center justify-center gap-2 shadow-church"
            >
              <Send className="h-5 w-5" />
              Envoyer la demande
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide immédiate ?</h3>
        <p className="text-sm text-gray-600 mb-3">
          Si la situation nécessite une intervention urgente, contactez directement :
        </p>
        <a
          href="tel:+243812345678"
          className="flex items-center gap-2 text-[#cc9b00] font-medium"
        >
          <Phone className="h-4 w-4" />
          Ligne pastorale : +243 81 234 56 78
        </a>
      </div>
    </div>
  );
}
