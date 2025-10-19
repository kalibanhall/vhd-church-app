import { User, Sermon, Donation, Appointment, Prayer, Testimony, Event, AdminStats, ChatChannel, ChatMessage, OnlineStatus } from '../types'

export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Mukendi',
    email: 'jean.mukendi@gmail.com',
    phone: '+243 81 234 5678',
    role: 'member',
    membershipDate: '2020-01-15',
    status: 'active',
    profileImage: '/api/placeholder/100/100',
    membershipNumber: 'M-2020-001',
    birthDate: '1985-06-20',
    address: '123 Rue de la Paix, Kinshasa',
    maritalStatus: 'married',
    profession: 'Ingénieur'
  },
  {
    id: '2',
    firstName: 'Pasteur',
    lastName: 'Paul',
    email: 'pasteur.paul@eglise.org',
    phone: '+243 82 345 6789',
    role: 'pastor',
    membershipDate: '2015-05-20',
    status: 'active',
    membershipNumber: 'P-2015-001',
    address: 'Presbytère, My Church App',
    maritalStatus: 'married',
    profession: 'Pasteur'
  },
  {
    id: '3',
    firstName: 'Admin',
    lastName: 'Système',
    email: 'admin@eglise.org',
    phone: '+243 83 456 7890',
    role: 'admin',
    membershipDate: '2015-01-01',
    status: 'active',
    membershipNumber: 'A-2015-001',
    profession: 'Administrateur'
  }
]

export const mockSermons: Sermon[] = [
  {
    id: '1',
    title: 'La foi qui sauve',
    preacherId: '2',
    preacherName: 'Pasteur Paul',
    sermonDate: '2024-09-22',
    sermonType: 'video',
    durationMinutes: 45,
    videoUrl: 'https://youtube.com/embed/abc123',
    thumbnailUrl: '/api/placeholder/300/200',
    description: 'Un message puissant sur la foi qui peut déplacer les montagnes.',
    bibleVerses: 'Matthieu 17:20',
    downloadCount: 25,
    viewCount: 150,
    isPublished: true
  },
  {
    id: '2',
    title: 'Le pardon divin',
    preacherId: '2',
    preacherName: 'Pasteur Paul',
    sermonDate: '2024-09-15',
    sermonType: 'audio',
    durationMinutes: 38,
    audioUrl: 'https://audio.com/sermon2',
    description: 'Comprendre la puissance du pardon dans notre vie spirituelle.',
    bibleVerses: 'Matthieu 6:14-15',
    downloadCount: 18,
    viewCount: 120,
    isPublished: true
  }
]

export const mockDonations: Donation[] = [
  {
    id: '1',
    userId: '1',
    amount: 150,
    donationType: 'tithe',
    paymentMethod: 'mobile_money',
    donationDate: '2024-09-20',
    status: 'completed',
    receiptNumber: 'REC-2024-001'
  },
  {
    id: '2',
    userId: '1',
    amount: 50,
    donationType: 'offering',
    paymentMethod: 'cash',
    donationDate: '2024-09-15',
    status: 'completed',
    receiptNumber: 'REC-2024-002'
  }
]

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    userId: '1',
    pastorId: '2',
    appointmentDate: '2024-09-30',
    startTime: '10:00',
    endTime: '11:00',
    purpose: 'spiritual_counseling',
    status: 'confirmed',
    notes: 'Besoin de conseil spirituel pour ma famille',
    reminderSent: false
  },
  {
    id: '2',
    userId: '1',
    pastorId: '2',
    appointmentDate: '2024-10-05',
    startTime: '14:00',
    endTime: '15:00',
    purpose: 'prayer_request',
    status: 'pending',
    notes: 'Prière pour la guérison',
    reminderSent: false
  }
]

export const mockPrayers: Prayer[] = [
  {
    id: '1',
    userId: '1',
    title: 'Pour la guérison de ma mère',
    content: 'Je demande vos prières pour la guérison de ma mère qui est hospitalisée.',
    isAnonymous: false,
    isPublic: true,
    prayerDate: '2024-09-18',
    status: 'active',
    prayerCount: 23
  },
  {
    id: '2',
    userId: '1',
    title: 'Recherche d\'emploi',
    content: 'Priez pour que je trouve un emploi stable pour subvenir aux besoins de ma famille.',
    isAnonymous: true,
    isPublic: true,
    prayerDate: '2024-09-20',
    status: 'active',
    prayerCount: 15
  }
]

export const mockTestimonies: Testimony[] = [
  {
    id: '1',
    userId: '1',
    title: 'Dieu m\'a guéri miraculeusement',
    content: 'Après une longue maladie, Dieu a manifesté sa puissance dans ma vie. Les médecins n\'arrivaient pas à comprendre, mais moi je sais que c\'est Dieu qui m\'a guéri. Gloire à son nom !',
    isAnonymous: false,
    testimonyDate: '2024-09-10',
    status: 'approved',
    likeCount: 45,
    viewCount: 200,
    comments: [
      {
        id: '1',
        testimonyId: '1',
        userId: '2',
        content: 'Gloire à Dieu ! Que son nom soit béni.',
        isApproved: true,
        createdAt: '2024-09-11'
      }
    ]
  }
]

