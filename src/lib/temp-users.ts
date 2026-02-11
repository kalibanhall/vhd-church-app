// Utilisateurs temporaires en mémoire (le temps de résoudre la DB)
export const tempUsers = [
  {
    id: 'admin-chris-kasongo-temp',
    email: 'admin@mychurchapp.com',
    passwordHash: '$2a$12$5w7wbciIDhCiGtQubYCzN.TObWHHtrh4M3o9GJeM4Em2pxh4qEaKO', // password: Qualis@2025
    firstName: 'Chris',
    lastName: 'Kasongo',
    role: 'ADMIN',
    status: 'ACTIVE',
    phone: '+243999999999',
    membershipDate: new Date('2025-01-01'),
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'demo-user-temp',
    email: 'membre@mychurchapp.com',
    passwordHash: '$2a$12$V0qrbgwleamQpc4LRMNPTefG7.nV2wo.jeq0YUcTumhIxJya8Piwq', // password: Demo123!
    firstName: 'Demo',
    lastName: 'Membre',
    role: 'MEMBER',
    status: 'ACTIVE',
    phone: '+243888888888',
    membershipDate: new Date('2025-05-01'),
    createdAt: new Date('2025-05-01')
  }
];

// Stockage temporaire des nouveaux utilisateurs inscrits
export let newTempUsers: any[] = [];