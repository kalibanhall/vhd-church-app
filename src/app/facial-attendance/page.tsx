'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import FaceCapture from '@/components/FaceCapture';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Forcer le rendu dynamique (désactiver la génération statique)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function FacialAttendancePage() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMember, setCurrentMember] = useState<any | null>(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  // Assurer que c'est côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Vérifier les permissions
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

  // Charger les membres avec descripteur facial
  useEffect(() => {
    const loadData = async () => {
      if (!isClient) return;
      if (user && (user.role === 'admin' || user.role === 'pasteur')) {
        await loadMembers();
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isClient]);

  const loadMembers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('membres')
      .select('id, nom, prenom, photo_url, face_descriptor')
      .not('face_descriptor', 'is', null);

    if (error) {
      toast.error('Erreur lors du chargement des membres');
    } else {
      setMembers(data || []);
    }
    setIsLoading(false);
  };

  const markAttendance = async (memberId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('presences')
        .insert({
          membre_id: memberId,
          date: today,
          present: true,
          heure_arrivee: new Date().toISOString()
        });

      if (error) {
        // Si déjà marqué, mettre à jour
        const { error: updateError } = await supabase
          .from('presences')
          .update({
            present: true,
            heure_arrivee: new Date().toISOString()
          })
          .eq('membre_id', memberId)
          .eq('date', today);

        if (updateError) throw updateError;
      }

      setAttendanceMarked(true);
      toast.success('✅ Présence enregistrée!');
      
      setTimeout(() => {
        setCurrentMember(null);
        setAttendanceMarked(false);
      }, 3000);

    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement de la présence');
    }
  };

  const handleFaceDetected = async (descriptor: Float32Array) => {
    if (members.length === 0) return;

    let bestMatch = null;
    let bestDistance = Infinity;

    // Comparer avec tous les membres
    for (const member of members) {
      if (!member.face_descriptor) continue;

      const savedDescriptor = new Float32Array(member.face_descriptor);
      const distance = euclideanDistance(descriptor, savedDescriptor);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = member;
      }
    }

    // Si correspondance > 60% (distance < 0.6)
    if (bestMatch && bestDistance < 0.6) {
      setCurrentMember(bestMatch);
      await markAttendance(bestMatch.id);
    } else {
      toast.error('Visage non reconnu');
    }
  };

  // Calcul de distance euclidienne
  const euclideanDistance = (a: Float32Array, b: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  };

  // Ne rien rendre côté serveur
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          👤 Pointage par Reconnaissance Faciale
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {members.length} membre{members.length > 1 ? 's' : ''} enregistré{members.length > 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-300">
            Aucun membre avec visage enregistré. Allez dans "Enregistrement Facial" d'abord.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {!currentMember && !attendanceMarked && (
            <FaceCapture 
              mode="verify"
              onFaceDetected={handleFaceDetected}
            />
          )}

          {currentMember && (
            <div className="bg-white dark:bg-gray-800 border-2 border-green-500 rounded-lg p-6">
              <div className="flex items-center gap-4">
                {currentMember.photo_url ? (
                  <img 
                    src={currentMember.photo_url} 
                    alt={currentMember.nom}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {currentMember.prenom?.[0]}{currentMember.nom?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentMember.prenom} {currentMember.nom}
                  </h3>
                  <p className="text-green-600 dark:text-green-400 font-semibold">
                    ✓ Présence enregistrée
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            📊 Statistiques du jour
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {members.filter(m => m.present_today).length}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            présents sur {members.length}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
            ⏱️ Dernière présence
          </h3>
          <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
            {currentMember ? `${currentMember.prenom} ${currentMember.nom}` : '-'}
          </p>
          <p className="text-sm text-purple-700 dark:text-purple-400">
            {currentMember ? new Date().toLocaleTimeString('fr-FR') : 'En attente...'}
          </p>
        </div>
      </div>
    </div>
  );
}