// Les événements sont maintenant gérés par l'API /api/events
// export const mockEvents: Event[] = [] // Supprimé - utilisation de l'API réelle

// Stats admin maintenant gérées directement par AdminDashboard
// export const mockAdminStats: AdminStats = {} // Supprimé - utilisation de l'API réelle

// Activités récentes maintenant gérées directement par AdminDashboard
// export const mockRecentActivities = [] // Supprimé - utilisation de l'API réelle

export const mockChatChannels: ChatChannel[] = [
  {
    id: 'general',
    name: 'Général',
    description: 'Discussion générale pour tous les membres',
    type: 'public',
    createdBy: '3',
    createdAt: '2025-01-01T00:00:00Z',
    memberIds: ['1', '2', '3', '4', '5', '6'],
    lastMessage: {
      id: 'msg_1',
      senderId: '2',
      senderName: 'Marie Kabongo',
      channelId: 'general',
      content: 'Bonjour à tous ! Que la paix de Dieu soit avec vous aujourd&apos;hui 🙏',
      messageType: 'text',
      timestamp: '2025-09-25T08:30:00Z',
      isEdited: false,
      reactions: [],
      isDeleted: false
    },
    lastActivity: '2025-09-25T08:30:00Z',
    isArchived: false,
    settings: {
      allowMessages: true,
      allowFiles: true,
      allowImages: true,
      moderatorOnly: false
    }
  },
  {
    id: 'prayer',
    name: 'Demandes de prière',
    description: 'Partagez vos demandes de prière et priez les uns pour les autres',
    type: 'prayer',
    createdBy: '3',
    createdAt: '2025-01-01T00:00:00Z',
    memberIds: ['1', '2', '3', '4', '5', '6'],
    lastMessage: {
      id: 'msg_2',
      senderId: '4',
      senderName: 'Paul Tshimanga',
      channelId: 'prayer',
      content: 'Prions pour la famille Mukendi qui traverse des difficultés financières',
      messageType: 'text',
      timestamp: '2025-09-25T07:15:00Z',
      isEdited: false,
      reactions: [],
      isDeleted: false
    },
    lastActivity: '2025-09-25T07:15:00Z',
    isArchived: false,
    settings: {
      allowMessages: true,
      allowFiles: false,
      allowImages: true,
      moderatorOnly: false
    }
  },
  {
    id: 'announcements',
    name: 'Annonces',
    description: 'Annonces officielles de l&apos;église',
    type: 'announcement',
    createdBy: '3',
    createdAt: '2025-01-01T00:00:00Z',
    memberIds: ['1', '2', '3', '4', '5', '6'],
    lastMessage: {
      id: 'msg_3',
      senderId: '3',
      senderName: 'Pasteur David Kalonji',
      channelId: 'announcements',
      content: 'Rappel : Culte spécial ce dimanche à 10h avec notre invité spécial',
      messageType: 'text',
      timestamp: '2025-09-24T15:00:00Z',
      isEdited: false,
      reactions: [],
      isDeleted: false
    },
    lastActivity: '2025-09-24T15:00:00Z',
    isArchived: false,
    settings: {
      allowMessages: true,
      allowFiles: true,
      allowImages: true,
      moderatorOnly: true
    }
  },
  {
    id: 'youth',
    name: 'Jeunes',
    description: 'Canal dédié aux jeunes de l&apos;église',
    type: 'public',
    createdBy: '5',
    createdAt: '2025-01-01T00:00:00Z',
    memberIds: ['1', '4', '5', '6'],
    lastMessage: {
      id: 'msg_4',
      senderId: '5',
      senderName: 'Grace Nsimba',
      channelId: 'youth',
      content: 'Qui participe à la sortie de samedi ? 🎉',
      messageType: 'text',
      timestamp: '2025-09-25T06:45:00Z',
      isEdited: false,
      reactions: [],
      isDeleted: false
    },
    lastActivity: '2025-09-25T06:45:00Z',
    isArchived: false,
    settings: {
      allowMessages: true,
      allowFiles: true,
      allowImages: true,
      moderatorOnly: false
    }
  },
  {
    id: 'leaders',
    name: 'Responsables',
    description: 'Canal privé pour les responsables de l&apos;église',
    type: 'private',
    createdBy: '3',
    createdAt: '2025-01-01T00:00:00Z',
    memberIds: ['2', '3', '4'],
    lastMessage: {
      id: 'msg_5',
      senderId: '2',
      senderName: 'Marie Kabongo',
      channelId: 'leaders',
      content: 'Réunion de planification prévue pour jeudi à 19h',
      messageType: 'text',
      timestamp: '2025-09-24T18:00:00Z',
      isEdited: false,
      reactions: [],
      isDeleted: false
    },
    lastActivity: '2025-09-24T18:00:00Z',
    isArchived: false,
    settings: {
      allowMessages: true,
      allowFiles: true,
      allowImages: true,
      moderatorOnly: false
    }
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    senderId: '2',
    senderName: 'Marie Kabongo',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    channelId: 'general',
    content: 'Bonjour à tous ! Que la paix de Dieu soit avec vous aujourd&apos;hui 🙏',
    messageType: 'text',
    timestamp: '2025-09-25T08:30:00Z',
    isEdited: false,
    reactions: [
      {
        id: 'r1',
        messageId: 'msg_1',
        userId: '1',
        emoji: '🙏',
        timestamp: '2025-09-25T08:31:00Z'
      },
      {
        id: 'r2',
        messageId: 'msg_1',
        userId: '4',
        emoji: '❤️',
        timestamp: '2025-09-25T08:32:00Z'
      }
    ],
    isDeleted: false
  },
  {
    id: 'msg_6',
    senderId: '1',
    senderName: 'Jean Mukendi',
    senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    channelId: 'general',
    content: 'Amen ! Bonne journée à tous aussi 😊',
    messageType: 'text',
    timestamp: '2025-09-25T08:35:00Z',
    isEdited: false,
    reactions: [],
    isDeleted: false
  },
  {
    id: 'msg_7',
    senderId: '5',
    senderName: 'Grace Nsimba',
    senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    channelId: 'general',
    content: 'N&apos;oubliez pas le groupe d&apos;étude biblique ce soir à 19h !',
    messageType: 'text',
    timestamp: '2025-09-25T09:00:00Z',
    isEdited: false,
    reactions: [
      {
        id: 'r3',
        messageId: 'msg_7',
        userId: '2',
        emoji: '👍',
        timestamp: '2025-09-25T09:01:00Z'
      }
    ],
    isDeleted: false
  },
  {
    id: 'msg_2',
    senderId: '4',
    senderName: 'Paul Tshimanga',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    channelId: 'prayer',
    content: 'Prions pour la famille Mukendi qui traverse des difficultés financières',
    messageType: 'text',
    timestamp: '2025-09-25T07:15:00Z',
    isEdited: false,
    reactions: [
      {
        id: 'r4',
        messageId: 'msg_2',
        userId: '1',
        emoji: '🙏',
        timestamp: '2025-09-25T07:16:00Z'
      },
      {
        id: 'r5',
        messageId: 'msg_2',
        userId: '2',
        emoji: '🙏',
        timestamp: '2025-09-25T07:17:00Z'
      }
    ],
    isDeleted: false
  },
  {
    id: 'msg_8',
    senderId: '2',
    senderName: 'Marie Kabongo',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    channelId: 'prayer',
    content: 'Je prie avec vous frère Paul. Que Dieu pourvoie à leurs besoins selon sa richesse.',
    messageType: 'text',
    timestamp: '2025-09-25T07:20:00Z',
    isEdited: false,
    reactions: [],
    isDeleted: false
  },
  {
    id: 'msg_3',
    senderId: '3',
    senderName: 'Pasteur David Kalonji',
    senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face',
    channelId: 'announcements',
    content: 'Rappel : Culte spécial ce dimanche à 10h avec notre invité spécial',
    messageType: 'text',
    timestamp: '2025-09-24T15:00:00Z',
    isEdited: false,
    reactions: [],
    isDeleted: false
  },
  {
    id: 'msg_4',
    senderId: '5',
    senderName: 'Grace Nsimba',
    senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    channelId: 'youth',
    content: 'Qui participe à la sortie de samedi ? 🎉',
    messageType: 'text',
    timestamp: '2025-09-25T06:45:00Z',
    isEdited: false,
    reactions: [
      {
        id: 'r6',
        messageId: 'msg_4',
        userId: '1',
        emoji: '🙋‍♂️',
        timestamp: '2025-09-25T06:46:00Z'
      }
    ],
    isDeleted: false
  },
  {
    id: 'msg_9',
    senderId: '1',
    senderName: 'Jean Mukendi',
    senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    channelId: 'youth',
    content: 'Moi je suis partant ! Ça va être génial 😄',
    messageType: 'text',
    timestamp: '2025-09-25T06:50:00Z',
    isEdited: false,
    reactions: [],
    isDeleted: false
  },
  {
    id: 'msg_5',
    senderId: '2',
    senderName: 'Marie Kabongo',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    channelId: 'leaders',
    content: 'Réunion de planification prévue pour jeudi à 19h',
    messageType: 'text',
    timestamp: '2025-09-24T18:00:00Z',
    isEdited: false,
    reactions: [],
    isDeleted: false
  }
];

export const mockOnlineStatus: OnlineStatus[] = [
  {
    userId: '1',
    status: 'online',
    lastSeen: '2025-09-25T09:30:00Z'
  },
  {
    userId: '2',
    status: 'online',
    lastSeen: '2025-09-25T09:25:00Z'
  },
  {
    userId: '3',
    status: 'away',
    lastSeen: '2025-09-25T08:00:00Z'
  },
  {
    userId: '4',
    status: 'online',
    lastSeen: '2025-09-25T09:15:00Z'
  },
  {
    userId: '5',
    status: 'offline',
    lastSeen: '2025-09-24T22:30:00Z'
  },
  {
    userId: '6',
    status: 'busy',
    lastSeen: '2025-09-25T09:00:00Z'
  }
]