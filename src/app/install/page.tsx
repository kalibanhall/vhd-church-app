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

import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'MyChurchApp - Installation PWA',
  description: 'Installer l\'application MyChurchApp sur votre appareil',
};

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Image
              src="/icons/icon-192x192.png"
              alt="MyChurchApp"
              width={96}
              height={96}
              className="mx-auto drop-shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Installer MyChurchApp
          </h1>
          <p className="text-xl text-gray-600">
            Profitez d&apos;une expérience native sur votre appareil
          </p>
        </div>

        {/* Avantages */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="font-bold text-lg mb-2">Accès rapide</h3>
            <p className="text-gray-600 text-sm">
              Lancez l&apos;app depuis votre écran d&apos;accueil
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-lg mb-2">Mode hors ligne</h3>
            <p className="text-gray-600 text-sm">
              Consultez vos données même sans connexion
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="font-bold text-lg mb-2">Notifications</h3>
            <p className="text-gray-600 text-sm">
              Recevez les alertes importantes en temps réel
            </p>
          </div>
        </div>

        {/* Instructions Android */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="text-5xl mr-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Sur Android (Chrome)
            </h2>
          </div>
          <ol className="space-y-4 text-gray-700">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                1
              </span>
              <div>
                <p className="font-semibold">Ouvrir le menu</p>
                <p className="text-sm text-gray-600">
                  Appuyez sur les 3 points verticaux en haut à droite
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                2
              </span>
              <div>
                <p className="font-semibold">Ajouter à l&apos;écran d&apos;accueil</p>
                <p className="text-sm text-gray-600">
                  Sélectionnez &quot;Ajouter à l&apos;écran d&apos;accueil&quot; ou &quot;Installer l&apos;application&quot;
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                3
              </span>
              <div>
                <p className="font-semibold">Confirmer</p>
                <p className="text-sm text-gray-600">
                  Appuyez sur &quot;Installer&quot; ou &quot;Ajouter&quot;
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Instructions iOS */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="text-5xl mr-4">🍎</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Sur iPhone/iPad (Safari)
            </h2>
          </div>
          <ol className="space-y-4 text-gray-700">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                1
              </span>
              <div>
                <p className="font-semibold">Ouvrir le menu de partage</p>
                <p className="text-sm text-gray-600">
                  Appuyez sur l&apos;icône de partage (carré avec flèche vers le haut)
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                2
              </span>
              <div>
                <p className="font-semibold">Sur l&apos;écran d&apos;accueil</p>
                <p className="text-sm text-gray-600">
                  Faites défiler et sélectionnez &quot;Sur l&apos;écran d&apos;accueil&quot;
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                3
              </span>
              <div>
                <p className="font-semibold">Ajouter</p>
                <p className="text-sm text-gray-600">
                  Appuyez sur &quot;Ajouter&quot; en haut à droite
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Instructions Desktop */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className="text-5xl mr-4">💻</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Sur Ordinateur (Chrome/Edge)
            </h2>
          </div>
          <ol className="space-y-4 text-gray-700">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                1
              </span>
              <div>
                <p className="font-semibold">Icône d&apos;installation</p>
                <p className="text-sm text-gray-600">
                  Cliquez sur l&apos;icône d&apos;installation dans la barre d&apos;adresse (à droite)
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                2
              </span>
              <div>
                <p className="font-semibold">Installer</p>
                <p className="text-sm text-gray-600">
                  Cliquez sur &quot;Installer&quot; dans la popup
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-sm">
            Une fois installée, l&apos;application fonctionnera comme une app native
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Développé par CHRIS NGOZULU KASONGO (KalibanHall)
          </p>
        </div>
      </div>
    </div>
  );
}
