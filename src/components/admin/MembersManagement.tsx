import { Search, User, Mail, Phone, Trash2, Plus, X, Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  membershipDate: string;
  membershipNumber?: string;
}

const roles = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'PASTOR', label: 'Pasteur' },
  { value: 'OUVRIER', label: 'Ouvrier' },
  { value: 'FIDELE', label: 'Fidèle' }
]

export default function MembersManagement() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'FIDELE' as string,
    password: '',
    address: '',
    profession: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await authenticatedFetch('/api/admin/users')
      
      const data = await response.json()
      if (response.ok) {
        setMembers(data.users || data.data || [])
      } else {
        console.error('Erreur chargement membres:', response.status, data)
        setMembers([])
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdateLoading(userId)
    try {
      const response = await authenticatedFetch('/api/admin/users/manage', {
        method: 'PATCH',
        body: JSON.stringify({
          userId,
          role: newRole
        })
      })

      if (response.ok) {
        await fetchMembers()
        alert('Rôle mis à jour avec succès')
      } else {
        const errorData = await response.json()
        alert(`Erreur: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la mise à jour du rôle')
    } finally {
      setUpdateLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${userName}? Cette action est irréversible.`)) {
      return
    }

    setUpdateLoading(userId)
    try {
      const response = await authenticatedFetch('/api/admin/users/manage', {
        method: 'DELETE',
        body: JSON.stringify({
          userId
        })
      })

      if (response.ok) {
        // Refresh members list
        await fetchMembers()
        alert('Utilisateur supprimé avec succès')
      } else {
        const errorData = await response.json()
        alert(`Erreur: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression de l\'utilisateur')
    } finally {
      setUpdateLoading(null)
    }
  }

  const handleAddMember = async () => {
    // Validation côté client
    if (!newMember.firstName.trim() || !newMember.lastName.trim() || !newMember.email.trim() || !newMember.password.trim()) {
      alert('Veuillez remplir tous les champs obligatoires (prénom, nom, email, mot de passe)')
      return
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newMember.email)) {
      alert('Veuillez saisir un email valide')
      return
    }

    // Validation mot de passe
    if (newMember.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setAddLoading(true)
    try {
      const response = await authenticatedFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          ...newMember,
          maritalStatus: 'SINGLE'
        })
      })

      if (response.ok) {
        const responseData = await response.json()
        // Reset form and close modal
        setNewMember({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'FIDELE',
          password: '',
          address: '',
          profession: ''
        })
        setShowAddModal(false)
        // Refresh members list
        await fetchMembers()
        alert(`✅ Membre ${responseData.user?.firstName || ''} ${responseData.user?.lastName || ''} ajouté avec succès !`)
      } else {
        const errorData = await response.json()
        console.error('Erreur serveur:', errorData)
        alert(`❌ Erreur: ${errorData.error || 'Impossible d\'ajouter le membre'}`)
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      alert('❌ Erreur de connexion lors de l\'ajout du membre')
    } finally {
      setAddLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ffc200]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des membres</h1>
          <p className="text-gray-600">{members.length} membres au total</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#ffc200] text-white px-4 py-2 rounded-lg hover:bg-[#cc9b00] flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un membre</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select className="p-2 border border-gray-300 rounded-lg">
            <option>Tous les statuts</option>
            <option>Actif</option>
            <option>Inactif</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Membre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date d&apos;adhésion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#fff3cc] rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-[#cc9b00]" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{member.membershipNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{member.email}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{member.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      disabled={updateLoading === member.id}
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        member.role === 'ADMIN' 
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : member.role === 'PASTOR'
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : member.role === 'OUVRIER'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-[#fff3cc] text-[#3d3200] border-[#e6af00]'
                      } ${updateLoading === member.id ? 'opacity-50' : 'hover:bg-gray-50'}`}
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.membershipDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDeleteUser(member.id, `${member.firstName} ${member.lastName}`)}
                      disabled={updateLoading === member.id}
                      className={`text-red-600 hover:text-red-800 p-1 rounded ${
                        updateLoading === member.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50'
                      }`}
                      title="Supprimer l'utilisateur"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout de membre */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Ajouter un nouveau membre</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleAddMember(); }} className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4 bg-[#fffefa] p-3 rounded-lg border border-[#e6af00]">
                    <span className="font-medium text-[#3d3200]">ℹ️ Information :</span> Les champs marqués d'un astérisque (*) sont obligatoires.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMember.firstName}
                      onChange={(e) => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] ${
                        !newMember.firstName.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Saisir le prénom"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMember.lastName}
                      onChange={(e) => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] ${
                        !newMember.lastName.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Saisir le nom de famille"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] ${
                        !newMember.email.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="email@exemple.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={newMember.phone}
                      onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
                      placeholder="+243 81 234 56 78"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newMember.password}
                        onChange={(e) => setNewMember(prev => ({ ...prev, password: e.target.value }))}
                        className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200] ${
                          !newMember.password.trim() || newMember.password.length < 6 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Minimum 6 caractères"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {newMember.password.length > 0 && newMember.password.length < 6 && (
                      <p className="text-xs text-red-600 mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle
                    </label>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={newMember.address}
                    onChange={(e) => setNewMember(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
                    placeholder="Adresse complète (optionnel)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profession
                  </label>
                  <input
                    type="text"
                    value={newMember.profession}
                    onChange={(e) => setNewMember(prev => ({ ...prev, profession: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffc200] focus:border-[#ffc200]"
                    placeholder="Profession (optionnel)"
                  />
                </div>
              </form>
            </div>

            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  setNewMember({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    role: 'FIDELE',
                    password: '',
                    address: '',
                    profession: ''
                  })
                }}
                className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddMember}
                disabled={addLoading || !newMember.firstName || !newMember.lastName || !newMember.email || !newMember.password}
                className="px-6 py-2 bg-[#ffc200] text-white rounded-lg hover:bg-[#cc9b00] disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
              >
                {addLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Ajout en cours...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Ajouter le membre</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

