"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Plus, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import SidebarNav from "@/components/sidebar-nav"
import Header from "@/components/common/header"
import { token } from "@/components/common/http"

interface Campaign {
  campaign_uid: string
  name: string
  type: string
  from_name: string
  from_email: string
  subject: string
  reply_to: string
  send_at: string
  list_uid: string
  url_tracking: string
  plain_text_email: string
  template_uid?: string
  content?: string
  created_at: string
  updated_at: string
}

export default function CreateCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params?.id as string

  const [campaignData, setCampaignData] = useState({
    name: "",
    type: "regular",
    from_name: "",
    from_email: "",
    subject: "",
    reply_to: "",
    send_at: "",
    list_uid: listId,
    url_tracking: "yes",
    plain_text_email: "no",
    template_uid: "",
    content: ""
  })

  const [loading, setLoading] = useState(false)

  const createCampaign = async (campaignData: any) => {
    try {
      const url = `/api/campaigns/create-a-campaign`
      console.log("Create campaign URL:", url)
      console.log("Campaign data:", campaignData)

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token: token(), // User token
          ...campaignData
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      console.log("✅ campaign created:", data)
      
      if (data.status === "success" && data.data?.campaign_uid) {
        // Store campaign in localStorage
        const campaignUid = data.data.campaign_uid
        const campaignsJson = localStorage.getItem('campaigns')
        const existingCampaigns = campaignsJson 
          ? JSON.parse(campaignsJson) 
          : []
        
        // Add new campaign to the list
        const newCampaign: Campaign = {
          campaign_uid: campaignUid,
          name: campaignData.name,
          type: campaignData.type,
          from_name: campaignData.from_name,
          from_email: campaignData.from_email,
          subject: campaignData.subject,
          reply_to: campaignData.reply_to,
          send_at: campaignData.send_at,
          list_uid: campaignData.list_uid,
          url_tracking: campaignData.url_tracking,
          plain_text_email: campaignData.plain_text_email,
          template_uid: campaignData.template_uid,
          content: campaignData.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        existingCampaigns.push(newCampaign)
        localStorage.setItem('campaigns', JSON.stringify(existingCampaigns))
        
        console.log(`✅ Campaign UID ${campaignUid} stored in localStorage`)
        
        return { success: true, data: newCampaign, campaign_uid: campaignUid }
      } else {
        return { success: false, message: 'Failed to create campaign' }
      }
    } catch (error: any) {
      console.error("❌ Error creating campaign:", error)
      return { success: false, message: (error as Error).message || 'Error creating campaign' }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    // Validate required fields
    const requiredFields = ['name', 'type', 'from_name', 'from_email', 'subject', 'reply_to', 'send_at', 'list_uid', 'url_tracking', 'plain_text_email']
    const missing = requiredFields.filter(field => !campaignData[field as keyof typeof campaignData] || String(campaignData[field as keyof typeof campaignData]).trim() === "")
    
    if (missing.length > 0) {
      alert(`Missing required fields: ${missing.join(", ")}`)
      return
    }

    setLoading(true)

    try {
      const result = await createCampaign(campaignData)
      
      if (result.success) {
        alert(`Campaign created successfully! UID: ${result.campaign_uid}`)
        router.push(`/lists/${listId}`)
      } else {
        alert(result.message || "Failed to create campaign")
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
      alert("Error creating campaign. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/lists/${listId}`)
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block">
        <SidebarNav />
      </div>
      <div className="w-full flex-1">
        <Header/>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plus className="h-5 w-5 dark:text-gray-300 text-gray-700" />
                    <h1 className="text-xl font-semibold dark:text-gray-100 text-gray-900">Create Campaign</h1>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600 text-white">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Campaign
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Campaign Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campaign Name */}
                    <div>
                      <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">
                        Campaign Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={campaignData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter campaign name"
                        className="mt-1"
                      />
                    </div>

                    {/* Campaign Type */}
                    <div>
                      <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">
                        Campaign Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={campaignData.type}
                        onValueChange={(value) => handleInputChange("type", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select campaign type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="autoresponder">Autoresponder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* From Name */}
                    <div>
                      <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">
                        From Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={campaignData.from_name}
                        onChange={(e) => handleInputChange("from_name", e.target.value)}
                        placeholder="From name"
                        className="mt-1"
                      />
                    </div>

                    {/* From Email */}
                    <div>
                      <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">
                        From Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={campaignData.from_email}
                        onChange={(e) => handleInputChange("from_email", e.target.value)}
                        placeholder="From email"
                        type="email"
                        className="mt-1"
                      />
                    </div>

                    {/* Subject */}
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">
                        Subject <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={campaignData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="Campaign subject"
                        className="mt-1"
                      />
                    </div>

                    {/* Reply To */}
                    <div>
                      <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">
                        Reply To <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={campaignData.reply_to}
                        onChange={(e) => handleInputChange("reply_to", e.target.value)}
                        placeholder="Reply to email"
                        type="email"
                        className="mt-1"
                      />
                    </div>

                    {/* Send At */}
                    <div>
                      <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">
                        Send At <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={campaignData.send_at}
                        onChange={(e) => handleInputChange("send_at", e.target.value)}
                        placeholder="YYYY-MM-DD HH:MM:SS"
                        className="mt-1"
                      />
                    </div>

                    {/* URL Tracking */}
                    <div>
                      <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">
                        URL Tracking <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={campaignData.url_tracking}
                        onValueChange={(value) => handleInputChange("url_tracking", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select URL tracking" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Plain Text Email */}
                    <div>
                      <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">
                        Plain Text Email <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={campaignData.plain_text_email}
                        onValueChange={(value) => handleInputChange("plain_text_email", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select plain text option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Template UID */}
                    <div>
                      <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">
                        Template UID
                      </Label>
                      <Input
                        value={campaignData.template_uid}
                        onChange={(e) => handleInputChange("template_uid", e.target.value)}
                        placeholder="Template UID (optional)"
                        className="mt-1"
                      />
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium dark:text-gray-300 text-gray-700">
                        Content
                      </Label>
                      <Textarea
                        value={campaignData.content}
                        onChange={(e) => handleInputChange("content", e.target.value)}
                        placeholder="Campaign content (optional)"
                        className="mt-1 min-h-[200px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
