"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronLeft,
  Users,
  Target,
  Settings,
  TrendingUp,
  Mail,
  MousePointer,
  UserMinus,
  AlertTriangle,
  Bone as Bounce,
} from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { apiUrl, token } from "@/components/common/http"
import SidebarNav from "@/components/sidebar-nav"

interface ListData {
  id: string
  uniqueId: string
  name: string
  displayName: string
  subscribersCount: number
  segmentsCount: number
  customFieldsCount: number
  subscriberBreakdown: {
    confirmed: number
    unconfirmed: number
    unsubscribed: number
    blacklisted: number
    bounces: number
  }
  optIn: string
  optOut: string
  dateAdded: string
  lastUpdated: string
}

interface TrackingStats {
  opens: number
  clicks: number
  unsubscribes: number
  complaints: number
  bounces: number
}

interface MetricCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  subtitle?: string
  color?: string
  href?: string
}

const MetricCard = ({ icon, value, label, subtitle, color = "text-blue-500", href }: MetricCardProps) => {
  const content = (
    <div className="rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg dark:bg-gray-900 bg-gray-50 ${color}`}>{icon}</div>
      </div>
      <div className="space-y-1">
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
        <div className="text-sm w-full font-medium dark:text-gray-100 text-gray-900">{label}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}

const SubscriberActivityChart = ({
  subscriberBreakdown,
  listId,
}: {
  subscriberBreakdown: ListData["subscriberBreakdown"]
  listId: string
}) => {
  const generateChartData = () => {
    try {
      const savedSubscribers = localStorage.getItem(`subscribers_${listId}`)
      const subscribersData = savedSubscribers ? JSON.parse(savedSubscribers) : []

      const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      const chartData = allDays.map((day) => ({
        day,
        confirmed: 0,
        unconfirmed: 0,
        unsubscribed: 0,
        blacklisted: 0,
        bounces: 0,
      }))

      if (subscribersData.length === 0) return chartData

      const dayGroups: { [key: string]: any } = {}

      subscribersData.forEach((subscriber: any) => {
        const date = subscriber.dateAdded ? new Date(subscriber.dateAdded) : new Date()
        const validDate = isNaN(date.getTime()) ? new Date() : date
        const dayName = validDate.toLocaleDateString("en-US", { weekday: "short" })

        if (!dayGroups[dayName]) {
          dayGroups[dayName] = { confirmed: 0, unconfirmed: 0, unsubscribed: 0, blacklisted: 0, bounces: 0 }
        }

        const status = subscriber.status?.toLowerCase() || "confirmed"
        switch (status) {
          case "confirmed":
          case "active":
            dayGroups[dayName].confirmed++
            break
          case "unconfirmed":
          case "pending":
            dayGroups[dayName].unconfirmed++
            break
          case "unsubscribed":
          case "unsubscribe":
            dayGroups[dayName].unsubscribed++
            break
          case "blacklisted":
          case "blocked":
            dayGroups[dayName].blacklisted++
            break
          case "bounces":
          case "bounce":
          case "bounced":
            dayGroups[dayName].bounces++
            break
          default:
            dayGroups[dayName].confirmed++
        }
      })

      chartData.forEach((dayData) => {
        if (dayGroups[dayData.day]) {
          dayData.confirmed = dayGroups[dayData.day].confirmed
          dayData.unconfirmed = dayGroups[dayData.day].unconfirmed
          dayData.unsubscribed = dayGroups[dayData.day].unsubscribed
          dayData.blacklisted = dayGroups[dayData.day].blacklisted
          dayData.bounces = dayGroups[dayData.day].bounces
        }
      })

      return chartData
    } catch (error) {
      console.error("Error generating chart data:", error)
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
        day,
        confirmed: 0,
        unconfirmed: 0,
        unsubscribed: 0,
        blacklisted: 0,
        bounces: 0,
      }))
    }
  }

  const chartData = generateChartData()
  const total = Object.values(subscriberBreakdown).reduce((sum, count) => sum + count, 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const hasData = payload.some((entry: any) => entry.value > 0)
      if (!hasData) return null
      return (
        <div className="p-3 border border-gray-200 rounded-lg shadow-lg bg-white">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map(
            (entry: any, index: number) =>
              entry.value > 0 && (
                <p key={index} style={{ color: entry.color }} className="text-sm">
                  {`${entry.name}: ${entry.value}`}
                </p>
              ),
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium dark:text-gray-100 text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          7 day Subscriber activity
        </h3>
        <div className="text-sm dark:text-gray-400 text-gray-600">
          Total: <span className="font-semibold dark:text-gray-100 text-gray-900">{total}</span> subscribers
        </div>
      </div>

      {total > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">{subscriberBreakdown.confirmed}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>Confirmed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500 mb-1">{subscriberBreakdown.unconfirmed}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>Unconfirmed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500 mb-1">{subscriberBreakdown.unsubscribed}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>Unsubscribed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500 mb-1">{subscriberBreakdown.blacklisted}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>Blacklisted
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-500 mb-1">{subscriberBreakdown.bounces}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>Bounces
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {subscriberBreakdown.confirmed > 0 && (
                  <Line type="monotone" dataKey="confirmed" stroke="#3b82f6" strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Confirmed" />
                )}
                {subscriberBreakdown.unconfirmed > 0 && (
                  <Line type="monotone" dataKey="unconfirmed" stroke="#eab308" strokeWidth={2}
                    dot={{ fill: "#eab308", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Unconfirmed" />
                )}
                {subscriberBreakdown.unsubscribed > 0 && (
                  <Line type="monotone" dataKey="unsubscribed" stroke="#ef4444" strokeWidth={2}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Unsubscribed" />
                )}
                {subscriberBreakdown.blacklisted > 0 && (
                  <Line type="monotone" dataKey="blacklisted" stroke="#6b7280" strokeWidth={2}
                    dot={{ fill: "#6b7280", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Blacklisted" />
                )}
                {subscriberBreakdown.bounces > 0 && (
                  <Line type="monotone" dataKey="bounces" stroke="#06b6d4" strokeWidth={2}
                    dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Bounces" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chart will be displayed here</p>
            <p className="text-sm text-gray-400">Add subscribers to see activity by day</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <div className="flex items-center space-x-4 text-sm">
          {[
            { color: "bg-blue-500", label: "Confirmed" },
            { color: "bg-yellow-500", label: "Unconfirmed" },
            { color: "bg-red-500", label: "Unsubscribed" },
            { color: "bg-gray-500", label: "Blacklisted" },
            { color: "bg-cyan-500", label: "Bounces" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3 h-3 ${color} rounded`}></div>
              <span className="text-gray-600 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params?.id as string
  const [listData, setListData] = useState<ListData | null>(null)
  const [loading, setLoading] = useState(true)
 

  const loadSubscriberData = async () => {
    try {
      const res = await fetch(
        `/api/get-all-subscribers?list_uid=${listId}&page_number=1&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
          },
        }
      )
      const data = await res.json()
      const records = data?.data?.data?.records || data?.data?.records || []

      const breakdown = {
        confirmed: 0,
        unconfirmed: 0,
        unsubscribed: 0,
        blacklisted: 0,
        bounces: 0,
      }

      records.forEach((r: any) => {
        const status = (r?.status || "confirmed").toLowerCase()
        switch (status) {
          case "confirmed": case "active": breakdown.confirmed++; break
          case "unconfirmed": case "pending": breakdown.unconfirmed++; break
          case "unsubscribed": case "unsubscribe": breakdown.unsubscribed++; break
          case "blacklisted": case "blocked": breakdown.blacklisted++; break
          case "bounces": case "bounce": case "bounced": breakdown.bounces++; break
          default: breakdown.confirmed++
        }
      })

      return { total: records.length, breakdown }
    } catch (error) {
      return {
        total: 0,
        breakdown: { confirmed: 0, unconfirmed: 0, unsubscribed: 0, blacklisted: 0, bounces: 0 },
      }
    }
  }

  const fetchSegmentsCount = async () => {
    try {
      const res = await fetch(`/api/get-all-segments?list_uid=${encodeURIComponent(listId)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
      })
      if (!res.ok) return 0
      const data = await res.json()
      return data?.data?.records?.length || 0
    } catch (error) {
      console.error("Error fetching segments count:", error)
      return 0
    }
  }

  const loadCustomFieldsCount = async () => {
    try {
      const url = new URL("/api/get-all-fields", window.location.origin)
      url.searchParams.append("list_uid", listId)
      url.searchParams.append("token", token())

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { accept: "application/json", "Content-Type": "application/json" },
      })

      const jsonData = await res.json()
      if (!res.ok) return 0

      return jsonData?.data?.data?.records?.length || 0
    } catch (error) {
      return 0
    }
  }

  const fetchListData = async () => {
    try {
      const subscriberData = await loadSubscriberData()
      const currentCustomFieldsCount = await loadCustomFieldsCount()
      const currentSegmentsCount = await fetchSegmentsCount()

      // ✅ Fetch tracking stats

      const mockData: ListData = {
        id: listId,
        uniqueId: "shyamashree",
        name: "shyamashree",
        displayName: "Shyamashree Newsletter",
        subscribersCount: subscriberData.total,
        segmentsCount: currentSegmentsCount,
        customFieldsCount: currentCustomFieldsCount,
        subscriberBreakdown: subscriberData.breakdown,
        optIn: "double",
        optOut: "single",
        dateAdded: "2024-01-15",
        lastUpdated: "2024-01-15",
      }

      setListData(mockData)
    } catch (error) {
      console.error("Error fetching list data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchListData() }, [listId])

  useEffect(() => {
    const handleFocus = () => fetchListData()
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [listId])

  useEffect(() => {
    const handleVisibilityChange = () => { if (!document.hidden) fetchListData() }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [listId])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `subscribers_${listId}`) fetchListData()
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [listId])

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-7xl">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!listData) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-7xl">
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">List not found</h2>
                <p className="text-gray-600 mb-4">The list you're looking for doesn't exist.</p>
                <Link href="/lists" className="text-blue-600 hover:text-blue-800 font-medium">
                  ← Back to Lists
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block">
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mx-auto max-w-7xl">

              {/* Header */}
              <div className="mb-4 sm:mb-6 flex items-center justify-between">
                <Link href="/lists" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Lists</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </div>

              {/* Tabs */}
              <div className="mb-4 sm:mb-6 border-b border-gray-200">
                <nav className="flex space-x-4 sm:space-x-8">
                  <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-xs sm:text-sm">
                    Overview
                  </button>
                </nav>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                <MetricCard
                  icon={<Users className="h-6 w-6" />}
                  value={listData.subscribersCount}
                  label="Subscribers"
                  color="text-blue-500"
                  href={`/lists/${listId}/subscribers`}
                />
                <MetricCard
                  icon={<Target className="h-6 w-6" />}
                  value={listData.segmentsCount}
                  label="Segments"
                  color="text-blue-500"
                  href={`/lists/${listId}/segment`}
                />
                <MetricCard
                  icon={<Settings className="h-6 w-6" />}
                  value={listData.customFieldsCount}
                  label="Custom fields"
                  color="text-blue-500"
                  href={`/lists/${listId}/custom-fields`}
                />
              </div>

              {/* Chart */}
              <div className="mb-8">
                <SubscriberActivityChart
                  subscriberBreakdown={listData.subscriberBreakdown}
                  listId={listId}
                />
              </div>

              {/* Tracking Stats 
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium dark:text-gray-100 text-gray-900 mb-6 flex items-center gap-2">
                  📊 Tracking stats averages
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                  {[
                    { icon: <Mail className="h-4 w-4 sm:h-5 sm:w-5" />, label: "Opens", value: trackingStats.opens },
                    { icon: <MousePointer className="h-4 w-4 sm:h-5 sm:w-5" />, label: "Clicks", value: trackingStats.clicks },
                    { icon: <UserMinus className="h-4 w-4 sm:h-5 sm:w-5" />, label: "Unsubscribes", value: trackingStats.unsubscribes },
                    { icon: <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />, label: "Complaints", value: trackingStats.complaints },
                    { icon: <Bounce className="h-4 w-4 sm:h-5 sm:w-5" />, label: "Bounces", value: trackingStats.bounces },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="text-center p-3 sm:p-4 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                      <div className="text-2xl sm:text-3xl font-bold dark:text-gray-100 text-gray-900 mb-1 sm:mb-2">{value}</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                        {icon}<span className="hidden sm:inline">{label}</span><span className="sm:hidden">{label.slice(0, 4)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>*/}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}