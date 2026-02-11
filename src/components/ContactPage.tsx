import { MapPin, Phone, Mail, Globe } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Contactez-nous</h1>
        <p className="text-gray-600">MyChurchApp</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informations de contact */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Nos Coordonnées</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-[#cc9b00] mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Adresse</p>
                <p className="text-gray-600">24, avenue</p>
                <p className="text-gray-600">Commune de Mont Ngafula</p>
                <p className="text-gray-600">Kinshasa, République Démocratique du Congo</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-[#cc9b00] flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Téléphone</p>
                <a 
                  href="tel:+243895360658" 
                  className="text-[#cc9b00] hover:text-[#3d3200] transition-colors"
                >
                  0895 360 658
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-[#cc9b00] flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Email</p>
                <a 
                  href="mailto:contact@mychurchapp.com" 
                  className="text-[#cc9b00] hover:text-[#3d3200] transition-colors"
                >
                  contact@mychurchapp.com
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-[#cc9b00] flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Site Web</p>
                <a 
                  href="https://mychurchapp.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#cc9b00] hover:text-[#3d3200] transition-colors"
                >
                  mychurchapp.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Envoyez-nous un message</h2>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffc200]"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffc200]"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone (optionnel)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffc200]"
                placeholder="0895 360 658"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Sujet
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffc200]"
                placeholder="Sujet de votre message"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffc200]"
                placeholder="Votre message..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#ffc200] text-white py-2 px-4 rounded-md hover:bg-[#cc9b00] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ffc200]"
            >
              Envoyer le message
            </button>
          </form>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-8 bg-[#fffefa] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Horaires des Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-800">Cultes Dominicaux</h3>
            <p className="text-gray-600">Dimanche : 9h00 - 12h00</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Réunions de Prière</h3>
            <p className="text-gray-600">Mercredi : 18h00 - 20h00</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">École du Dimanche</h3>
            <p className="text-gray-600">Dimanche : 8h00 - 9h00</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Jeunesse</h3>
            <p className="text-gray-600">Samedi : 15h00 - 17h00</p>
          </div>
        </div>
      </div>
    </div>
  )
}

