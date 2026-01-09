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
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
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
      color: 'text-red-600',
      bgColor: 'bg-red-100',
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
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
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
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
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
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
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
      color: 'text-green-600',
      bgColor: 'bg-green-100',
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
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
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
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      actions: [
        { label: 'Demander un certificat', url: '/forms/certificate' },
      ],
      available: true,
    },
  ];

  const contacts = [
    {
      role: 'Secrétariat',
      name: 'Accueil Église VHD Kinshasa',
      phone: '+243 81 234 56 78',
      email: 'contact@vhd-church.org',
      hours: 'Lun-Sam: 8h-17h',
    },
    {
      role: 'Urgences pastorales',
      name: 'Pasteur Mukendi Jean-Pierre',
      phone: '+243 99 876 54 32',
      email: 'pasteur@vhd-church.org',
      hours: '24h/24',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <HeartHandshake className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Nous sommes là pour vous</h1>
        <p className="text-gray-600 mt-2">
          L'église est à votre service. Découvrez comment nous pouvons vous accompagner.
        </p>
      </div>

      {/* Emergency Contact */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Besoin urgent d'aide ?</p>
            <p className="text-red-100 text-sm">Nous sommes disponibles 24h/24</p>
          </div>
          <a
            href="tel:+243998765432"
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-xl font-medium hover:bg-red-50"
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
              className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedService(service)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${service.bgColor}`}>
                  <Icon className={`h-6 w-6 ${service.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{service.title}</h3>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Nous contacter</h2>
        <div className="space-y-4">
          {contacts.map((contact, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{contact.role}</p>
                <p className="font-semibold text-gray-900">{contact.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {contact.hours}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                >
                  <Phone className="h-5 w-5" />
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
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
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${selectedService.bgColor}`}>
                  <selectedService.icon className={`h-6 w-6 ${selectedService.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedService.title}</h2>
                </div>
              </div>
              <p className="text-gray-600 mb-6">{selectedService.description}</p>
              
              <div className="space-y-2">
                {selectedService.actions.map((action, idx) => (
                  <a
                    key={idx}
                    href={action.url}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100"
                  >
                    <span className="font-medium text-gray-900">{action.label}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </a>
                ))}
              </div>
              
              <button
                onClick={() => setSelectedService(null)}
                className="w-full mt-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
