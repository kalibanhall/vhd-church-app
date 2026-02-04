/**
 * ChurchTabs - Composant d'onglets basé sur le design MyChurchApp Figma
 * Design System: MyChurchApp
 */
import * as React from "react"

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface ChurchTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: "default" | "pills" | "underline"
  className?: string
}

const ChurchTabs: React.FC<ChurchTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
  className
}) => {
  const containerClasses = {
    default: "flex gap-2 p-1 bg-[#fff5d5] rounded-md",
    pills: "flex gap-2",
    underline: "flex gap-4 border-b border-[rgba(201,201,201,0.3)]",
  }

  const tabBaseClasses = {
    default: "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
    pills: "px-4 py-2 rounded-md text-sm font-medium transition-all shadow-church",
    underline: "px-1 py-2 text-sm font-medium transition-all border-b-2 -mb-px",
  }

  const tabActiveClasses = {
    default: "bg-[#ffda66] text-gray-800 shadow-church",
    pills: "bg-[#ffda66] text-gray-800",
    underline: "border-[#ffc200] text-[#0a0a0a]",
  }

  const tabInactiveClasses = {
    default: "text-[#333] hover:bg-[rgba(255,218,102,0.5)]",
    pills: "bg-white text-[#333] hover:bg-[#fff5d5]",
    underline: "border-transparent text-[#999] hover:text-[#0a0a0a]",
  }

  return (
    <div className={cn(containerClasses[variant], className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            tabBaseClasses[variant],
            activeTab === tab.id ? tabActiveClasses[variant] : tabInactiveClasses[variant]
          )}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export { ChurchTabs }
export type { Tab }
