'use client'

import { User, Mail, Phone, MapPin, Calendar, CreditCard, Shield } from 'lucide-react'

export default function ProfilePage({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-[#fffefa]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#ffc200] via-[#ffda66] to-[#fff3cc]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="h-10 w-10 text-[#0a0a0a]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0a0a0a] mb-1">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-[#0a0a0a]/70 text-sm">Membre actif</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations personnelles */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-church border border-[rgba(201,201,201,0.3)]">
            <h2 className="font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-[#cc9b00]" />
              Informations personnelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#999] mb-1">Prenom</label>
                <p className="p-3 bg-[#fffefa] rounded-lg border border-[rgba(201,201,201,0.2)] text-[#0a0a0a]">
                  {user.firstName || '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#999] mb-1">Nom</label>
                <p className="p-3 bg-[#fffefa] rounded-lg border border-[rgba(201,201,201,0.2)] text-[#0a0a0a]">
                  {user.lastName || '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#999] mb-1 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="p-3 bg-[#fffefa] rounded-lg border border-[rgba(201,201,201,0.2)] text-[#0a0a0a]">
                  {user.email || '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#999] mb-1 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Telephone
                </label>
                <p className="p-3 bg-[#fffefa] rounded-lg border border-[rgba(201,201,201,0.2)] text-[#0a0a0a]">
                  {user.phone || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Carte de membre */}
          <div className="bg-gradient-to-br from-[#ffc200] via-[#ffda66] to-[#fff3cc] rounded-xl p-5 shadow-church">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-white/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-[#0a0a0a]" />
              </div>
              <p className="text-sm text-[#0a0a0a]/70">Carte de membre numerique</p>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-[#0a0a0a]">{user.firstName} {user.lastName}</h3>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/30 rounded-full mt-2">
                <Shield className="h-3 w-3 text-[#0a0a0a]" />
                <span className="text-xs font-medium text-[#0a0a0a]">Membre actif</span>
              </div>
            </div>

            <div className="flex justify-between text-sm bg-white/20 rounded-lg p-3">
              <div>
                <p className="text-[#0a0a0a]/70 text-xs">N membre</p>
                <p className="font-mono text-[#0a0a0a] font-medium">{user.membershipNumber || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-[#0a0a0a]/70 text-xs">Membre depuis</p>
                <p className="text-[#0a0a0a] font-medium">{user.membershipDate || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}