'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Trash2, Send, Users, UserCheck, Bell, Calendar, Plus, Edit, Save, X } from 'lucide-react'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface NotificationTemplate {
  id: string
  name: string
  title: string
  message: string
  type: string
  isActive: boolean
  createdAt: string
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  userId: string
  isRead: boolean
  createdAt: string
  user: {
    firstName: string
    lastName: string
  }
}

export default function NotificationsManagement() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'history'>('send')

  // Formulaire d'envoi
  const [sendForm, setSendForm] = useState({
    title: '',
    message: '',
    type: 'general',
    targetType: 'all', // all, role, specific
    targetRole: '',
    targetUsers: [] as string[]
  })

  // Formulaire de template
  const [templateForm, setTemplateForm] = useState({
    id: '',
    name: '',
    title: '',
    message: '',
    type: 'general',
    isActive: true
  })

  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
    loadNotifications()
    loadUsers()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/notifications/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/notifications/history')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || data.data || [])
      } else {
        console.log('Impossible de charger les utilisateurs, status:', response.status)
        setUsers([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      setUsers([])
    }
  }

  const handleSendNotification = async () => {
    if (!sendForm.title || !sendForm.message) {
      alert('Veuillez remplir le titre et le message')
      return
    }

    setLoading(true)
    try {
      const response = await authenticatedFetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendForm)
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Notification envoyée avec succès à ${data.sentCount} utilisateur(s)`)
        setSendForm({
          title: '',
          message: '',
          type: 'general',
          targetType: 'all',
          targetRole: '',
          targetUsers: []
        })
        loadNotifications()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error)
      alert('Erreur lors de l\'envoi de la notification')
    }
    setLoading(false)
  }

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.title || !templateForm.message) {
      alert('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    try {
      const url = editingTemplate 
        ? `/api/admin/notifications/templates/${editingTemplate}`
        : '/api/admin/notifications/templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      })

      if (response.ok) {
        alert(editingTemplate ? 'Template modifié' : 'Template créé')
        setTemplateForm({
          id: '',
          name: '',
          title: '',
          message: '',
          type: 'general',
          isActive: true
        })
        setEditingTemplate(null)
        loadTemplates()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    }
    setLoading(false)
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return

    try {
      const response = await authenticatedFetch(`/api/admin/notifications/templates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Template supprimé')
        loadTemplates()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleUseTemplate = (template: NotificationTemplate) => {
    setSendForm(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type
    }))
    setActiveTab('send')
  }

  const handleEditTemplate = (template: NotificationTemplate) => {
    setTemplateForm({
      id: template.id,
      name: template.name,
      title: template.title,
      message: template.message,
      type: template.type,
      isActive: template.isActive
    })
    setEditingTemplate(template.id)
  }

  const handleCheckBirthdays = async () => {
    setLoading(true)
    try {
      const response = await authenticatedFetch('/api/admin/notifications/auto')
      if (response.ok) {
        const data = await response.json()
        alert(`${data.birthdaysToday} anniversaire(s) aujourd'hui. ${data.notificationsSent} notification(s) envoyée(s)`)
        loadNotifications()
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des anniversaires:', error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Notifications</h2>
        <Button 
          onClick={handleCheckBirthdays}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Vérifier Anniversaires
        </Button>
      </div>

      {/* Onglets */}
      <div className="flex space-x-1 border-b">
        <button
          onClick={() => setActiveTab('send')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'send' 
              ? 'bg-[#ffc200] text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Send className="w-4 h-4 inline mr-2" />
          Envoyer
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'templates' 
              ? 'bg-[#ffc200] text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Edit className="w-4 h-4 inline mr-2" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'history' 
              ? 'bg-[#ffc200] text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Historique
        </button>
      </div>

      {/* Onglet Envoyer */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Envoyer une Notification</CardTitle>
                <CardDescription>
                  Créez et envoyez une notification à vos utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={sendForm.title}
                    onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre de la notification"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={sendForm.message}
                    onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Contenu de la notification"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={sendForm.type}
                      onValueChange={(value) => setSendForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Général</SelectItem>
                        <SelectItem value="announcement">Annonce</SelectItem>
                        <SelectItem value="event">Événement</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetType">Destinataires</Label>
                    <Select
                      value={sendForm.targetType}
                      onValueChange={(value) => setSendForm(prev => ({ ...prev, targetType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les utilisateurs</SelectItem>
                        <SelectItem value="role">Par rôle</SelectItem>
                        <SelectItem value="specific">Utilisateurs spécifiques</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {sendForm.targetType === 'role' && (
                  <div>
                    <Label htmlFor="targetRole">Rôle cible</Label>
                    <Select
                      value={sendForm.targetRole}
                      onValueChange={(value) => setSendForm(prev => ({ ...prev, targetRole: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrateurs</SelectItem>
                        <SelectItem value="PASTEUR">Pasteurs</SelectItem>
                        <SelectItem value="PASTOR">Pastors</SelectItem>
                        <SelectItem value="MEMBER">Membres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  onClick={handleSendNotification}
                  disabled={loading}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Envoi...' : 'Envoyer la Notification'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Templates Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates.filter(t => t.isActive).map((template) => (
                    <div
                      key={template.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-600 truncate">{template.title}</div>
                      <Badge variant="outline" className="mt-1">
                        {template.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Onglet Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingTemplate ? 'Modifier le Template' : 'Créer un Template'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="templateName">Nom du Template</Label>
                <Input
                  id="templateName"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du template"
                />
              </div>

              <div>
                <Label htmlFor="templateTitle">Titre</Label>
                <Input
                  id="templateTitle"
                  value={templateForm.title}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la notification"
                />
              </div>

              <div>
                <Label htmlFor="templateMessage">Message</Label>
                <Textarea
                  id="templateMessage"
                  value={templateForm.message}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Contenu du template"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="templateType">Type</Label>
                <Select
                  value={templateForm.type}
                  onValueChange={(value) => setTemplateForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Général</SelectItem>
                    <SelectItem value="welcome">Bienvenue</SelectItem>
                    <SelectItem value="birthday">Anniversaire</SelectItem>
                    <SelectItem value="announcement">Annonce</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveTemplate}
                  disabled={loading}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingTemplate ? 'Modifier' : 'Créer'}
                </Button>
                {editingTemplate && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEditingTemplate(null)
                      setTemplateForm({
                        id: '',
                        name: '',
                        title: '',
                        message: '',
                        type: 'general',
                        isActive: true
                      })
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Templates Existants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-600">{template.title}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {template.message}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{template.type}</Badge>
                          <Badge variant={template.isActive ? "default" : "secondary"}>
                            {template.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglet Historique */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des Notifications</CardTitle>
            <CardDescription>
              Toutes les notifications envoyées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Pour: {notification.user.firstName} {notification.user.lastName}</span>
                        <Badge variant="outline">{notification.type}</Badge>
                        <Badge variant={notification.isRead ? "default" : "secondary"}>
                          {notification.isRead ? 'Lu' : 'Non lu'}
                        </Badge>
                        <span>{new Date(notification.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}