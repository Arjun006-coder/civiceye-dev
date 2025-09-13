import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  type: 'verification' | 'action'
  className?: string
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const verificationColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
    resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    under_review: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  
  const actionColors = {
    planning: 'bg-orange-100 text-orange-800 border-orange-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
  
  const getColorClasses = () => {
    if (type === 'verification') {
      return verificationColors[status as keyof typeof verificationColors] || verificationColors.pending
    } else {
      return actionColors[status as keyof typeof actionColors] || actionColors.planning
    }
  }

  const formatStatus = (status: string) => status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <span 
      className={cn(
        'px-2 py-1 rounded-full text-xs font-medium border',
        getColorClasses(),
        className
      )}
    >
      {formatStatus(status)}
    </span>
  )
}
