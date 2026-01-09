/**
 * AbuseReportPage - Signaler un abus
 * Page pour signaler des cas d'abus ou de comportements inappropriés
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState } from 'react';
import { 
  ShieldAlert,
  Lock,
  AlertTriangle,
  Check,
  Phone,
  ChevronRight,
  Eye,
  EyeOff,
  Upload,
  FileText,
  Send,
  ExternalLink,
  Heart
} from 'lucide-react';

export default function AbuseReportPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [report, setReport] = useState({
    type: '',
    description: '',
    involved: '',
    witnesses: '',
    date: '',
    location: '',
    evidence: [] as File[],
    wantsFollowUp: true,
    contactPreference: 'app'
  });

  const abuseTypes = [
    { id: 'harassment', label: 'Harcèlement', description: 'Moral, verbal ou psychologique' },
    { id: 'sexual', label: 'Abus sexuel', description: 'Comportement ou attouchement inapproprié' },
    { id: 'financial', label: 'Abus financier', description: 'Manipulation ou extorsion' },
    { id: 'spiritual', label: 'Abus spirituel', description: 'Manipulation spirituelle ou abus de pouvoir' },
    { id: 'physical', label: 'Violence physique', description: 'Agression ou menace physique' },
    { id: 'child', label: 'Maltraitance d\'enfant', description: 'Tout abus envers un mineur' },
    { id: 'domestic', label: 'Violence domestique', description: 'Violence conjugale ou familiale' },
    { id: 'other', label: 'Autre', description: 'Autre type de comportement inapproprié' },
  ];

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        ...report,
        anonymous,
      }));
      report.evidence.forEach((file, index) => {
        formData.append(`evidence_${index}`, file);
      });

      await fetch('/api/abuse-reports-proxy', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Signalement reçu</h1>
        <p className="text-gray-600 mb-6">
          Votre signalement sera traité avec la plus grande confidentialité et sérieux par notre équipe dédiée.
        </p>
        
        <div className="bg-blue-50 rounded-xl p-4 mb-4 text-left">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Numéro de référence
          </h3>
          <p className="text-2xl font-mono text-blue-700">
            REF-{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
          <p className="text-sm text-blue-600 mt-2">Conservez ce numéro pour le suivi</p>
        </div>

        {!anonymous && report.wantsFollowUp && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-600">
              Un responsable vous contactera dans les 24-48h pour discuter des suites à donner.
            </p>
          </div>
        )}

        <div className="p-4 bg-yellow-50 rounded-xl mb-6">
          <p className="text-sm text-yellow-700">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Si vous êtes en danger immédiat, appelez le <strong>17</strong> (Police) ou le <strong>3919</strong> (Violences Femmes Info)
          </p>
        </div>

        <a
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 inline-block"
        >
          Retour à l'accueil
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Signaler un abus</h1>
        <p className="text-gray-600 mt-2">
          L'église s'engage à protéger chaque membre. Tout signalement est pris au sérieux.
        </p>
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">En cas de danger immédiat</p>
            <p className="text-sm text-red-700 mt-1">
              Appelez immédiatement le <strong>17</strong> (Police) ou le <strong>15</strong> (SAMU)
            </p>
          </div>
        </div>
      </div>

      {/* Confidentiality Notice */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl mb-6">
        <Lock className="h-5 w-5 text-gray-500 mt-0.5" />
        <div>
          <p className="font-medium text-gray-900">Confidentialité absolue</p>
          <p className="text-sm text-gray-600">
            Votre identité et les détails du signalement sont protégés. Vous pouvez signaler de façon anonyme.
          </p>
        </div>
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl mb-6">
        <div className="flex items-center gap-3">
          {anonymous ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
          <div>
            <p className="font-medium text-gray-900">Signalement anonyme</p>
            <p className="text-sm text-gray-500">
              {anonymous ? 'Votre identité sera masquée' : 'Votre identité sera partagée avec les responsables'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setAnonymous(!anonymous)}
          className={`w-12 h-6 rounded-full transition-colors ${anonymous ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${anonymous ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s <= step ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 mx-2 rounded ${s < step ? 'bg-red-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Type Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quel type de comportement souhaitez-vous signaler ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {abuseTypes.map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setReport({ ...report, type: type.id });
                  setStep(2);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  report.type === type.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300 bg-white'
                }`}
              >
                <p className="font-medium text-gray-900">{type.label}</p>
                <p className="text-sm text-gray-500 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Détails du signalement</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Décrivez ce qui s'est passé *
            </label>
            <textarea
              value={report.description}
              onChange={(e) => setReport({ ...report, description: e.target.value })}
              placeholder="Décrivez les faits de manière aussi précise que possible..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personne(s) impliquée(s)
            </label>
            <textarea
              value={report.involved}
              onChange={(e) => setReport({ ...report, involved: e.target.value })}
              placeholder="Nom(s) ou description de la/des personne(s)..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date (approximative)
              </label>
              <input
                type="date"
                value={report.date}
                onChange={(e) => setReport({ ...report, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu
              </label>
              <input
                type="text"
                value={report.location}
                onChange={(e) => setReport({ ...report, location: e.target.value })}
                placeholder="Ex: Église, domicile..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Témoins (si applicable)
            </label>
            <input
              type="text"
              value={report.witnesses}
              onChange={(e) => setReport({ ...report, witnesses: e.target.value })}
              placeholder="Noms des personnes ayant assisté aux faits..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
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
              disabled={!report.description}
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Evidence & Submit */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Preuves et suivi</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pièces jointes (optionnel)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-2">
                Glissez vos fichiers ici ou cliquez pour sélectionner
              </p>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setReport({ ...report, evidence: [...report.evidence, ...Array.from(e.target.files)] });
                  }
                }}
                className="hidden"
                id="evidence-upload"
              />
              <label
                htmlFor="evidence-upload"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200"
              >
                Choisir des fichiers
              </label>
            </div>
            {report.evidence.length > 0 && (
              <div className="mt-3 space-y-2">
                {report.evidence.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                    <button
                      onClick={() => setReport({ ...report, evidence: report.evidence.filter((_, i) => i !== index) })}
                      className="text-red-500 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!anonymous && (
            <>
              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={report.wantsFollowUp}
                  onChange={(e) => setReport({ ...report, wantsFollowUp: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-red-600"
                />
                <div>
                  <p className="font-medium text-gray-900">Je souhaite être tenu(e) informé(e) du suivi</p>
                  <p className="text-sm text-gray-500">Un responsable vous contactera pour vous informer des mesures prises</p>
                </div>
              </label>

              {report.wantsFollowUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment préférez-vous être contacté(e) ?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'app', label: 'Via l\'app' },
                      { id: 'phone', label: 'Téléphone' },
                      { id: 'email', label: 'Email' },
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => setReport({ ...report, contactPreference: option.id })}
                        className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                          report.contactPreference === option.id
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-700 hover:border-red-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700">
              <Heart className="h-4 w-4 inline mr-2" />
              Nous vous remercions de votre courage. L'église s'engage à agir pour la protection de tous ses membres.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
            >
              Retour
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Send className="h-5 w-5" />
              Envoyer le signalement
            </button>
          </div>
        </div>
      )}

      {/* Resources Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-3">Ressources d'aide</h3>
        <div className="space-y-2 text-sm">
          <a href="tel:3919" className="flex items-center gap-2 text-blue-600">
            <Phone className="h-4 w-4" />
            3919 - Violences Femmes Info
          </a>
          <a href="tel:119" className="flex items-center gap-2 text-blue-600">
            <Phone className="h-4 w-4" />
            119 - Enfance en danger
          </a>
          <a href="https://www.service-public.fr/particuliers/vosdroits/N19805" target="_blank" rel="noopener" className="flex items-center gap-2 text-blue-600">
            <ExternalLink className="h-4 w-4" />
            Service-Public.fr - Porter plainte
          </a>
        </div>
      </div>
    </div>
  );
}
