// =============================================================================
// MINISTÈRE DES VAILLANTS HOMMES DE DAVID
// =============================================================================
// 
// Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
// GitHub: https://github.com/KalibanHall
// Version: 1.0.0
// Date: Novembre 2025
// 
// =============================================================================

class AppConstants {
  // App Info
  static const String appName = 'VHD Church App';
  static const String appVersion = '1.0.0';
  
  // Supabase
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://lwmyferidfbzcnggddob.supabase.co',
  );
  
  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3bXlmZXJpZGZiemNuZ2dkZG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MTMyNjYsImV4cCI6MjA0NTE4OTI2Nn0.HiyTcsEqUjUqJ0xzJWJZu-mLy8PBGw6Zfv2tPkcGDUQ',
  );
  
  // Stream Chat
  static const String streamApiKey = String.fromEnvironment(
    'STREAM_API_KEY',
    defaultValue: '',
  );
  
  // Database Tables
  static const String usersTable = 'users';
  static const String donationsTable = 'donations';
  static const String donationProjectsTable = 'donation_projects';
  static const String eventsTable = 'events';
  static const String sermonsTable = 'sermons';
  static const String appointmentsTable = 'appointments';
  static const String prayersTable = 'prayers';
  static const String prayerSupportsTable = 'prayer_supports';
  static const String testimoniesTable = 'testimonies';
  static const String testimonyLikesTable = 'testimony_likes';
  static const String testimonyCommentsTable = 'testimony_comments';
  static const String messagesTable = 'messages';
  static const String channelsTable = 'channels';
  static const String channelMembersTable = 'channel_members';
  static const String notificationsTable = 'notifications';
  static const String eventAttendancesTable = 'event_attendances';
  static const String pollsTable = 'polls';
  static const String pollOptionsTable = 'poll_options';
  static const String pollVotesTable = 'poll_votes';
  static const String pastorAvailabilityTable = 'pastor_availability';
  static const String pastorUnavailabilityTable = 'pastor_unavailability';
  
  // User Roles
  static const String roleFidele = 'FIDELE';
  static const String roleOuvrier = 'OUVRIER';
  static const String rolePasteur = 'PASTEUR';
  static const String roleAdmin = 'ADMIN';
  
  // User Status
  static const String statusActive = 'ACTIVE';
  static const String statusInactive = 'INACTIVE';
  static const String statusPending = 'PENDING';
  static const String statusSuspended = 'SUSPENDED';
  
  // Donation Types
  static const String donationTypeOffering = 'OFFERING';
  static const String donationTypeTithe = 'TITHE';
  static const String donationTypeFreewill = 'FREEWILL';
  static const String donationTypeProject = 'PROJECT';
  static const String donationTypeBuilding = 'BUILDING';
  static const String donationTypeOther = 'OTHER';
  
  // Payment Methods
  static const String paymentCash = 'CASH';
  static const String paymentCard = 'CARD';
  static const String paymentMobileMoney = 'MOBILE_MONEY';
  static const String paymentBankTransfer = 'BANK_TRANSFER';
  static const String paymentCheck = 'CHECK';
  
  // Event Types
  static const String eventTypeWorshipService = 'WORSHIP_SERVICE';
  static const String eventTypePrayerMeeting = 'PRAYER_MEETING';
  static const String eventTypeBibleStudy = 'BIBLE_STUDY';
  static const String eventTypeYouthMeeting = 'YOUTH_MEETING';
  static const String eventTypeSpecialEvent = 'SPECIAL_EVENT';
  
  // Event Status
  static const String eventStatusScheduled = 'SCHEDULED';
  static const String eventStatusInProgress = 'IN_PROGRESS';
  static const String eventStatusCompleted = 'COMPLETED';
  static const String eventStatusCancelled = 'CANCELLED';
  static const String eventStatusPostponed = 'POSTPONED';
  
  // Sermon Types
  static const String sermonTypeAudio = 'AUDIO';
  static const String sermonTypeVideo = 'VIDEO';
  static const String sermonTypeText = 'TEXT';
  static const String sermonTypeLiveStream = 'LIVE_STREAM';
  
  // Appointment Status
  static const String appointmentStatusScheduled = 'SCHEDULED';
  static const String appointmentStatusConfirmed = 'CONFIRMED';
  static const String appointmentStatusCompleted = 'COMPLETED';
  static const String appointmentStatusCancelled = 'CANCELLED';
  static const String appointmentStatusRescheduled = 'RESCHEDULED';
  
  // Prayer Categories
  static const String prayerCategoryGeneral = 'GENERAL';
  static const String prayerCategoryHealing = 'HEALING';
  static const String prayerCategoryFamily = 'FAMILY';
  static const String prayerCategoryFinances = 'FINANCES';
  static const String prayerCategoryCareer = 'CAREER';
  
  // Prayer Status
  static const String prayerStatusPending = 'PENDING';
  static const String prayerStatusApproved = 'APPROVED';
  static const String prayerStatusRejected = 'REJECTED';
  
  // Testimony Categories
  static const String testimonyCategoryHealing = 'HEALING';
  static const String testimonyCategorySalvation = 'SALVATION';
  static const String testimonyCategoryBreakthrough = 'BREAKTHROUGH';
  static const String testimonyCategoryMiracle = 'MIRACLE';
  
  // Message Types
  static const String messageTypeText = 'TEXT';
  static const String messageTypeImage = 'IMAGE';
  static const String messageTypeFile = 'FILE';
  static const String messageTypeVoice = 'VOICE';
  
  // Channel Types
  static const String channelTypePublic = 'PUBLIC';
  static const String channelTypePrivate = 'PRIVATE';
  static const String channelTypeAnnouncement = 'ANNOUNCEMENT';
  static const String channelTypePrayer = 'PRAYER';
  
  // Notification Types
  static const String notificationTypeGeneral = 'GENERAL';
  static const String notificationTypeEventReminder = 'EVENT_REMINDER';
  static const String notificationTypeAppointment = 'APPOINTMENT';
  static const String notificationTypeDonation = 'DONATION';
  static const String notificationTypePrayer = 'PRAYER';
  
  // Marital Status
  static const String maritalStatusSingle = 'SINGLE';
  static const String maritalStatusMarried = 'MARRIED';
  static const String maritalStatusDivorced = 'DIVORCED';
  static const String maritalStatusWidowed = 'WIDOWED';
  
  // Local Storage Keys
  static const String keyAccessToken = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserId = 'user_id';
  static const String keyUserRole = 'user_role';
  static const String keyThemeMode = 'theme_mode';
  static const String keyLanguage = 'language';
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // File Upload
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const int maxVideoSize = 50 * 1024 * 1024; // 50MB
  
  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Face Recognition
  static const double faceDetectionConfidence = 0.75;
  static const int maxFacesPerUser = 5;
}
