import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "church"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "church", ...props }, ref) => {
    const variantClasses = {
      default: "border-gray-300 bg-white focus-visible:ring-[#ffc200]",
      church: "border-[rgba(201,201,201,0.6)] bg-[#fffefa] focus-visible:ring-[#ffc200] focus-visible:border-[#ffc200]",
    }

    return (
      <input
        type={type}
        className={`flex h-12 w-full rounded-md border px-4 py-3 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#999] text-[#0a0a0a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${variantClasses[variant]} ${className || ''}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }