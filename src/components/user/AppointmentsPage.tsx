'use client';

import { useState, useEffect } from 'react';
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
        credentials: 'include'
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
        credentials: 'include'
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
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchAppointments();
        setShowNewForm(false);
        setFormData({ pastorId: '', appointmentDate: '', appointmentTime: '', reason: '' });
      }
    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ appointmentId, status: 'CANCELLED' })
      });

      if (response.ok) {
        await fetchAppointments();
      }
    } catch (error) {
      console.error('Erreur annulation rendez-vous:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmé';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulé';
      case 'COMPLETED': return 'Terminé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Rendez-vous pastoraux</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Rendez-vous pastoraux</h1>
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau rendez-vous</span>
        </button>
      </div>

      {/* Modal de création */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Nouveau rendez-vous</h2>
              <button
                onClick={() => setShowNewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pasteur
                </label>
                <select
                  value={formData.pastorId}
                  onChange={(e) => setFormData({ ...formData, pastorId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Sélectionner un pasteur</option>
                  {pastors.map((pastor) => (
                    <option key={pastor.id} value={pastor.id}>
                      {pastor.firstName} {pastor.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure
                </label>
                <input
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif du rendez-vous
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Décrivez brièvement le motif de votre demande..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={createAppointment}
                disabled={!formData.pastorId || !formData.appointmentDate || !formData.appointmentTime}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des rendez-vous */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous</h3>
            <p className="text-gray-500 mb-4">Vous n'avez pas encore de rendez-vous programmés.</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Programmer un rendez-vous
            </button>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">
                      {appointment.pastor.firstName} {appointment.pastor.lastName}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(appointment.appointmentDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.startTime} - {appointment.endTime}</span>
                    </div>
                  </div>

                  {appointment.reason && (
                    <p className="text-gray-700 mb-3">{appointment.reason}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {appointment.pastor.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{appointment.pastor.email}</span>
                      </div>
                    )}
                    {appointment.pastor.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{appointment.pastor.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {appointment.status === 'PENDING' && (
                  <button
                    onClick={() => cancelAppointment(appointment.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Annuler le rendez-vous"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}