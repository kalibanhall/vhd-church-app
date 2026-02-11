// Données de fallback pour l'application en cas de problème DB
export const fallbackData = {
  events: [
    {
      id: 'event-1',
      title: 'Culte du Dimanche',
      description: 'Service dominical hebdomadaire',
      eventType: 'WORSHIP_SERVICE',
      startDate: new Date('2025-10-27T10:00:00').toISOString(),
      endDate: new Date('2025-10-27T12:00:00').toISOString(),
      location: 'Sanctuaire Principal',
      isPublic: true,
      creator: { firstName: 'Chris', lastName: 'Kasongo' }
    },
    {
      id: 'event-2', 
      title: 'Réunion de Prière',
      description: 'Temps de prière collective',
      eventType: 'PRAYER_MEETING',
      startDate: new Date('2025-10-24T19:00:00').toISOString(),
      endDate: new Date('2025-10-24T20:30:00').toISOString(),
      location: 'Salle de Prière',
      isPublic: true,
      creator: { firstName: 'Chris', lastName: 'Kasongo' }
    }
  ],
  
  preachings: [
    {
      id: 'preaching-1',
      title: 'La Foi en Action',
      description: 'Une prédication sur la foi pratique dans la vie quotidienne',
      scriptureReference: 'Jacques 2:14-26',
      preacher: 'Pasteur Chris Kasongo',
      preachedAt: new Date('2025-10-20').toISOString(),
      isPublic: true,
      audioUrl: null,
      videoUrl: null
    },
    {
      id: 'preaching-2',
      title: 'L\'Amour de Dieu',
      description: 'Méditation sur l\'amour inconditionnel de Dieu',
      scriptureReference: '1 Jean 4:7-21',
      preacher: 'Pasteur Chris Kasongo', 
      preachedAt: new Date('2025-10-13').toISOString(),
      isPublic: true,
      audioUrl: null,
      videoUrl: null
    }
  ],
  
  notifications: [],
  
  pastors: [
    {
      id: 'pastor-1',
      firstName: 'Chris',
      lastName: 'Kasongo',
      email: 'admin@mychurchapp.com',
      role: 'PASTEUR',
      status: 'ACTIVE',
      available: true
    }
  ]
};