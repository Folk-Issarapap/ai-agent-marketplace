"use client"

import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  editable?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StarRating({
  rating,
  onRatingChange,
  editable = false,
  size = "md",
  className,
}: StarRatingProps) {
  const sizeMap = { sm: "h-3.5 w-3.5", md: "h-4.5 w-4.5", lg: "h-5.5 w-5.5" }
  const iconSize = sizeMap[size]

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!editable}
          onClick={() => editable && onRatingChange?.(star)}
          className={cn(
            "transition-colors disabled:cursor-default",
            editable && "cursor-pointer hover:scale-110 transition-transform"
          )}
          aria-label={`Rate ${star} out of 5`}
        >
          <Star
            className={cn(
              iconSize,
              star <= rating
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  )
}
