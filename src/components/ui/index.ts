/**
 * Index des composants UI - MyChurchApp
 * Export centralisé de tous les composants UI
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

// Composants existants
export * from './badge';
export * from './button';
export { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from './card';
export * from './input';
export * from './label';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as NotificationsPanel } from './NotificationsPanel';
export { default as ResponsiveContainer } from './ResponsiveContainer';
export * from './select';
export * from './textarea';

// Nouveaux composants
export { Modal, ConfirmModal } from './Modal';
export { Toast, ToastContainer } from './Toast';
export { DataTable } from './DataTable';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
export { DatePicker } from './DatePicker';
export { Dropdown, Select } from './Dropdown';
export { StatCard, StatCardGrid } from './StatCard';
export { ProgressBar, CircularProgress } from './ProgressBar';
export { BarChart, LineChart, DonutChart } from './SimpleChart';
export { EmptyState } from './EmptyState';
export { Avatar, AvatarGroup } from './Avatar';
export { default as LogoutConfirmModal } from './LogoutConfirmModal';
export { default as PageWrapper, ContentCard, StatGrid, StatItem, Section, EmptyState as PageEmptyState } from './PageWrapper';

// MyChurchApp Design System Components (Figma)
export { ChurchCard, VerseCard, AnnouncementCard } from './ChurchCard';
export { ChurchTabs } from './ChurchTabs';
export { 
  BottomNavigation, 
  ChurchHeader, 
  NotificationBell, 
  MenuButton,
  HomeIcon,
  CalendarIcon,
  BibleIcon,
  DashboardIcon
} from './ChurchNavigation';

// Types
export type { ModalProps, ConfirmModalProps } from './Modal';
export type { Column, DataTableProps } from './DataTable';
export type { DropdownItem } from './Dropdown';
export type { StatCardProps } from './StatCard';
export type { ProgressBarProps, CircularProgressProps } from './ProgressBar';
export type { BarChartData, LineChartData, DonutChartData } from './SimpleChart';
export type { Tab } from './ChurchTabs';
export type { NavItem, HeaderProps, BottomNavigationProps } from './ChurchNavigation';
