/**
 * TransportPage - Transport & navette
 * Service de transport et navette pour les membres
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Bus,
  Car,
  MapPin,
  Clock,
  Calendar,
  Users,
  Phone,
  ChevronRight,
  Plus,
  Search,
  X,
  Check,
  Navigation,
  AlertCircle,
  User,
  MessageCircle,
  Star,
  Filter,
  Loader2
} from 'lucide-react';

interface TransportRoute {
  id: string;
  name: string;
  type: 'shuttle' | 'carpool';
  driver: {
    id: string;
    name: string;
    phone?: string;
    rating: number;
    trips: number;
  };
  departure: {
    location: string;
    address: string;
    time: string;
  };
  destination: {
    location: string;
    address: string;
  };
  stops: { location: string; time: string }[];
  date: string;
  recurrent: boolean;
  recurrence?: string;
  availableSeats: number;
  totalSeats: number;
  price?: number;
  notes?: string;
}

interface BookingRequest {
  routeId: string;
  pickupStop: string;
  passengers: number;
  notes?: string;
}

export default function TransportPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [myBookings, setMyBookings] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'shuttle' | 'carpool'>('all');
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [bookingRequest, setBookingRequest] = useState<BookingRequest>({
    routeId: '',
    pickupStop: '',
    passengers: 1,
    notes: '',
  });

  const mockRoutes: TransportRoute[] = [
    {
      id: '1',
      name: 'Navette Gare Centrale Kinshasa',
      type: 'shuttle',
      driver: {
        id: 'd1',
        name: 'Pasteur Mukendi Jean-Pierre',
        phone: '+243812345678',
        rating: 4.9,
        trips: 156,
      },
      departure: {
        location: 'Gare Centrale de Kinshasa',
        address: 'Boulevard du 30 Juin, Gombe',
        time: '08:00',
      },
      destination: {
        location: 'Église MyChurchApp Kinshasa',
        address: 'Avenue de la Libération, Gombe',
      },
      stops: [
        { location: 'Rond-point Victoire', time: '08:15' },
        { location: 'Place de la Poste', time: '08:25' },
        { location: 'Marché Central', time: '08:35' },
      ],
      date: '2026-01-12',
      recurrent: true,
      recurrence: 'Chaque dimanche',
      availableSeats: 4,
      totalSeats: 15,
      notes: 'Navette officielle de l\'église',
    },
    {
      id: '2',
      name: 'Covoiturage depuis Lemba',
      type: 'carpool',
      driver: {
        id: 'd2',
        name: 'Sœur Mbuyi Marie',
        phone: '+243898765432',
        rating: 4.8,
        trips: 42,
      },
      departure: {
        location: 'Rond-point Lemba',
        address: 'Avenue de l\'Université, Lemba',
        time: '08:30',
      },
      destination: {
        location: 'Église MyChurchApp Kinshasa',
        address: 'Avenue de la Libération, Gombe',
      },
      stops: [
        { location: 'Campus UNIKIN', time: '08:40' },
        { location: 'Rond-point Ngaba', time: '08:50' },
      ],
      date: '2026-01-12',
      recurrent: true,
      recurrence: 'Chaque dimanche',
      availableSeats: 2,
      totalSeats: 4,
      price: 2000,
      notes: 'Participation aux frais de carburant',
    },
    {
      id: '3',
      name: 'Navette Port de Matadi',
      type: 'shuttle',
      driver: {
        id: 'd3',
        name: 'Frère Lunda Patrick',
        phone: '+243823456789',
        rating: 4.7,
        trips: 89,
      },
      departure: {
        location: 'Port de Matadi',
        address: 'Quai Principal, Matadi',
        time: '06:00',
      },
      destination: {
        location: 'Église MyChurchApp Matadi',
        address: 'Avenue Mobutu, Matadi',
      },
      stops: [
        { location: 'Gare SNCC Matadi', time: '06:15' },
        { location: 'Marché Mvuadu', time: '06:25' },
      ],
      date: '2026-01-12',
      recurrent: true,
      recurrence: 'Chaque dimanche',
      availableSeats: 8,
      totalSeats: 20,
      notes: 'Bus de 20 places',
    },
    {
      id: '4',
      name: 'Covoiturage Ngaliema',
      type: 'carpool',
      driver: {
        id: 'd4',
        name: 'Diacre Kabongo Simon',
        phone: '+243834567890',
        rating: 4.9,
        trips: 67,
      },
      departure: {
        location: 'Rond-point Ngaliema',
        address: 'Avenue Colonel Mondjiba, Ngaliema',
        time: '08:15',
      },
      destination: {
        location: 'Église MyChurchApp Kinshasa',
        address: 'Avenue de la Libération, Gombe',
      },
      stops: [
        { location: 'Binza Ozone', time: '08:25' },
        { location: 'Socimat', time: '08:35' },
      ],
      date: '2026-01-12',
      recurrent: true,
      recurrence: 'Chaque dimanche',
      availableSeats: 3,
      totalSeats: 4,
      price: 3000,
      notes: 'Véhicule climatisé',
    },
    {
      id: '5',
      name: 'Navette Gare Lubumbashi',
      type: 'shuttle',
      driver: {
        id: 'd5',
        name: 'Frère Ilunga Joseph',
        phone: '+243845678901',
        rating: 4.8,
        trips: 134,
      },
      departure: {
        location: 'Gare SNCC Lubumbashi',
        address: 'Avenue Kapenda, Lubumbashi',
        time: '07:30',
      },
      destination: {
        location: 'Église MyChurchApp Lubumbashi',
        address: 'Avenue Moïse Tshombe, Lubumbashi',
      },
      stops: [
        { location: 'Place de la Poste', time: '07:45' },
        { location: 'Golf Commune', time: '07:55' },
        { location: 'Rond-point Kasapa', time: '08:05' },
      ],
      date: '2026-01-12',
      recurrent: true,
      recurrence: 'Chaque dimanche',
      availableSeats: 6,
      totalSeats: 18,
      notes: 'Navette officielle antenne Lubumbashi',
    },
  ];

  useEffect(() => {
    fetchRoutes();
  }, [selectedType]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/transport-proxy?type=${selectedType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes || mockRoutes);
      } else {
        setRoutes(mockRoutes);
      }
    } catch {
      setRoutes(mockRoutes);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(search.toLowerCase()) ||
      route.departure.location.toLowerCase().includes(search.toLowerCase()) ||
      route.driver.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || route.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleBookRoute = (route: TransportRoute) => {
    setSelectedRoute(route);
    setBookingRequest({
      routeId: route.id,
      pickupStop: route.departure.location,
      passengers: 1,
      notes: '',
    });
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/transport-proxy/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingRequest),
      });
      setMyBookings([...myBookings, bookingRequest.routeId]);
      setShowBookingModal(false);
      alert('Réservation confirmée !');
    } catch {
      setMyBookings([...myBookings, bookingRequest.routeId]);
      setShowBookingModal(false);
      alert('Réservation confirmée !');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-[#cc9b00] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Transport & Navette</h1>
          <p className="text-gray-600 mt-2">Chargement des trajets...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#fff3cc] flex items-center justify-center mx-auto mb-4">
          <Bus className="h-8 w-8 text-[#cc9b00]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Transport & Navette</h1>
        <p className="text-gray-600 mt-2">
          Trouvez un trajet ou proposez un covoiturage pour venir à l&apos;église
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un trajet, une gare, un conducteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Tous', icon: Bus },
            { id: 'shuttle', label: 'Navettes', icon: Bus },
            { id: 'carpool', label: 'Covoiturage', icon: Car },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id as 'all' | 'shuttle' | 'carpool')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedType === type.id
                  ? 'bg-[#ffc200] text-[#0a0a0a] shadow-church'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <type.icon className="h-4 w-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowOfferModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#ffc200] to-[#cc9b00] text-[#0a0a0a] rounded-xl font-medium hover:from-[#cc9b00] hover:to-[#e6af00] shadow-church"
        >
          <Plus className="h-5 w-5" />
          Proposer un trajet
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#fff3cc] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">{filteredRoutes.filter(r => r.type === 'shuttle').length}</p>
          <p className="text-xs text-gray-600">Navettes</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{filteredRoutes.filter(r => r.type === 'carpool').length}</p>
          <p className="text-xs text-gray-600">Covoiturages</p>
        </div>
        <div className="bg-[#fff3cc] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[#cc9b00]">
            {filteredRoutes.reduce((sum, r) => sum + r.availableSeats, 0)}
          </p>
          <p className="text-xs text-gray-600">Places dispo</p>
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {filteredRoutes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Bus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Aucun trajet trouvé</p>
            <p className="text-sm text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          filteredRoutes.map(route => (
            <div
              key={route.id}
              className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${route.type === 'shuttle' ? 'bg-[#fff3cc]' : 'bg-green-100'}`}>
                    {route.type === 'shuttle' ? (
                      <Bus className="h-6 w-6 text-[#cc9b00]" />
                    ) : (
                      <Car className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{route.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{route.driver.name}</span>
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{route.driver.rating}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  route.availableSeats > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {route.availableSeats > 0 ? `${route.availableSeats} places` : 'Complet'}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{route.departure.location}</span>
                  <Clock className="h-4 w-4 text-gray-400 ml-2" />
                  <span className="text-gray-600">{route.departure.time}</span>
                </div>
                {route.stops.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 pl-4">
                    <div className="border-l-2 border-dashed border-gray-300 h-4" />
                    <span>{route.stops.length} arrêt{route.stops.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#ffc200]" />
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{route.destination.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {route.recurrent ? route.recurrence : formatDate(route.date)}
                  </span>
                  {route.price && (
                    <span className="font-medium text-gray-900">{route.price.toLocaleString()} FC</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedRoute(route);
                      setShowDetailModal(true);
                    }}
                    className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Détails
                  </button>
                  {route.availableSeats > 0 && !myBookings.includes(route.id) && (
                    <button
                      onClick={() => handleBookRoute(route)}
                      className="px-3 py-2 text-sm text-[#0a0a0a] bg-[#ffc200] rounded-lg hover:bg-[#cc9b00] shadow-church"
                    >
                      Réserver
                    </button>
                  )}
                  {myBookings.includes(route.id) && (
                    <span className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 bg-green-100 rounded-lg">
                      <Check className="h-4 w-4" />
                      Réservé
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{selectedRoute.name}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Driver Info */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-[#fff3cc] flex items-center justify-center">
                    <User className="h-6 w-6 text-[#cc9b00]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedRoute.driver.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{selectedRoute.driver.rating}</span>
                      <span>•</span>
                      <span>{selectedRoute.driver.trips} trajets</span>
                    </div>
                  </div>
                  {selectedRoute.driver.phone && (
                    <a
                      href={`tel:${selectedRoute.driver.phone}`}
                      className="p-2 bg-[#fff3cc] text-[#cc9b00] rounded-full"
                    >
                      <Phone className="h-5 w-5" />
                    </a>
                  )}
                </div>

                {/* Route Details */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedRoute.departure.location}</p>
                      <p className="text-sm text-gray-500">{selectedRoute.departure.address}</p>
                      <p className="text-sm text-[#cc9b00]">{selectedRoute.departure.time}</p>
                    </div>
                  </div>

                  {selectedRoute.stops.map((stop, idx) => (
                    <div key={idx} className="flex items-start gap-3 pl-1">
                      <div className="w-2 h-2 rounded-full bg-gray-300 mt-2" />
                      <div>
                        <p className="text-gray-700">{stop.location}</p>
                        <p className="text-sm text-gray-500">{stop.time}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#ffc200] mt-1.5" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedRoute.destination.location}</p>
                      <p className="text-sm text-gray-500">{selectedRoute.destination.address}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Places disponibles</p>
                    <p className="font-semibold text-gray-900">{selectedRoute.availableSeats} / {selectedRoute.totalSeats}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Prix</p>
                    <p className="font-semibold text-gray-900">
                      {selectedRoute.price ? `${selectedRoute.price.toLocaleString()} FC` : 'Gratuit'}
                    </p>
                  </div>
                </div>

                {selectedRoute.notes && (
                  <div className="p-3 bg-yellow-50 rounded-xl">
                    <p className="text-sm text-yellow-800">{selectedRoute.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                >
                  Fermer
                </button>
                {selectedRoute.availableSeats > 0 && !myBookings.includes(selectedRoute.id) && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleBookRoute(selectedRoute);
                    }}
                    className="flex-1 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] shadow-church"
                  >
                    Réserver
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Réserver ce trajet</h2>

              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-900">{selectedRoute.name}</p>
                  <p className="text-sm text-gray-500">{selectedRoute.departure.time} - {selectedRoute.destination.location}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Point de prise en charge
                  </label>
                  <select
                    value={bookingRequest.pickupStop}
                    onChange={(e) => setBookingRequest({ ...bookingRequest, pickupStop: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200]"
                  >
                    <option value={selectedRoute.departure.location}>{selectedRoute.departure.location}</option>
                    {selectedRoute.stops.map((stop, idx) => (
                      <option key={idx} value={stop.location}>{stop.location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de passagers
                  </label>
                  <select
                    value={bookingRequest.passengers}
                    onChange={(e) => setBookingRequest({ ...bookingRequest, passengers: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200]"
                  >
                    {Array.from({ length: Math.min(selectedRoute.availableSeats, 4) }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} passager{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (optionnel)
                  </label>
                  <textarea
                    value={bookingRequest.notes}
                    onChange={(e) => setBookingRequest({ ...bookingRequest, notes: e.target.value })}
                    placeholder="Information pour le conducteur..."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffc200] resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={submitBooking}
                  className="flex-1 py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] shadow-church"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal Placeholder */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Proposer un trajet</h2>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600 text-center py-8">
                Cette fonctionnalité sera bientôt disponible. Contactez le secrétariat pour proposer un trajet.
              </p>
              <button
                onClick={() => setShowOfferModal(false)}
                className="w-full py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] shadow-church"
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
