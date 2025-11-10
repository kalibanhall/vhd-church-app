'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Check, 
  AlertCircle, 
  X,
  Phone,
  Mail
} from 'lucide-react';

interface Pastor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  pastor: Pastor;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    pastorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchPastors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastors = async () => {
    try {
      const response = await fetch('/api/appointments/pastors', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPastors(data.pastors || []);
      }
    } catch (error) {
      console.error('Erreur chargement pasteurs:', error);
    }
  };

  const createAppointment = async () => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(prev => [...prev, data.appointment]);
        setShowNewForm(false);
        setFormData({ pastorId: '', appointmentDate: '', appointmentTime: '', reason: '' });
        
        // Créer une notification
        await createNotification(data.appointment);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
      alert('Erreur de connexion');
    }
  };

  const createNotification = async (appointment: any) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: '📅 Demande de rendez-vous envoyée',
          message: `Votre demande de rendez-vous avec ${appointment.pastor.firstName} ${appointment.pastor.lastName} a été envoyée. Vous recevrez une confirmation.`,
          type: 'appointment_reminder',
          actionUrl: '/appointments'
        })
      });
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) return;

    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId, action: 'cancel' })
      });

      if (response.ok) {
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId ? { ...apt, status: 'CANCELLED' } : apt
          )
        );
      }
    } catch (error) {
      console.error('Erreur annulation:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check size={12} className="mr-1" />
            Confirmé
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            En attente
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X size={12} className="mr-1" />
            Annulé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDateTime = (appointmentDate: string, startTime: string) => {
    const date = new Date(appointmentDate);
    const time = new Date(startTime);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rendez-vous avec les pasteurs</h1>
            <p className="text-gray-600 mt-2">Gérez vos rendez-vous spirituels</p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Nouveau rendez-vous
          </button>
        </div>
      </div>

      {/* Section: Mes rendez-vous */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes rendez-vous</h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun rendez-vous programmé</p>
            <p className="text-gray-400 mt-2">Cliquez sur "Nouveau rendez-vous" pour en créer un</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.appointmentDate, appointment.startTime);
              return (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar pasteur */}
                      <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {appointment.pastor.firstName[0]}{appointment.pastor.lastName[0]}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <User size={16} className="text-gray-500" />
                          <span className="font-semibold text-gray-900">
                            Pasteur {appointment.pastor.firstName} {appointment.pastor.lastName}
                          </span>
                          {getStatusBadge(appointment.status)}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{time}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mt-2">{appointment.reason}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {appointment.status === 'PENDING' && (
                        <button
                          onClick={() => cancelAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                          title="Annuler le rendez-vous"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal nouveau rendez-vous */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nouveau rendez-vous</h3>
              <button 
                onClick={() => setShowNewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pasteur
                </label>
                <select
                  value={formData.pastorId}
                  onChange={(e) => setFormData({ ...formData, pastorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un pasteur</option>
                  {pastors.map((pastor) => (
                    <option key={pastor.id} value={pastor.id}>
                      Pasteur {pastor.firstName} {pastor.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure
                </label>
                <input
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif du rendez-vous
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Entretien spirituel, conseil pastoral, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={createAppointment}
                disabled={!formData.pastorId || !formData.appointmentDate || !formData.appointmentTime}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer le rendez-vous
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}