/**
 * ChurchCard - Composant de carte basé sur le design MyChurchApp Figma
 * Design System: MyChurchApp
 */
import * as React from "react"

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

interface ChurchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "accent" | "highlight" | "verse"
  padding?: "none" | "sm" | "md" | "lg"
}

const ChurchCard = React.forwardRef<HTMLDivElement, ChurchCardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const baseClasses = "rounded-md transition-all"
    
    const variantClasses = {
      default: "bg-[#fffefa] border border-[rgba(201,201,201,0.3)]",
      accent: "bg-[#fff3cc] border-none",
      highlight: "bg-[#fff5d5] border-none",
      verse: "bg-[#fff3cc] border-none",
    }
    
    const paddingClasses = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    }

    return (
      <div
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ChurchCard.displayName = "ChurchCard"

// Verse Card Component
interface VerseCardProps {
  reference: string
  text: string
  onLike?: () => void
  onShare?: () => void
  onSave?: () => void
  className?: string
}

const VerseCard: React.FC<VerseCardProps> = ({
  reference,
  text,
  onLike,
  onShare,
  onSave,
  className
}) => {
  return (
    <ChurchCard variant="accent" className={cn("p-4", className)}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-[#0a0a0a]">Verset du jour</span>
        <span className="text-xs font-semibold text-[#cc9b00]">{reference}</span>
      </div>
      <p className="text-base font-medium text-[#0a0a0a] leading-relaxed mb-4">
        {text}
      </p>
      <div className="flex items-center gap-4">
        {onLike && (
          <button onClick={onLike} className="p-1 hover:bg-[#fff5d5] rounded transition-colors">
            <svg className="w-6 h-6 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
        {onShare && (
          <button onClick={onShare} className="p-1 hover:bg-[#fff5d5] rounded transition-colors">
            <svg className="w-6 h-6 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        )}
        <div className="flex-1" />
        {onSave && (
          <button onClick={onSave} className="p-1 hover:bg-[#fff5d5] rounded transition-colors">
            <svg className="w-6 h-6 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
      </div>
    </ChurchCard>
  )
}

// Announcement Card Component  
interface AnnouncementCardProps {
  title?: string
  text: string
  isUrgent?: boolean
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: "primary" | "secondary"
  }>
  className?: string
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  title,
  text,
  isUrgent = false,
  actions,
  className
}) => {
  return (
    <ChurchCard className={cn("relative", className)}>
      {isUrgent && (
        <div className="absolute -left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#cc9b00]" />
      )}
      <div className="p-4">
        {title && (
          <h4 className="text-sm font-semibold text-[#0a0a0a] mb-2">{title}</h4>
        )}
        <p className="text-base text-[#0a0a0a] leading-relaxed mb-4">
          {text}
        </p>
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-semibold uppercase transition-all",
                  action.variant === "primary" 
                    ? "bg-[rgba(255,243,204,0.6)] text-[#cc9b00] hover:bg-[rgba(255,243,204,0.9)]"
                    : "text-[#cc9b00] hover:bg-[rgba(255,243,204,0.6)]"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </ChurchCard>
  )
}

export { ChurchCard, VerseCard, AnnouncementCard }
