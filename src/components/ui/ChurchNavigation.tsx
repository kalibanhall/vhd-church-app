/**
 * ChurchNavigation - Composants de navigation basés sur le design MyChurchApp Figma
 * Design System: MyChurchApp
 */
import * as React from "react"
import Link from "next/link"

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

// Icons
const HomeIcon = ({ active }: { active?: boolean }) => (
  <svg className={cn("w-6 h-6", active ? "text-[#ffc200]" : "text-[#0a0a0a]")} fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
)

const CalendarIcon = ({ active }: { active?: boolean }) => (
  <svg className={cn("w-6 h-6", active ? "text-[#ffc200]" : "text-[#0a0a0a]")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5"/>
    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="1.5"/>
    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="1.5"/>
    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="1.5"/>
  </svg>
)

const BibleIcon = ({ active }: { active?: boolean }) => (
  <svg className={cn("w-6 h-6", active ? "text-[#ffc200]" : "text-[#0a0a0a]")} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 4h12c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h12V6H6zm3 2h6v2H9V8zm0 4h6v2H9v-2z"/>
  </svg>
)

const DashboardIcon = ({ active }: { active?: boolean }) => (
  <svg className={cn("w-6 h-6", active ? "text-[#ffc200]" : "text-[#0a0a0a]")} fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </svg>
)

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.FC<{ active?: boolean }>
}

const defaultNavItems: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: HomeIcon },
  { id: "agenda", label: "Agenda", href: "/appointments", icon: CalendarIcon },
  { id: "bible", label: "Bible", href: "/bible", icon: BibleIcon },
  { id: "dashboard", label: "Dashboard", href: "/profile", icon: DashboardIcon },
]

interface BottomNavigationProps {
  items?: NavItem[]
  activeItem?: string
  className?: string
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items = defaultNavItems,
  activeItem = "home",
  className
}) => {
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-[#fffefa] border-t border-[rgba(179,179,179,0.4)] z-50",
      "flex items-center justify-around py-3 px-4",
      "safe-area-pb",
      className
    )}>
      {items.map((item) => {
        const isActive = activeItem === item.id
        const Icon = item.icon
        
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[60px]",
              "transition-colors"
            )}
          >
            <Icon active={isActive} />
            <span className={cn(
              "text-xs font-semibold",
              isActive ? "text-[#ffc200]" : "text-[#0a0a0a]"
            )}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

// Header Navigation
interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  rightActions?: React.ReactNode
  className?: string
}

const ChurchHeader: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightActions,
  className
}) => {
  return (
    <header className={cn(
      "sticky top-0 z-40 bg-[#fffefa]",
      "flex items-center justify-between px-7 py-4",
      className
    )}>
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={onBack}
            className="p-1 hover:bg-[#fff5d5] rounded-md transition-colors"
          >
            <svg className="w-6 h-6 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {title && (
          <h1 className="text-base font-semibold text-[#0a0a0a]">{title}</h1>
        )}
      </div>
      
      {rightActions && (
        <div className="flex items-center gap-3">
          {rightActions}
        </div>
      )}
    </header>
  )
}

// Notification Bell
interface NotificationBellProps {
  count?: number
  onClick?: () => void
}

const NotificationBell: React.FC<NotificationBellProps> = ({ count = 0, onClick }) => (
  <button 
    onClick={onClick}
    className="relative p-1 hover:bg-[#fff5d5] rounded-md transition-colors"
  >
    <svg className="w-6 h-6 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
    {count > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
        {count > 9 ? "9+" : count}
      </span>
    )}
  </button>
)

// Menu Button
interface MenuButtonProps {
  onClick?: () => void
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="p-1 hover:bg-[#fff5d5] rounded-md transition-colors"
  >
    <svg className="w-6 h-6 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
)

export { 
  BottomNavigation, 
  ChurchHeader, 
  NotificationBell, 
  MenuButton,
  HomeIcon,
  CalendarIcon,
  BibleIcon,
  DashboardIcon
}
export type { NavItem, HeaderProps, BottomNavigationProps }
