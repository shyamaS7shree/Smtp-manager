"use client"

import Link from "next/link"
import { Users, Target, Settings, FileText, Layout, Wrench } from "lucide-react"

interface ListDetailStatsProps {
  listId: string
}

export default function ListDetailStats({ listId }: ListDetailStatsProps) {
  const stats = [
    {
      title: "Subscribers",
      value: "0",
      icon: Users,
      href: `/lists/${listId}/subscribers`,
      color: "text-blue-500",
    },
    {
      title: "Segments",
      value: "0",
      icon: Target,
      href: `/lists/${listId}/segments`,
      color: "text-blue-500",
    },
    {
      title: "Custom fields",
      value: "3",
      icon: Settings,
      href: `/lists/${listId}/custom-fields`,
      color: "text-blue-500",
    },
    {
      title: "Pages",
      value: "11",
      icon: FileText,
      href: `/lists/${listId}/pages`,
      color: "text-blue-500",
    },
    {
      title: "Forms",
      value: "Tools",
      icon: Layout,
      href: `/lists/${listId}/forms`,
      color: "text-blue-500",
    },
    {
      title: "Tools",
      value: "List tools",
      icon: Wrench,
      href: `/lists/${listId}/tools`,
      color: "text-blue-500",
    },
  ]

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col items-center text-center">
                <IconComponent className={`h-8 w-8 ${stat.color} mb-3`} />
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
