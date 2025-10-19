export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'member' | 'pastor' | 'admin' | 'deacon';
  membershipDate: string;
  status: 'active' | 'inactive' | 'pending';
  profileImage?: string;
  profilePhoto?: string;
  birthDate?: string;
  address?: string;
  membershipNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  baptismDate?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  profession?: string;
}

export interface Sermon {
  id: string;
  title: string;
  preacherId: string;
  preacherName: string;
  eventId?: string;
  sermonDate: string;
  sermonType: 'audio' | 'video' | 'text';
  durationMinutes?: number;
  audioUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  bibleVerses?: string;
  sermonNotes?: string;
  downloadCount: number;
  viewCount: number;
  isPublished: boolean;
}

export interface Donation {
  id: string;
  userId: string;
  amount: number;
  donationType: 'offering' | 'tithe' | 'freewill' | 'project' | 'building' | 'other';
  paymentMethod: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'check';
  paymentReference?: string;
  donationDate: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  projectId?: string;
  notes?: string;
  receiptNumber?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  pastorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  purpose: 'spiritual_counseling' | 'family_counseling' | 'prayer_request' | 'baptism_preparation' | 'marriage_preparation' | 'visit_request' | 'other';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  cancellationReason?: string;
  reminderSent: boolean;
}

export interface Prayer {
  id: string;
  userId: string;
  title?: string;
  content: string;
  isAnonymous: boolean;
  isPublic: boolean;
  prayerDate: string;
  status: 'active' | 'answered' | 'archived';
  prayerCount: number;
  answeredDate?: string;
  answeredTestimony?: string;
}

export interface PrayerSupporter {
  id: string;
  prayerId: string;
  userId: string;
  supportedAt: string;
  notes?: string;
}

export interface Testimony {
  id: string;
  userId: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  testimonyDate: string;
  status: 'pending' | 'approved' | 'rejected';
  likeCount: number;
  viewCount: number;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments: TestimonyComment[];
}

export interface TestimonyComment {
  id: string;
  testimonyId: string;
  userId: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  eventType: 'service' | 'prayer' | 'conference' | 'seminar' | 'meeting' | 'other';
  location?: string;
  pastorId?: string;
  maxAttendees?: number;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'scheduled' | 'cancelled' | 'completed';
}

export interface Attendance {
  id: string;
  eventId: string;
  userId: string;
  checkInTime: string;
  checkOutTime?: string;
  attendanceMethod: 'manual' | 'qr_code' | 'facial_recognition' | 'mobile';
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: 'event_reminder' | 'prayer_request' | 'appointment_reminder' | 'donation_receipt' | 'system_alert' | 'new_sermon' | 'testimony_approved';
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
  scheduledAt?: string;
  sentAt: string;
}

export interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  todaysPresence: number;
  monthlyDonations: number;
  pendingPrayers: number;
  upcomingEvents: number;
  pendingTestimonies: number;
  thisWeekAttendance: number;
}

export interface DonationProject {
  id: string;
  projectName: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  projectImageUrl?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface DonationForm {
  amount: number;
  donationType: Donation['donationType'];
  paymentMethod: Donation['paymentMethod'];
  projectId?: string;
  notes?: string;
}

export interface AppointmentForm {
  pastorId: string;
  appointmentDate: string;
  startTime: string;
  purpose: Appointment['purpose'];
  notes?: string;
}

export interface PrayerForm {
  title?: string;
  content: string;
  isAnonymous: boolean;
  isPublic: boolean;
}

export interface TestimonyForm {
  title: string;
  content: string;
  isAnonymous: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  channelId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'voice';
  fileUrl?: string;
  fileName?: string;
  replyToId?: string;
  timestamp: string;
  isEdited: boolean;
  editedAt?: string;
  reactions: ChatReaction[];
  isDeleted: boolean;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'announcement' | 'prayer';
  createdBy: string;
  createdAt: string;
  memberIds: string[];
  lastMessage?: ChatMessage;
  lastActivity: string;
  isArchived: boolean;
  settings: {
    allowMessages: boolean;
    allowFiles: boolean;
    allowImages: boolean;
    moderatorOnly: boolean;
  };
}

export interface ChatReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface OnlineStatus {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: string;
}