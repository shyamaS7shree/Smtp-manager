import { TrendingUp, TrendingDown, List, Mail, Users, FileText } from "lucide-react"

interface MetricCardProps {
  icon: string
  title: string
  value: number
  percentage: string
  description: string
  trend: "up" | "down"
}

export default function MetricCard({ icon, title, value, percentage, description, trend }: MetricCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "Campaigns":
        return <Mail className="h-5 w-5 text-muted-foreground" />
      case "List":
        return <List className="h-5 w-5 text-muted-foreground" />
      case "Subscribers":
        return <Users className="h-5 w-5 text-muted-foreground" />
      case "Templates":
        return <FileText className="h-5 w-5 text-muted-foreground" />
      default:
        return <Mail className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        {getIcon()}
        <div className="relative h-10 w-20">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={
                trend === "up"
                  ? "M0,40 L10,35 L20,38 L30,32 L40,28 L50,25 L60,20 L70,15 L80,10 L90,5 L100,0"
                  : "M0,0 L10,5 L20,8 L30,12 L40,18 L50,25 L60,30 L70,35 L80,38 L90,36 L100,40"
              }
              fill="none"
              stroke={trend === "up" ? "#22c55e" : "#ef4444"}
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      <div className="mb-1 text-2xl font-bold text-foreground">{value}</div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div
          className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs ${
            trend === "up" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {percentage}
        </div>
      </div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  )
}
