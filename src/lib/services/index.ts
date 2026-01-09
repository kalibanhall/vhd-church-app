/**
 * Index des services - MyChurchApp
 * Export centralisé de tous les services
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

// Services existants
export { default as facialRecognitionService } from './facial-recognition-service';
export { default as workflowService } from './workflow-service';
export { default as analyticsService } from './analytics-service';
export { default as messagingService } from './messaging-service';
export { default as financeService } from './finance-service';
export { default as eventService } from './event-service';
export { default as securityService } from './security-service';
export { default as adminService } from './admin-service';
export { default as integrationService } from './integration-service';
export { default as sermonsService } from './sermons-service';
export { default as pwaService } from './pwa-service';
export { NotificationManager, EmailService, SMSService, WebPushService, EmailTemplates } from './notification-service';
export { TwoFactorAuthService, TOTPService, BackupCodesService, SecurityAuditService, SessionService } from './two-factor-auth-service';
export { ExportManager, CSVExportService, ExcelExportService, PDFExportService } from './export-service';

// Nouveaux services
export { default as membersService } from './members-service';
export { default as donationsService } from './donations-service';
export { default as attendanceService } from './attendance-service';
export { default as prayersService } from './prayers-service';

// Types des services
export type { Member, MemberFilters, MemberStats } from './members-service';
export type { Donation, DonationFilters, DonationStats, DonationProject } from './donations-service';
export type { AttendanceRecord, AttendanceSession, AttendanceFilters, AttendanceStats } from './attendance-service';
export type { Prayer, Testimony, PrayerFilters, TestimonyFilters } from './prayers-service';
