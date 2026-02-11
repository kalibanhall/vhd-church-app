/**
 * ServeYouPage - Vous servir
 * Page pour les services aux membres (aide pastorale, conseils, accompagnement)
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
  Phone,
  Mail,
  Clock,
  ChevronRight,
  Star,
  Shield,
  BookOpen,
  Baby,
  Home,
  Briefcase,
  Cross,
  HeartHandshake
} from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  actions: Array<{
    label: string;
    url: string;
  }>;
  available: boolean;
}

export default function ServeYouPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const services: Service[] = [
    {
      id: 'pastoral',
      title: 'Accompagnement pastoral',
      description: 'Bénéficiez d\'un soutien spirituel personnalisé avec nos pasteurs et responsables.',
      icon: Cross,
      color: 'text-[#cc9b00]',
      bgColor: 'bg-[#fff3cc]',
      actions: [
        { label: 'Prendre rendez-vous', url: '/appointments' },
        { label: 'Demande de prière', url: '/prayers' },
      ],
      available: true,
    },
    {
      id: 'counseling',
      title: 'Conseil & Écoute',
      description: 'Une oreille attentive pour vous écouter et vous accompagner dans vos difficultés.',
      icon: HeartHandshake,
      color: 'text-[#cc9b00]',
      bgColor: 'bg-[#fff3cc]',
      actions: [
        { label: 'Demander un entretien', url: '/appointments?type=counseling' },
        { label: 'Ligne d\'écoute', url: 'tel:+243998765432' },
      ],
      available: true,
    },
    {
      id: 'marriage',
      title: 'Préparation au mariage',
      description: 'Accompagnement pour les couples qui souhaitent se marier à l\'église.',
      icon: Heart,
      color: 'text-[#cc9b00]',
      bgColor: 'bg-[#fff3cc]',
      actions: [
        { label: 'En savoir plus', url: '/services/marriage' },
        { label: 'Contacter le pasteur', url: '/appointments?type=marriage' },
      ],
      available: true,
    },
    {
      id: 'baptism',
      title: 'Baptême',
      description: 'Préparation et célébration du baptême pour adultes et enfants.',
      icon: Heart,
      color: 'text-[#cc9b00]',
      bgColor: 'bg-[#fff3cc]',
      actions: [
        { label: 'Demande de baptême', url: '/forms/baptism' },
        { label: 'Cours de préparation', url: '/training?category=baptism' },
      ],
      available: true,
    },
    {
      id: 'dedication',
      title: 'Présentation d\'enfant',
      description: 'Cérémonie de présentation et bénédiction pour les nouveaux-nés.',
      icon: Baby,
      color: 'text-[#cc9b00]',
      bgColor: 'bg-[#fff3cc]',
      actions: [
        { label: 'Faire une demande', url: '/forms/dedication' },
      ],
      available: true,
    },
    {
      id: 'funeral',
      title: 'Service funèbre',
      description: 'Accompagnement et organisation de cérémonies funéraires.',
      icon: Cross,
      color: 'text-[#666]',
      bgColor: 'bg-[#fff3cc]',
      actions: [
        { label: 'Contacter l\'église', url: 'tel:+243998765432' },
      ],
      available: true,
    },
    {
      id: 'home-visit',
      title: 'Visite à domicile',
      description: 'Pour les personnes malades, âgées ou dans l\'impossibilité de se déplacer.',
      icon: Home,
      color: 'text-[#cc9b00]',
      bgColor: 'bg-[#fff3cc]',
      actions: [
        { label: 'Demander une visite', url: '/forms/home-visit' },
      ],
      available: true,
    },
    {
      id: 'blessing',
      title: 'Bénédiction de maison/entreprise',
      description: 'Prière de consécration pour votre nouveau logement ou entreprise.',
      icon: Briefcase,
      color: 'text-[#cc9b00]',
      bgColor: 'bg-[#fff3cc]',
      actions: [
        { label: 'Faire une demande', url: '/forms/blessing' },
      ],
      available: true,
    },
    {
      id: 'certificate',
      title: 'Certificats & Attestations',
      description: 'Certificats de baptême, mariage, ou attestation de membre.',
      icon: BookOpen,
      color: 'text-[#cc9b00]',
      bgColor: 'bg-[#fff3cc]',
      actions: [
        { label: 'Demander un certificat', url: '/forms/certificate' },
      ],
      available: true,
    },
  ];

  const contacts = [
    {
      role: 'Secrétariat',
      name: 'Accueil Église MyChurchApp',
      phone: '+243 81 234 56 78',
      email: 'contact@mychurchapp.com',
      hours: 'Lun-Sam: 8h-17h',
    },
    {
      role: 'Urgences pastorales',
      name: 'Pasteur Mukendi Jean-Pierre',
      phone: '+243 99 876 54 32',
      email: 'pasteur@mychurchapp.com',
      hours: '24h/24',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fffefa]">
      {/* Golden Gradient Header */}
      <div className="bg-gradient-to-br from-[#ffc200] via-[#ffda66] to-[#fff3cc] px-4 pt-8 pb-12 rounded-b-3xl shadow-church">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-church">
            <HeartHandshake className="h-8 w-8 text-[#0a0a0a]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0a0a0a]">Nous sommes là pour vous</h1>
          <p className="text-[#0a0a0a]/70 mt-2">
            L'église est à votre service. Découvrez comment nous pouvons vous accompagner.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-24 -mt-6">
        {/* Emergency Contact */}
        <div className="bg-gradient-to-br from-[#ffc200] via-[#ffda66] to-[#fff3cc] rounded-2xl p-4 mb-6 shadow-church">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#0a0a0a]">Besoin urgent d'aide ?</p>
              <p className="text-[#0a0a0a]/70 text-sm">Nous sommes disponibles 24h/24</p>
            </div>
            <a
              href="tel:+243998765432"
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#cc9b00] rounded-xl font-medium hover:bg-[#fff3cc] shadow-church"
            >
              <Phone className="h-5 w-5" />
              Appeler
            </a>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {services.map(service => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-xl p-4 shadow-church border border-[rgba(201,201,201,0.3)] hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${service.bgColor}`}>
                    <Icon className={`h-6 w-6 ${service.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{service.title}</h3>
                      <ChevronRight className="h-5 w-5 text-[#cc9b00]" />
                    </div>
                    <p className="text-sm text-[#666] mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="bg-[#fff3cc] rounded-2xl p-6 shadow-church">
          <h2 className="font-semibold text-gray-900 mb-4">Nous contacter</h2>
          <div className="space-y-4">
            {contacts.map((contact, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 flex items-start justify-between shadow-church border border-[rgba(201,201,201,0.3)]">
                <div>
                  <p className="text-sm text-[#666]">{contact.role}</p>
                  <p className="font-semibold text-gray-900">{contact.name}</p>
                  <p className="text-sm text-[#666] flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {contact.hours}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${contact.phone}`}
                    className="p-2 bg-[#fff3cc] text-[#cc9b00] rounded-full hover:bg-[#ffda66]"
                  >
                    <Phone className="h-5 w-5" />
                  </a>
                  <a
                    href={`mailto:${contact.email}`}
                    className="p-2 bg-[#fff3cc] text-[#666] rounded-full hover:bg-[#ffda66]"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Detail Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-church">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${selectedService.bgColor}`}>
                    <selectedService.icon className={`h-6 w-6 ${selectedService.color}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedService.title}</h2>
                  </div>
                </div>
                <p className="text-[#666] mb-6">{selectedService.description}</p>
                
                <div className="space-y-2">
                  {selectedService.actions.map((action, idx) => (
                    <a
                      key={idx}
                      href={action.url}
                      className="flex items-center justify-between p-3 bg-[#fff3cc] rounded-xl hover:bg-[#ffda66]"
                    >
                      <span className="font-medium text-gray-900">{action.label}</span>
                      <ChevronRight className="h-5 w-5 text-[#cc9b00]" />
                    </a>
                  ))}
                </div>
                
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-full mt-4 py-3 bg-[#ffc200] rounded-xl text-[#0a0a0a] font-medium hover:bg-[#cc9b00] shadow-church"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
