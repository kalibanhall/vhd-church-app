// Utilisateurs temporaires en mémoire (le temps de résoudre la DB)
export const tempUsers = [
  {
    id: 'admin-chris-kasongo-temp',
    email: 'admin@vhd.app',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: Qualis@2025
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
    email: 'membre@vhd.app',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: Demo123!
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