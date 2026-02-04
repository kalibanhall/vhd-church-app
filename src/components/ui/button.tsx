import * as React from "react"
// Fonction utilitaire simple pour combiner les classes
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "church" | "church-secondary" | "church-outline"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 disabled:pointer-events-none disabled:opacity-50"
    
    const variantClasses = {
      // MyChurchApp Design System
      default: "bg-[#ffda66] text-gray-800 hover:bg-[#ffc200] shadow-[0px_1px_7px_0px_rgba(89,68,2,0.2)]",
      primary: "bg-[#ffda66] text-gray-800 hover:bg-[#ffc200] shadow-[0px_1px_7px_0px_rgba(89,68,2,0.2)]",
      secondary: "bg-[rgba(255,243,204,0.6)] text-[#cc9b00] hover:bg-[rgba(255,243,204,0.9)] uppercase",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-[rgba(201,201,201,0.6)] bg-[#fffefa] hover:bg-[#fff5d5] text-gray-800 shadow-[0px_1px_7px_0px_rgba(89,68,2,0.2)]",
      ghost: "hover:bg-[#fff5d5] text-gray-800",
      link: "text-[#cc9b00] underline-offset-4 hover:underline",
      // Legacy variants for backward compatibility
      church: "bg-[#ffda66] text-gray-800 hover:bg-[#ffc200] shadow-[0px_1px_7px_0px_rgba(89,68,2,0.2)]",
      "church-secondary": "bg-[rgba(255,243,204,0.6)] text-[#cc9b00] hover:bg-[rgba(255,243,204,0.9)] uppercase",
      "church-outline": "border border-[rgba(201,201,201,0.6)] bg-[#fffefa] hover:bg-[#fff5d5] shadow-[0px_1px_7px_0px_rgba(89,68,2,0.2)]",
    }
    
    const sizeClasses = {
      default: "h-11 px-6 py-2.5",
      sm: "h-9 rounded-md px-3 text-xs",
      lg: "h-12 rounded-md px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }