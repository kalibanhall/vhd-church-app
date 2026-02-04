import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "church" | "church-success"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    // MyChurchApp Design System
    default: "bg-[rgba(255,243,204,0.6)] text-[#cc9b00] border-transparent",
    secondary: "bg-gray-100 text-gray-800 border-gray-200",
    destructive: "bg-red-100 text-red-800 border-red-200",
    outline: "border border-[rgba(201,201,201,0.6)] text-[#0a0a0a] bg-transparent",
    success: "bg-[rgba(52,168,83,0.1)] text-[#34a853] border-transparent",
    warning: "bg-[rgba(255,243,204,0.6)] text-[#cc9b00] border-transparent",
    church: "bg-[rgba(255,243,204,0.6)] text-[#cc9b00] border-transparent",
    "church-success": "bg-[rgba(52,168,83,0.1)] text-[#34a853] border-transparent",
  }

  return (
    <div
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#ffc200] focus:ring-offset-2 ${variantClasses[variant]} ${className || ''}`}
      {...props}
    />
  )
}

export { Badge }