"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import SidebarNav from "@/components/sidebar-nav"
import { token } from "@/components/common/http"

interface ListData {
  id: string
  name: string
  displayName: string
}

interface SubscriberFormData {
  email: string
  firstName: string
  lastName: string
  status: "confirmed" | "unconfirmed" | "unsubscribed" | "bounced"
}

interface Subscriber {
  id: string
  uniqueId: string
  email: string
  firstName?: string
  lastName?: string
  status: "confirmed" | "unconfirmed" | "unsubscribed" | "bounced"
  dateAdded: string
  lastActivity?: string
  location?: string
  source?: string
  ipAddress?: string
  listId: string
}

export default function NewSubscriberPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const listId = params?.id as string

  const [listData, setListData] = useState<ListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<SubscriberFormData>({
    email: "",
    firstName: "",
    lastName: "",
    status: "unconfirmed",
  })

 useEffect(() => {
  const cached = JSON.parse(localStorage.getItem("cachedLists") || "{}")
  const lists = cached?.lists || []
  const found = lists.find((l: any) => l.id === listId)
  setListData({
    id: listId,
    name: found?.name || listId,
    displayName: found?.name || listId,
  })
  setLoading(false)
}, [listId])

  const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15)
  }

  const generateMockIP = () => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  }

  const handleInputChange = (field: keyof SubscriberFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const saveSubscriber = (subscriber: Subscriber) => {
    const existingSubscribers = JSON.parse(localStorage.getItem(`subscribers_${listId}`) || "[]")

    const updatedSubscribers = [...existingSubscribers, subscriber]
    localStorage.setItem(`subscribers_${listId}`, JSON.stringify(updatedSubscribers))
  }
const handleSave = async (createNew = false) => {
  if (!validateForm()) return

  setSaving(true)
  try {
    const res = await fetch(`/api/create-a-subscriber`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        list_uid: listId,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
      }),
    })

    const data = await res.json()
    const isSuccess = res.ok && data?.status === "success"

    if (!isSuccess) {
      toast({
        title: "Error",
        description: data?.message || "Failed to create subscriber",
        variant: "destructive",
      })
      return
    }

    // Add subscriber locally for immediate count update in List table
    const newSubscriber: Subscriber = {
      id: data?.data?.id ? String(data.data.id) : generateUniqueId(),
      uniqueId: data?.data?.uid ? String(data.data.uid) : generateUniqueId(),
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      status: formData.status,
      dateAdded: new Date().toISOString(),
      listId,
    }
    saveSubscriber(newSubscriber)

    // Notify listeners that a subscriber was added
    window.dispatchEvent(new CustomEvent("subscriberCreated", { detail: { listId } }))

    toast({
      title: "Success",
      description: "Subscriber created successfully",
    })

    if (createNew) {
      setFormData({ email: "", firstName: "", lastName: "", status: "unconfirmed" })
    } else {
      // ✅ 1 second delay — backend save hote time lagche
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push(`/lists/${listId}/subscribers?refresh=true`)
    }
  } catch (error) {
    console.error("Error saving subscriber:", error)
    toast({
      title: "Error",
      description: "Failed to save subscriber",
      variant: "destructive",
    })
  } finally {
    setSaving(false)
  }
}

  const handleCancel = () => {
    router.push(`/lists/${listId}/subscribers`)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
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
            <div className="mx-auto max-w-2xl">
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">List not found</h2>
                <p className="text-gray-600 mb-4">The list you're looking for doesn't exist.</p>
                <Button onClick={() => router.push("/lists")} variant="outline">
                  Back to Lists
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarNav />
      </div>

      {/* Mobile Sidebar */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mx-auto max-w-2xl">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">👥</span>
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">Add a new subscriber to your list</h1>
                </div>
                <Button onClick={handleCancel} variant="outline" disabled={saving}>
                  Cancel
                </Button>
              </div>

              {/* Form */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>

                    {/* First Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        First name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Last Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      {/* <Label htmlFor="status" className="text-sm font-medium">
                        Status
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                          <SelectItem value="bounced">Bounced</SelectItem>
                        </SelectContent>
                      </Select> */}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <Button onClick={() => handleSave(true)} disabled={saving} className="bg-blue-500 hover:bg-blue-600">
                  {saving ? "Saving..." : "Save changes and create new"}
                </Button>
                <Button onClick={() => handleSave(false)} disabled={saving} className="bg-blue-500 hover:bg-blue-600">
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
