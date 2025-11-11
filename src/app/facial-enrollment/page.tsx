'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import FaceCapture from '@/components/FaceCapture';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function EnrollFacePage() {
  const [step, setStep] = useState<'select' | 'capture' | 'success'>('select');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Détecter le montage côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Vérifier les permissions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isClient) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Seuls admin et pasteur peuvent accéder
    if (user.role !== 'admin' && user.role !== 'pasteur') {
      toast.error('Accès réservé aux administrateurs et pasteurs');
      router.push('/dashboard');
    }
  }, [user, router, isClient]);

  // Charger les membres sans photo faciale
  const loadMembers = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('membres')
      .select('id, nom, prenom, photo_url')
      .is('face_descriptor', null)
      .order('nom');

    if (error) {
      toast.error('Erreur lors du chargement des membres');
    } else {
      setMembers(data || []);
    }
    setIsLoading(false);
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId);
    setStep('capture');
  };

  const handleFaceDetected = async (descriptor: Float32Array, imageData: string) => {
    try {
      setIsLoading(true);

      const supabase = createClient();

      // Convertir le descripteur en array pour le stockage
      const descriptorArray = Array.from(descriptor);

      // Upload de la photo
      const fileName = `face_${selectedMemberId}_${Date.now()}.jpg`;
      const base64Data = imageData.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(r => r.blob());

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      // Mettre à jour le membre avec le descripteur facial et la photo
      const { error: updateError } = await supabase
        .from('membres')
        .update({
          face_descriptor: descriptorArray,
          photo_url: publicUrl
        })
        .eq('id', selectedMemberId);

      if (updateError) throw updateError;

      toast.success('✅ Visage enregistré avec succès!');
      setStep('success');
      
      setTimeout(() => {
        setStep('select');
        setSelectedMemberId('');
        loadMembers();
      }, 2000);

    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement du visage');
    } finally {
      setIsLoading(false);
    }
  };

  // Ne rien rendre côté serveur
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📸 Enregistrement Facial
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sélectionnez un membre pour enregistrer son visage
          </p>
        </div>

        <button
          onClick={loadMembers}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          🔄 Charger les membres
        </button>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleMemberSelect(member.id)}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {member.prenom?.[0]}{member.nom?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {member.prenom} {member.nom}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aucun visage enregistré
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {members.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              Tous les membres ont déjà un visage enregistré
            </p>
          </div>
        )}
      </div>
    );
  }

  if (step === 'capture') {
    const member = members.find(m => m.id === selectedMemberId);
    
    return (
      <div className="max-w-2xl mx-auto p-6">
        <button
          onClick={() => setStep('select')}
          className="mb-6 text-blue-600 hover:text-blue-700 font-semibold"
        >
          ← Retour
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Enregistrement de {member?.prenom} {member?.nom}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Positionnez le visage face à la caméra
          </p>
        </div>

        <FaceCapture 
          mode="capture"
          onFaceDetected={handleFaceDetected}
        />

        {isLoading && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-blue-800 dark:text-blue-300">
                Enregistrement en cours...
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
            Visage enregistré avec succès!
          </h2>
          <p className="text-green-600 dark:text-green-400">
            Le membre peut maintenant être reconnu automatiquement
          </p>
        </div>
      </div>
    );
  }

  return null;
}
