/**
 * UrgentAlertsPage - Alertes urgentes
 * Affiche les alertes critiques et urgentes de l'église
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Bell,
  BellRing,
  X,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Users,
  Shield,
  Heart,
  Home,
  AlertOctagon,
  Volume2,
  VolumeX
} from 'lucide-react';

interface UrgentAlert {
  id: string;
  type: 'emergency' | 'critical' | 'warning' | 'info';
  category: 'health' | 'safety' | 'weather' | 'church' | 'community' | 'prayer';
  title: string;
  message: string;
  details?: string;
  instructions?: string[];
  contacts?: Array<{ name: string; phone: string; role: string }>;
  location?: string;
  affectedAreas?: string[];
  isActive: boolean;
  isAcknowledged: boolean;
  priority: number;
  createdAt: string;
  expiresAt?: string;
  updatedAt?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com';

export default function UrgentAlertsPage() {
  const [alerts, setAlerts] = useState<UrgentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<UrgentAlert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchAlerts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alerts-proxy', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      } else {
        console.warn('[Alerts] Backend indisponible');
        setAlerts([]);
      }
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Polling pour les nouvelles alertes
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'emergency':
        return {
          icon: AlertOctagon,
          color: 'bg-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-700',
          label: 'URGENCE'
        };
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'bg-orange-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-700',
          label: 'CRITIQUE'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-700',
          label: 'ATTENTION'
        };
      default:
        return {
          icon: Info,
          color: 'bg-[#ffc200]',
          bgColor: 'bg-[#fff3cc]',
          borderColor: 'border-[#ffc200]',
          textColor: 'text-[#cc9b00]',
          label: 'INFO'
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return Heart;
      case 'safety': return Shield;
      case 'weather': return AlertTriangle;
      case 'church': return Home;
      case 'community': return Users;
      case 'prayer': return Heart;
      default: return Bell;
    }
  };

  const acknowledgeAlert = async (id: string) => {
    setAlerts(alerts.map(a => 
      a.id === id ? { ...a, isAcknowledged: true } : a
    ));
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/alerts/${id}/acknowledge`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeAlerts = alerts.filter(a => a.isActive);
  const emergencyCount = activeAlerts.filter(a => a.type === 'emergency').length;

  const filteredAlerts = filter === 'all' 
    ? activeAlerts 
    : activeAlerts.filter(a => a.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BellRing className="h-6 w-6 text-red-500" />
            Alertes urgentes
            {emergencyCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-sm rounded-full animate-pulse">
                {emergencyCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600">Informations importantes de l'église</p>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-full transition-colors ${
            soundEnabled ? 'bg-[#fff3cc] text-[#cc9b00]' : 'bg-gray-100 text-gray-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {[
          { id: 'all', label: 'Toutes', count: activeAlerts.length },
          { id: 'emergency', label: 'Urgences', count: activeAlerts.filter(a => a.type === 'emergency').length },
          { id: 'critical', label: 'Critiques', count: activeAlerts.filter(a => a.type === 'critical').length },
          { id: 'warning', label: 'Attention', count: activeAlerts.filter(a => a.type === 'warning').length },
          { id: 'info', label: 'Info', count: activeAlerts.filter(a => a.type === 'info').length },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-4">
          {filteredAlerts.sort((a, b) => a.priority - b.priority).map(alert => {
            const config = getTypeConfig(alert.type);
            const CategoryIcon = getCategoryIcon(alert.category);
            const TypeIcon = config.icon;
            
            return (
              <div
                key={alert.id}
                className={`rounded-xl overflow-hidden border-l-4 ${config.borderColor} ${config.bgColor} shadow-sm`}
              >
                {/* Alert Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 ${config.color} text-white text-xs font-bold rounded`}>
                        {config.label}
                      </span>
                      {!alert.isAcknowledged && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(alert.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${config.color} text-white`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${config.textColor} mb-1`}>{alert.title}</h3>
                      <p className="text-gray-700">{alert.message}</p>
                      
                      {alert.location && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {alert.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    {!alert.isAcknowledged ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Accusé réception
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Vu
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="flex items-center gap-1 text-sm text-[#cc9b00] hover:text-[#e6af00]"
                    >
                      Détails
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 mx-auto text-green-300 mb-4" />
          <p className="text-gray-500 mb-2">Aucune alerte active</p>
          <p className="text-gray-400 text-sm">Tout va bien !</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className={`sticky top-0 p-4 ${getTypeConfig(selectedAlert.type).bgColor} border-b flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 ${getTypeConfig(selectedAlert.type).color} text-white text-xs font-bold rounded`}>
                  {getTypeConfig(selectedAlert.type).label}
                </span>
                <h2 className={`font-bold ${getTypeConfig(selectedAlert.type).textColor}`}>
                  {selectedAlert.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-2 hover:bg-white/50 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <p className="text-gray-700">{selectedAlert.message}</p>
                {selectedAlert.details && (
                  <p className="text-gray-600 mt-2">{selectedAlert.details}</p>
                )}
              </div>

              {selectedAlert.instructions && selectedAlert.instructions.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
                  <ul className="space-y-2">
                    {selectedAlert.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="w-5 h-5 bg-[#fff3cc] text-[#cc9b00] rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedAlert.contacts && selectedAlert.contacts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contacts</h4>
                  <div className="space-y-2">
                    {selectedAlert.contacts.map((contact, idx) => (
                      <a
                        key={idx}
                        href={`tel:${contact.phone}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.role}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[#cc9b00]">
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedAlert.location && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{selectedAlert.location}</span>
                </div>
              )}

              {selectedAlert.expiresAt && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl text-yellow-700">
                  <Clock className="h-5 w-5" />
                  <span>Expire le {formatDate(selectedAlert.expiresAt)}</span>
                </div>
              )}

              {!selectedAlert.isAcknowledged && (
                <button
                  onClick={() => {
                    acknowledgeAlert(selectedAlert.id);
                    setSelectedAlert({ ...selectedAlert, isAcknowledged: true });
                  }}
                  className="w-full py-3 bg-[#ffc200] text-[#0a0a0a] rounded-xl font-medium hover:bg-[#cc9b00] shadow-church"
                >
                  <CheckCircle className="h-5 w-5 inline mr-2" />
                  Accusé réception
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
