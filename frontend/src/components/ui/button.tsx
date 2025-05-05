import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "gradient-outline"
  size?: "default" | "sm" | "lg" | "icon"
  gradient?: "red-amber" | "purple-blue" | "none"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", gradient = "none", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors relative",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            // Base variants
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "text-primary underline-offset-4 hover:underline": variant === "link",
            
            // Custom gradient variants with stable box-shadow transitions
            "text-white before:absolute before:inset-0 before:rounded-md before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:z-[-1]": variant === "gradient",
            "border border-white/20 bg-white/[0.05] text-white hover:bg-white/10": variant === "gradient-outline",
            
            // Gradient colors with ::before pseudo-element for hover effect
            "bg-gradient-to-r from-red-500 to-amber-500 before:bg-gradient-to-r before:from-red-600 before:to-amber-600": variant === "gradient" && gradient === "red-amber",
            "bg-gradient-to-r from-blue-500 to-purple-500 before:bg-gradient-to-r before:from-blue-600 before:to-purple-600": variant === "gradient" && gradient === "purple-blue",
            
            // Stable shadow styles
            "shadow-lg hover:shadow-lg": variant === "gradient",
            "shadow-red-500/20 hover:shadow-red-500/30": variant === "gradient" && gradient === "red-amber",
            "shadow-blue-500/20 hover:shadow-blue-500/30": variant === "gradient" && gradient === "purple-blue",
            
            // Sizes with consistent dimensions
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
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
