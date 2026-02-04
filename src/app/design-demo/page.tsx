'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  ChurchCard, 
  VerseCard, 
  AnnouncementCard 
} from '@/components/ui/ChurchCard'
import { ChurchTabs, Tab } from '@/components/ui/ChurchTabs'
import { 
  BottomNavigation, 
  ChurchHeader, 
  NotificationBell 
} from '@/components/ui/ChurchNavigation'
import { useState } from 'react'
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Heart, 
  User, 
  Bell, 
  Search, 
  Plus, 
  Star,
  MessageCircle,
  Music,
  Gift
} from 'lucide-react'

export default function DesignDemoPage() {
  const [activeTab, setActiveTab] = useState('tab1')

  const tabItems: Tab[] = [
    { id: 'tab1', label: 'Tout' },
    { id: 'tab2', label: 'Prédications' },
    { id: 'tab3', label: 'Louanges' },
    { id: 'tab4', label: 'Études' },
  ]

  return (
    <div className="min-h-screen bg-church-bg">
      {/* Header */}
      <ChurchHeader 
        title="MyChurchApp"
        showBack={false}
        rightActions={
          <div className="flex items-center gap-2">
            <NotificationBell count={3} onClick={() => alert('Notifications')} />
            <button className="p-2">
              <Search size={20} className="text-church-text" />
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="pb-20 pt-16 px-4 max-w-4xl mx-auto">
        
        {/* Section: Couleurs */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-church-text mb-4">🎨 Palette de couleurs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg p-4 bg-church-primary text-center">
              <span className="text-black font-medium">Primary</span>
              <p className="text-xs text-black/70">#ffc200</p>
            </div>
            <div className="rounded-lg p-4 bg-church-light text-center">
              <span className="text-black font-medium">Light</span>
              <p className="text-xs text-black/70">#ffda66</p>
            </div>
            <div className="rounded-lg p-4 bg-church-secondary text-center">
              <span className="text-white font-medium">Secondary</span>
              <p className="text-xs text-white/70">#cc9b00</p>
            </div>
            <div className="rounded-lg p-4 bg-church-muted text-center border border-church-border">
              <span className="text-church-text font-medium">Muted</span>
              <p className="text-xs text-church-text-muted">#fff3cc</p>
            </div>
          </div>
        </section>

        {/* Section: Boutons */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-church-text mb-4">🔘 Boutons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="church">Primaire</Button>
            <Button variant="church-secondary">Secondaire</Button>
            <Button variant="church-outline">Outline</Button>
            <Button variant="church" disabled>Désactivé</Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button variant="church" size="sm">Petit</Button>
            <Button variant="church" size="default">Normal</Button>
            <Button variant="church" size="lg">Grand</Button>
            <Button variant="church" size="icon"><Plus size={20} /></Button>
          </div>
        </section>

        {/* Section: Badges */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-church-text mb-4">🏷️ Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="church">Church</Badge>
            <Badge variant="church-success">Church Success</Badge>
            <Badge variant="success">Succès</Badge>
            <Badge variant="warning">Avertissement</Badge>
            <Badge variant="default">Par défaut</Badge>
            <Badge variant="secondary">Secondaire</Badge>
            <Badge variant="destructive">Destructif</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Section: Inputs */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-church-text mb-4">✏️ Champs de saisie</h2>
          <div className="space-y-3 max-w-md">
            <Input variant="church" placeholder="Rechercher..." />
            <Input variant="church" placeholder="Email" type="email" />
            <Input variant="default" placeholder="Style par défaut" />
          </div>
        </section>

        {/* Section: Tabs */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-church-text mb-4">📑 Onglets</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-church-text-muted mb-2">Style Pills</p>
              <ChurchTabs 
                tabs={tabItems} 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                variant="pills"
              />
            </div>
            <div>
              <p className="text-sm text-church-text-muted mb-2">Style Underline</p>
              <ChurchTabs 
                tabs={tabItems} 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                variant="underline"
              />
            </div>
            <div>
              <p className="text-sm text-church-text-muted mb-2">Style Default</p>
              <ChurchTabs 
                tabs={tabItems} 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                variant="default"
              />
            </div>
          </div>
        </section>

        {/* Section: Cards */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-church-text mb-4">🃏 Cartes</h2>
          
          {/* Verse Card */}
          <div className="mb-4">
            <p className="text-sm text-church-text-muted mb-2">Verset du jour</p>
            <VerseCard 
              text="Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle."
              reference="Jean 3:16"
              onShare={() => alert('Partager')}
              onLike={() => alert('J\'aime')}
            />
          </div>

          {/* Announcement Card */}
          <div className="mb-4">
            <p className="text-sm text-church-text-muted mb-2">Annonce</p>
            <AnnouncementCard 
              title="Culte de dimanche"
              text="Rejoignez-nous ce dimanche pour un moment de louange et d'adoration. Service à 9h30."
              isUrgent={true}
              actions={[
                { label: 'Voir détails', onClick: () => alert('Détails'), variant: 'primary' }
              ]}
            />
          </div>

          {/* Church Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ChurchCard variant="default">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-church-muted flex items-center justify-center">
                  <Music className="text-church-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-church-text">Louanges</h3>
                  <p className="text-sm text-church-text-muted">25 chants disponibles</p>
                </div>
              </div>
            </ChurchCard>

            <ChurchCard variant="accent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-church-primary/20 flex items-center justify-center">
                  <Gift className="text-church-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-church-text">Dons</h3>
                  <p className="text-sm text-church-text-muted">Faire un don</p>
                </div>
              </div>
            </ChurchCard>
          </div>

          {/* Standard Card Variants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Card Default</CardTitle>
                <CardDescription>Carte avec le style par défaut</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-church-text-muted">Contenu de la carte avec les nouvelles couleurs du design system.</p>
              </CardContent>
            </Card>

            <Card variant="accent">
              <CardHeader>
                <CardTitle>Card Accent</CardTitle>
                <CardDescription>Carte avec bordure dorée</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-church-text-muted">Utilisée pour mettre en valeur un élément important.</p>
              </CardContent>
            </Card>

            <Card variant="highlight">
              <CardHeader>
                <CardTitle>Card Highlight</CardTitle>
                <CardDescription>Fond doré léger</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-church-text-muted">Idéale pour les notifications ou les points importants.</p>
              </CardContent>
            </Card>

            <Card variant="outline">
              <CardHeader>
                <CardTitle>Card Outline</CardTitle>
                <CardDescription>Simple bordure</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-church-text-muted">Style minimaliste avec bordure légère.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section: Quick Actions Grid */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-church-text mb-4">⚡ Actions rapides</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: <BookOpen size={24} />, label: 'Bible' },
              { icon: <Music size={24} />, label: 'Louanges' },
              { icon: <Heart size={24} />, label: 'Prière' },
              { icon: <Calendar size={24} />, label: 'Événements' },
              { icon: <MessageCircle size={24} />, label: 'Chat' },
              { icon: <Gift size={24} />, label: 'Dons' },
              { icon: <Star size={24} />, label: 'Favoris' },
              { icon: <Bell size={24} />, label: 'Alertes' },
            ].map((item, index) => (
              <button 
                key={index}
                className="church-card p-4 flex flex-col items-center gap-2 hover:bg-church-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-church-muted flex items-center justify-center text-church-secondary">
                  {item.icon}
                </div>
                <span className="text-xs text-church-text font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Section: Typography */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-church-text mb-4">📝 Typographie</h2>
          <ChurchCard>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-church-text">Titre H1</h1>
              <h2 className="text-2xl font-bold text-church-text">Titre H2</h2>
              <h3 className="text-xl font-semibold text-church-text">Titre H3</h3>
              <h4 className="text-lg font-semibold text-church-text">Titre H4</h4>
              <p className="text-base text-church-text">Texte normal - Lorem ipsum dolor sit amet</p>
              <p className="text-sm text-church-text-muted">Texte secondaire - Description ou information complémentaire</p>
              <p className="text-xs text-church-text-muted">Petit texte - Dates, métadonnées</p>
            </div>
          </ChurchCard>
        </section>

        {/* Section: Spacing Example */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-church-text mb-4">📐 Box Shadow & Border Radius</h2>
          <div className="flex flex-wrap gap-4">
            <div className="w-24 h-24 bg-white shadow-church rounded-md flex items-center justify-center">
              <span className="text-xs text-church-text-muted text-center">Shadow<br/>Church</span>
            </div>
            <div className="w-24 h-24 bg-white border border-church-border rounded-md flex items-center justify-center">
              <span className="text-xs text-church-text-muted text-center">Border<br/>Church</span>
            </div>
            <div className="w-24 h-24 bg-church-primary rounded-md flex items-center justify-center">
              <span className="text-xs text-black text-center">Rounded<br/>MD</span>
            </div>
            <div className="w-24 h-24 bg-church-primary rounded-full flex items-center justify-center">
              <span className="text-xs text-black text-center">Rounded<br/>Full</span>
            </div>
          </div>
        </section>

      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeItem="home"
      />
    </div>
  )
}
