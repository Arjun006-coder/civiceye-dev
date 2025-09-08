import { cn } from "@/lib/utils"

interface ConfidenceScoreProps {
  score: number
  className?: string
  showLabel?: boolean
}

export function ConfidenceScore({ score, className, showLabel = true }: ConfidenceScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-600 bg-emerald-100'
    if (score >= 0.6) return 'text-green-600 bg-green-100'
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'High'
    if (score >= 0.6) return 'Good'
    if (score >= 0.4) return 'Medium'
    return 'Low'
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && <span className="text-sm text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">Confidence:</span>}
      <div className={cn(
        "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
        getScoreColor(score)
      )}>
        <span>{Math.round(score * 100)}%</span>
        <span className="text-xs opacity-75">({getScoreLabel(score)})</span>
      </div>
    </div>
  )
}









