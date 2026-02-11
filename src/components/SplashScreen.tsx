/**
 * =============================================================================
 * MYCHURCHAPP
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * Version: 1.0.3
 * Date: Novembre 2025
 * 
 * =============================================================================
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Déclencher l'animation de sortie après 2.5 secondes
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Masquer complètement après 3 secondes
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#ffc200] via-[#cc9b00] to-[#5c4d00] transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* Logo animé */}
        <div className="relative mb-8 animate-pulse-slow">
          <div className="absolute inset-0 rounded-full bg-white/20 blur-3xl animate-ping-slow"></div>
          <div className="relative">
            <Image
              src="/icons/icon-192x192.png"
              alt="MyChurchApp"
              width={192}
              height={192}
              className="mx-auto drop-shadow-2xl animate-bounce-slow"
              priority
            />
          </div>
        </div>

        {/* Texte animé */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white animate-fade-in-up">
            MyChurchApp
          </h1>
          <p className="text-xl text-[#fff3cc] animate-fade-in-up animation-delay-200">
            Votre Église Connectée
          </p>

          {/* Barre de chargement */}
          <div className="mx-auto mt-8 w-64 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-loading-bar"></div>
          </div>

          {/* Texte de chargement */}
          <p className="text-sm text-[#fff3cc] animate-pulse mt-4">
            Chargement en cours...
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes ping-slow {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes loading-bar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-loading-bar {
          animation: loading-bar 2.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
