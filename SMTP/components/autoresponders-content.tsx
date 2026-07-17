"use client"

import React, { JSX, useEffect, useState } from "react"
import { Mail, SlidersHorizontal, X, PlusCircle, Download, Upload, RotateCcw, Check, Rewind, Database, Plus, Info, Trash2, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { AnimatePresence ,motion} from "framer-motion"

export default function CampaignsContent() {
  const [activeTab, setActiveTab] = useState("All Campaigns")
  const [showToggleColumns, setShowToggleColumns] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeFormTab, setActiveFormTab] = useState("Details")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showAvailableTags, setShowAvailableTags] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [activeTagField, setActiveTagField] = useState<string>("")
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [isSourceMode, setIsSourceMode] = useState(false)
  const [showSpecialCharacterModal, setShowSpecialCharacterModal] = useState(false)
  const [showFlashModal, setShowFlashModal] = useState(false)

  // Add state for info modals
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoModalType, setInfoModalType] = useState<string>("")
  const [showUtmModal, setShowUtmModal] = useState(false)
  const [showPlainTextMode, setShowPlainTextMode] = useState(false)
  const [showRandomContentModal, setShowRandomContentModal] = useState(false)
  const [utmPattern, setUtmPattern] = useState("")
  // Add state for template modals
  const [showImportUrlModal, setShowImportUrlModal] = useState(false)
  const [showUploadTemplateModal, setShowUploadTemplateModal] = useState(false)
  const [showChangeTemplateModal, setShowChangeTemplateModal] = useState(false)
  const [showTemplateInfoModal, setShowTemplateInfoModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showAnchorModal, setShowAnchorModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [linkActiveTab, setLinkActiveTab] = useState("Link Info")
  const [imageActiveTab, setImageActiveTab] = useState("Image Info")
  const openAvailableTagsModal = () => {
    setInfoModalType("available_tags");
    setShowInfoModal(true);
  }
  interface RandomContentBlock {
    id: number;
    name: string;
    content: string;
    isSourceMode?: boolean;
  }

  const [randomContentBlocks, setRandomContentBlocks] = useState<RandomContentBlock[]>([]);

  const [linkData, setLinkData] = useState({
    displayText: "",
    linkType: "URL",
    protocol: "http://",
    url: "",
    target: "<not set>",
    frameName: "",
    popupName: "",
    popupFeatures: {
      resizable: false,
      locationBar: false,
      menuBar: false,
      scrollBars: false,
      statusBar: false,
      toolbar: false,
      fullScreen: false,
      dependent: false,
      width: "",
      height: "",
      left: "",
      top: ""
    }
  });
  const [anchorData, setAnchorData] = useState({
    anchorName: ""
  });

  const [imageData, setImageData] = useState({
    url: "",
    altText: "",
    width: "",
    height: "",
    target: "",
    border: "",
    hspace: "",
    vspace: "",
    alignment: "",
    linkUrl: "",
    linkTarget: "",
    id: "",
    langDirection: "",
    langCode: "",
    longDesc: "",
    cssClass: "",
    title: "",
    style: ""
  });
  const [flashActiveTab, setFlashActiveTab] = useState("General");
  const [flashData, setFlashData] = useState({
    url: "",
    width: "",
    height: "",
    hspace: "",
    vspace: "",
    scale: "",
    scriptAccess: "",
    windowMode: "",
    quality: "high",
    alignment: "",
    enableFlashMenu: false,
    autoPlay: false,
    loop: false,
    allowFullscreen: false,
    id: "",
    backgroundColor: "",
    cssClass: "",
    style: ""
  });
  // Add state for import form data
  const [importUrlData, setImportUrlData] = useState({
    fromUrl: "",
    autoPlainText: "Yes",
  })

  const [uploadTemplateData, setUploadTemplateData] = useState({
    archiveFile: null as File | null,
    autoPlainText: "Yes",
  })

  // Add state for user information
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    shortName: "",
  })

  const [formData, setFormData] = useState({
    campaignName: "",
    type: "Regular",
    list: "Choose",
    segment: "Choose",
    group: "Choose",
    sendGroup: "",
    subject: "",
    templateName: "",
    onlyPlainText: "No",
    autoPlainText: "Yes",
    content: "",
    fromName: "",
    fromEmail: "",
    replyTo: "",
    toName: "",
    altText: "",
    embedImages: "No",
    plainTextEmail: "Yes",
    trackingDomain: "",
    maxSubscribers: "",
    reprocessSubscribers: "No",
    emailStats: "",
    preheader: "",
    emailStatsDays: "",
    forwardFriendSubject: "",
    openTracking: "Yes",
    urlTracking: "Yes",
    deepTracking: "Yes",
    openTrackingExclude: "No",
    urlTrackingExclude: "No",
    plainTextContent: "",

    //abakash contribution
    abTEST:'No',
    winner_criteria_open:'',
    winner_criteria_operator:'',
    winner_criteria_days_count:''
    

  })

  const [visibleColumns, setVisibleColumns] = useState({
    ID: true,
    "Unique ID": true,
    "Campaign name": true,
    Type: true,
    Group: true,
    "Send group": true,
    List: true,
    Segment: true,
    Recurring: true,
    "Send at": true,
    "Started at": true,
    Status: true,
    Template: true,
    Delivered: true,
    Opens: true,
    Clicks: true,
    Bounces: true,
    Unsubs: true,
  })

  const columns: (keyof typeof visibleColumns)[] = [
    "ID",
    "Unique ID",
    "Campaign name",
    "Type",
    "Group",
    "Send group",
    "List",
    "Segment",
    "Recurring",
    "Send at",
    "Started at",
    "Status",
    "Template",
    "Delivered",
    "Opens",
    "Clicks",
    "Bounces",
    "Unsubs",
  ]

  const formTabs = ["Details", "Setup", "Template", "Confirmation"]

  // Available tags data
  const availableTags = [
    { tag: "[CURRENT_DATE]", description: "Current date" },
    { tag: "[CURRENT_YEAR]", description: "Current year" },
    { tag: "[CURRENT_MONTH]", description: "Current month" },
    { tag: "[CURRENT_DAY]", description: "Current day" },
    { tag: "[CURRENT_MONTH_FULL_NAME]", description: "Full month name" },
    { tag: "[SIGN_LT]", description: "Less than sign" },
    { tag: "[SIGN_LTE]", description: "Less than or equal sign" },
    { tag: "[SIGN_GT]", description: "Greater than sign" },
    { tag: "[SIGN_GTE]", description: "Greater than or equal sign" },
    { tag: "[REMOTE_CONTENT]", description: "Remote content" },
    { tag: "[EMAIL]", description: "Subscriber email" },
    { tag: "[NAME]", description: "Subscriber name" },
    { tag: "[FIRST_NAME]", description: "Subscriber first name" },
    { tag: "[LAST_NAME]", description: "Subscriber last name" },
  ]

  // Emoji data
  const emojiCategories = {
    "Smileys & People": [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🤩",
      "🥳",
    ],
    "Animals & Nature": [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐽",
      "🐸",
      "🐵",
      "🙈",
      "🙉",
      "🙊",
      "🐒",
      "🐔",
      "🐧",
      "🐦",
      "🐤",
      "🐣",
      "🐥",
      "🦆",
      "🦅",
      "🦉",
      "🦇",
    ],
    "Food & Drink": [
      "🍎",
      "🍐",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🫐",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🍆",
      "🥑",
      "🥦",
      "🥒",
      "🌶️",
      "🌽",
      "🥕",
      "🧄",
      "🧅",
      "🥔",
      "🍠",
      "🥐",
      "🍞",
    ],
    Activities: [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🪀",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
      "🥍",
      "🏏",
      "🪃",
      "🥅",
      "⛳",
      "🪁",
      "🏹",
      "🎣",
      "🤿",
      "🥊",
      "🥋",
      "🎽",
      "🛹",
      "🛼",
      "🛷",
    ],
    Objects: [
      "⌚",
      "📱",
      "📲",
      "💻",
      "⌨️",
      "🖥️",
      "🖨️",
      "🖱️",
      "🖲️",
      "🕹️",
      "🗜️",
      "💽",
      "💾",
      "💿",
      "📀",
      "📼",
      "📷",
      "📸",
      "📹",
      "🎥",
      "📽️",
      "🎞️",
      "📞",
      "☎️",
      "📟",
      "📠",
      "📺",
      "📻",
      "🎙️",
      "🎚️",
    ],
  }

  // Info modal data
  const infoModalData = {
    subscriber_actions: [
      { tag: "[UA_DEVICE]", description: "Set the current user browser device based on the User Agent string" },
      { tag: "[CAMPAIGN_NAME]", description: "Set the current campaign name for which this action is taken" },
      { tag: "[CAMPAIGN_UID]", description: "Set the current campaign unique id for which this action is taken" },
    ],
    extra_tags: [
      { tag: "[INCREMENT_BY_X]", description: "Increment the value by X where X is an integer" },
      { tag: "[INCREMENT_ONCE_BY_X]", description: "Increment the value by X where X is an integer. Only once" },
      { tag: "[DECREMENT_BY_X]", description: "Decrement the value by X where X is an integer" },
      { tag: "[DECREMENT_ONCE_BY_X]", description: "Decrement the value by X where X is an integer. Only once" },
      { tag: "[MULTIPLY_BY_X]", description: "Multiply the value by X where X is an integer" },
      { tag: "[MULTIPLY_ONCE_BY_X]", description: "Multiply the value by X where X is an integer. Only once" },
      { tag: "[DATETIME]", description: "Set current date and time, in Y-m-d H:i:s format" },
    ],
    campaign_attachments: {
      title: "File Upload Information",
      description:
        "You are allowed to upload up to 2 attachments. Each attachment size must be lower than 3 mb. Following file types are allowed for upload: pdf, doc, docx, xls, xlsx, ppt, pptx, zip, rar",
    },
    field_tags: [
      { tag: "[UA_OS]", description: "Set the current user operating system based on the User Agent string" },
      { tag: "[UA_ENGINE]", description: "Set the current user browser engine based on the User Agent string" },
      { tag: "[UA_DEVICE]", description: "Set the current user browser device based on the User Agent string" },
      { tag: "[GEO_CITY]", description: "Set the current user city based on IP address" },
      { tag: "[USER_AGENT]", description: "Set the current User Agent string" },
      { tag: "[UA_BROWSER]", description: "Set the current user browser based on the User Agent string" },
    ],
  }

  // Function to get shortened name
  const getShortName = (fullName: string): string => {
    if (!fullName) return ""
    const firstName = fullName.split(" ")[0]
    if (firstName.length <= 6) return firstName
    return firstName.substring(0, 5)
  }
  // ADD THESE TWO FUNCTIONS HERE:
  const wrapContentInFullHTML = (content: string): string => {
    if (!content || content.trim() === "") {
      return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title></title>
</head>
<body></body>
</html>`
    }

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title></title>
</head>
<body>${content}</body>
</html>`
  }

  const extractBodyContent = (fullHTML: string): string => {
    const bodyMatch = fullHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    return bodyMatch ? bodyMatch[1] : fullHTML
  }

  const validateCurrentTab = () => {
    const errors: Record<string, string> = {}

    if (activeFormTab === "Details") {
      if (!formData.campaignName.trim()) {
        errors.campaignName = "Campaign name is required"
      }
      if (!formData.list || formData.list === "Choose") {
        errors.list = "Please select a list"
      }
    } else if (activeFormTab === "Setup") {
      if (!formData.fromName.trim()) {
        errors.fromName = "From name is required"
      }
      if (!formData.subject.trim()) {
        errors.subject = "Subject is required"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleColumnToggle = (column: string, checked: boolean) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: checked,
    }))
  }

  const handleSaveChanges = () => {
    setShowToggleColumns(false)
  }

  const handleCreateNew = () => {
    setShowCreateForm(true)
    // Reset form data with current user info when creating new campaign
    setFormData((prev) => ({
      ...prev,
      fromName: userInfo.shortName,
      fromEmail: userInfo.email,
      replyTo: userInfo.email,
      toName: "[EMAIL]",
      altText: "Hello",
    }))
  }

  const handleCloseForm = () => {
    setShowCreateForm(false)
    setActiveFormTab("Details")
    setValidationErrors({})
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleSaveAndNext = () => {
    if (!validateCurrentTab()) {
      return
    }
    const currentIndex = formTabs.indexOf(activeFormTab)
    if (currentIndex < formTabs.length - 1) {
      setActiveFormTab(formTabs[currentIndex + 1])
    } else {
      console.log("Campaign saved:", formData)
      handleCloseForm()
    }
  }

  const handleBackButton = () => {
    const currentIndex = formTabs.indexOf(activeFormTab)
    if (currentIndex > 0) {
      setActiveFormTab(formTabs[currentIndex - 1])
      setValidationErrors({})
    } else {
      setShowCreateForm(false)
      setActiveFormTab("Details")
      setValidationErrors({})
    }
  }

  const handleTabChange = (tab: string) => {
    setValidationErrors({})
    setActiveFormTab(tab)
  }

  const handleTagClick = (tag: string) => {
    if (activeTagField) {
      const currentValue = formData[activeTagField as keyof typeof formData] as string
      handleInputChange(activeTagField, currentValue + tag)
    }
    setShowAvailableTags(false)
  }

  const handleEmojiClick = (emoji: string) => {
    if (activeTagField) {
      const currentValue = formData[activeTagField as keyof typeof formData] as string
      handleInputChange(activeTagField, currentValue + emoji)
    }
    setShowEmojiPicker(false)
  }

  const openAvailableTags = (field: string) => {
    setActiveTagField(field);
    if (field === "plainTextContent" || field === "content") {
      setInfoModalType("available_tags");
      setShowInfoModal(true);
    } else {
      setShowAvailableTags(true);
    }
  }

  const openEmojiPicker = (field: string) => {
    setActiveTagField(field)
    setShowEmojiPicker(true)
  }

  const openInfoModal = (type: string) => {
    setInfoModalType(type)
    setShowInfoModal(true)
  }

  type ListType = { id: string; name: string }
  const [availableLists, setAvailableLists] = useState<ListType[]>([])

  useEffect(() => {
    const fetchUserLists = () => {
      const cachedLists = localStorage.getItem("cachedLists")
      if (cachedLists) {
        const parsed = JSON.parse(cachedLists)
        setAvailableLists(parsed.lists || [])
      }
    }
    fetchUserLists()
  }, [])

  // Updated authentication useEffect to load user info dynamically
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const storedSession = localStorage.getItem("userSession")
        if (!storedSession) {
          console.log("❌ Client: No user session found, redirecting to authentication...")
          window.location.href = "/authentication"
          return
        }

        const session = JSON.parse(storedSession)
        const sessionAge = Date.now() - new Date(session.loginTime).getTime()
        const twentyFourHours = 24 * 60 * 60 * 1000

        if (sessionAge > twentyFourHours) {
          localStorage.removeItem("userSession")
          localStorage.removeItem("cachedLists")
          window.location.href = "/authentication"
          return
        }

        // Set user information dynamically
        const shortName = getShortName(session.name || "")
        const userEmail = session.email || ""

        setUserInfo({
          name: session.name || "",
          email: userEmail,
          shortName: shortName,
        })

        console.log("👤 Client: User session loaded:", {
          name: session.name,
          email: session.email,
          tokenType: session.tokenType,
          shortName: shortName,
        })
      } catch (error) {
        console.error("💥 Client: Error loading user session:", error)
        localStorage.removeItem("userSession")
        localStorage.removeItem("cachedLists")
        window.location.href = "/authentication"
      }
    }

    checkAuthentication()
  }, [])

  //yeha se 
  const [openFields, setOpenFields] = useState<{ id: number; field: string; value: string }[]>([]);
  const [sentFields, setSentFields] = useState<{ id: number; field: string; value: string }[]>([]);

  const addOpenField = () => {
    setOpenFields((prev) => [...prev, { id: Date.now(), field: '', value: '' }]);
  };

  const removeOpenField = (id: number) => {
    setOpenFields((prev) => prev.filter((item) => item.id !== id));
  };

  const addSentField = () => {
    setSentFields((prev) => [...prev, { id: Date.now(), field: '', value: '' }]);
  };

  const removeSentField = (id: number) => {
    setSentFields((prev) => prev.filter((item) => item.id !== id));
  };
//for Add subject Line
const [isaddSubLine,setIsAddSubLine]=useState(false)
const [addSubLine, setAddSubLine] = useState<{id:number; subject: string; open_count: number; usage_count: number }[]>([]);
  const addSubLineFn = () => {
    setAddSubLine((prev) => [...prev, { id: Date.now(), subject: '', open_count:0  ,usage_count:0}]);
  };

  const removeAddSubLineFn = (id: number) => {
    setAddSubLine((prev) => prev.filter((item) => item.id !== id));
  };



  if (showCreateForm) {

    return (
      <>
        <div className="h-screen flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b ">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <h2 className="text-lg font-medium">Create new campaign</h2>
            </div>
            <Button onClick={handleBackButton} size="sm" className="bg-black text-white dark:bg-lime-500
             dark:hover:bg-red-600 dark:hover:text-white dark:text-black hover:bg-black">
              Back
            </Button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto ">
            <div className="max-w-5xl mx-auto p-8 border border-gray-200 rounded-lg m-6  shadow-sm">
              {activeFormTab === "Details" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="campaignName" className="text-sm font-medium dark:text-gray-100 text-gray-700">
                          Campaign name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="campaignName"
                          value={formData.campaignName}
                          onChange={(e) => handleInputChange("campaignName", e.target.value)}
                          className={`mt-2 w-full h-10 ${validationErrors.campaignName ? "border-red-500" : ""}`}
                          placeholder="I.E: Weekly digest subscribers"
                        />
                        {validationErrors.campaignName && (
                          <p className="mt-1 text-sm text-red-500">{validationErrors.campaignName}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="list" className="text-sm font-medium dark:text-gray-100 text-gray-700">
                          List <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.list} onValueChange={(value) => handleInputChange("list", value)}>
                          <SelectTrigger
                            className={`mt-2 w-full h-10 ${validationErrors.list ? "border-red-500" : ""}`}
                          >
                            <SelectValue
                              placeholder={availableLists.length > 0 ? "Choose list" : "No lists available"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {availableLists.length > 0 ? (
                              availableLists.map((list) => (
                                <SelectItem key={list.id} value={list.id}>
                                  {list.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                Create a list first
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {validationErrors.list && <p className="mt-1 text-sm text-red-500">{validationErrors.list}</p>}
                      </div>

                      <div>
                        <Label htmlFor="group" className="text-sm font-medium dark:text-gray-100 text-gray-700">
                          Group
                        </Label>
                        <Select value={formData.group} onValueChange={(value) => handleInputChange("group", value)}>
                          <SelectTrigger className="mt-2 w-full h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Choose">Choose</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="type" className="text-sm font-medium dark:text-gray-100 text-gray-700">
                          Type
                        </Label>
                        <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                          <SelectTrigger className="mt-2 w-full h-10">
                            <SelectValue placeholder="Choose type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Regular">Regular</SelectItem>
                            <SelectItem value="Autoresponder">Autoresponder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="segment" className="text-sm font-medium dark:text-gray-100 text-gray-700">
                          Segment
                        </Label>
                        <Select value={formData.segment} onValueChange={(value) => handleInputChange("segment", value)}>
                          <SelectTrigger className="mt-2 w-full h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Choose">Choose</SelectItem>
                            <SelectItem value="all">All</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="sendGroup" className="text-sm font-medium dark:text-gray-100 text-gray-700">
                          Send group
                        </Label>
                        <Input
                          id="sendGroup"
                          value={formData.sendGroup}
                          onChange={(e) => handleInputChange("sendGroup", e.target.value)}
                          className="mt-2 w-full h-10"
                          placeholder="Start typing..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b mt-10 dark:bg-gray-900 bg-gray-50">
                    <div className="flex space-x-0">
                      {formTabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => handleTabChange(tab)}
                          className={`py-3 px-6 font-medium text-sm transition-colors flex items-center gap-2 border-b-3 ${activeFormTab === tab
                            ? "border-blue-500 text-blue-600 bg-blue-100 shadow-sm"
                            : "border-transparent text-gray-600 hover:text-blue-500 hover: "
                            }`}
                        >
                          {tab === "Details" && <Mail className="h-4 w-4 text-blue-500" />}
                          {tab === "Setup" && <SlidersHorizontal className="h-4 w-4 text-green-500" />}
                          {tab === "Template" && <div className="h-4 w-4 bg-purple-500 rounded"></div>}
                          {tab === "Confirmation" && <Check className="h-4 w-4 text-green-600" />}
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button onClick={handleSaveAndNext} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2">
                      Save and next
                    </Button>
                  </div>
                </div>
              )}

              {activeFormTab === "Setup" && (
                <div className="space-y-6 ">
                  <div className="">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="h-4 w-4" />
                      <h3 className="font-medium">Campaign setup</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <Label htmlFor="fromName" className="text-sm dark:text-gray-100 text-gray-700 flex items-center gap-2">
                          From name <span className="text-red-500">*</span>
                          <button
                            type="button"
                            onClick={() => openAvailableTags("fromName")}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Available tags
                          </button>
                        </Label>
                        <Input
                          id="fromName"
                          placeholder="Available tags"
                          className={`h-9 text-sm ${validationErrors.fromName ? "border-red-500" : ""}`}
                          value={formData.fromName}
                          onChange={(e) => handleInputChange("fromName", e.target.value)}
                        />
                        {validationErrors.fromName && (
                          <p className="mt-1 text-sm text-red-500">{validationErrors.fromName}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="fromEmail" className="text-sm dark:text-gray-100 text-gray-700">
                          From email *
                        </Label>
                        <Input id="fromEmail" value={formData.fromEmail} className="h-9 text-sm dark:bg-slate-800 bg-gray-50" readOnly />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="replyTo" className="text-sm dark:text-gray-100 text-gray-700">
                          Reply to *
                        </Label>
                        <Input id="replyTo" value={formData.replyTo} className="h-9 text-sm dark:bg-slate-800 bg-gray-50" readOnly />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="toName" className="text-sm dark:text-gray-100 text-gray-700 flex items-center gap-2">
                          To name
                          <button
                            type="button"
                            onClick={() => openAvailableTags("toName")}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Available tags
                          </button>
                        </Label>
                        <Input
                          id="toName"
                          placeholder="[EMAIL]"
                          className="h-9 text-sm"
                          value={formData.toName || "[EMAIL]"}
                          onChange={(e) => handleInputChange("toName", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="subject" className="text-sm dark:text-gray-100 text-gray-700 flex items-center gap-2">
                          Subject <span className="text-red-500">*</span>
                          <button
                            type="button"
                            onClick={() => openAvailableTags("subject")}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Available tags
                          </button>
                          <span className="text-gray-400">|</span>
                          <button
                            type="button"
                            onClick={() => openEmojiPicker("subject")}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Toggle emoji list
                          </button>
                        </Label>
                        <Input
                          id="subject"
                          placeholder="Available tags | Page limit filter"
                          className={`h-9 text-sm ${validationErrors.subject ? "border-red-500" : ""}`}
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                        />
                        {validationErrors.subject && (
                          <p className="mt-1 text-sm text-red-500">{validationErrors.subject}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="altText" className="text-sm dark:text-gray-100 text-gray-700">
                          AltText
                        </Label>
                        <Input
                          id="altText"
                          placeholder="Hello"
                          className="h-9 text-sm"
                          value={formData.altText || "Hello"}
                          onChange={(e) => handleInputChange("altText", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <div className="flex items-center gap-2 mb-4">
                      <SlidersHorizontal className="h-4 w-4" />
                      <h3 className="font-medium">Campaign options</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                      <div className="space-y-1">
                        <Label htmlFor="embedImages" className="text-sm dark:text-gray-100 text-gray-700">
                          Embed images *
                        </Label>
                        <Select
                          value={formData.embedImages || "No"}
                          onValueChange={(value) => handleInputChange("embedImages", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="plainTextEmail" className="text-sm dark:text-gray-100 text-gray-700">
                          Plain text email *
                        </Label>
                        <Select
                          value={formData.plainTextEmail || "Yes"}
                          onValueChange={(value) => handleInputChange("plainTextEmail", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="trackingDomain" className="text-sm dark:text-gray-100 text-gray-700">
                          Tracking domain
                        </Label>
                        <Select
                          value={formData.trackingDomain || ""}
                          onValueChange={(value) => handleInputChange("trackingDomain", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Choose" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="maxSubscribers" className="text-sm dark:text-gray-100 text-gray-700">
                          Max. subscribers
                        </Label>
                        <Input
                          id="maxSubscribers"
                          placeholder="0"
                          className="h-9 text-sm"
                          value={formData.maxSubscribers || "0"}
                          onChange={(e) => handleInputChange("maxSubscribers", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="reprocessSubscribers" className="text-sm dark:text-gray-100 text-gray-700">
                          Reprocess subscribers
                        </Label>
                        <Select
                          value={formData.reprocessSubscribers || "No"}
                          onValueChange={(value) => handleInputChange("reprocessSubscribers", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                      <div className="space-y-1">
                        <Label htmlFor="emailStats" className="text-sm dark:text-gray-100 text-gray-700">
                          Email stats show days
                        </Label>
                        <Input
                          id="emailStats"
                          placeholder="0"
                          className="h-9 text-sm"
                          value={formData.emailStatsDays || "0"}
                          onChange={(e) => handleInputChange("emailStatsDays", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <Label htmlFor="emailStatsField" className="text-sm dark:text-gray-100 text-gray-700">
                          Email stats
                        </Label>
                        <Input
                          id="emailStatsField"
                          placeholder="Email stats"
                          className="h-9 text-sm"
                          value={formData.emailStats || ""}
                          onChange={(e) => handleInputChange("emailStats", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="preheader" className="text-sm dark:text-gray-100 text-gray-700">
                          Preheader
                        </Label>
                        <Input
                          id="preheader"
                          placeholder="Preheader"
                          className="h-9 text-sm"
                          value={formData.preheader || ""}
                          onChange={(e) => handleInputChange("preheader", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="forwardFriendSubject" className="text-sm dark:text-gray-100 text-gray-700">
                          Forward friend subject
                        </Label>
                        <Input
                          id="forwardFriendSubject"
                          placeholder="Forward friend subject"
                          className="h-9 text-sm"
                          value={formData.forwardFriendSubject || ""}
                          onChange={(e) => handleInputChange("forwardFriendSubject", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="">
                    <div className="flex items-center gap-2 mb-4">
                      <SlidersHorizontal className="h-4 w-4" />
                      <h3 className="font-medium">Campaign tracking options</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-1">
                        <Label htmlFor="openTracking" className="text-sm dark:text-gray-100 text-gray-700">
                          Open tracking *
                        </Label>
                        <Select
                          value={formData.openTracking || "Yes"}
                          onValueChange={(value) => handleInputChange("openTracking", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="urlTracking" className="text-sm dark:text-gray-100 text-gray-700">
                          Url tracking *
                        </Label>
                        <Select
                          value={formData.urlTracking || "Yes"}
                          onValueChange={(value) => handleInputChange("urlTracking", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="deepTracking" className="text-sm dark:text-gray-100 text-gray-700">
                          Deep tracking from url tracking *
                        </Label>
                        <Select
                          value={formData.deepTracking || "Yes"}
                          onValueChange={(value) => handleInputChange("deepTracking", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="openTrackingExclude" className="text-sm dark:text-gray-100 text-gray-700">
                          Open tracking - Exclude crawlers *
                        </Label>
                        <Select
                          value={formData.openTrackingExclude || "No"}
                          onValueChange={(value) => handleInputChange("openTrackingExclude", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="urlTrackingExclude" className="text-sm dark:text-gray-100 text-gray-700">
                          Url tracking - Exclude crawlers *
                        </Label>
                        <Select
                          value={formData.urlTrackingExclude || "No"}
                          onValueChange={(value) => handleInputChange("urlTrackingExclude", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* a/b test  */}
                  <div className="">
                    <div className="flex items-center gap-2 mb-4">
                      <GitBranch size={20} />
                      <h3 className="font-medium">A/B Test</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-1">
                        <Label htmlFor="openTracking" className="text-sm dark:text-gray-100 text-gray-700">
                          Enabled
                        </Label>
                        <Select
                          value={formData.abTEST || "No"}
                          onValueChange={(value) => {
                            handleInputChange("abTEST", value)
                            if(formData.abTEST === 'Yes'){
                              setAddSubLine([])
                              setIsAddSubLine(false)
                            }
                            
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="winner_criteria_open" className="text-sm dark:text-gray-100 text-gray-700">
                          Winner criteria - Opens count
                        </Label>
                        <Input
                          id="winner_criteria_operator"
                          placeholder="i.e: 1000"
                          className="h-9 text-sm"
                          value={formData.winner_criteria_operator || ""}
                          onChange={(e) => handleInputChange("winner_criteria_operator", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="deepTracking" className="text-sm dark:text-gray-100 text-gray-700">
                          Winner criteria - Operator
                        </Label>
                        <Select
                          value={formData.winner_criteria_operator || "Or"}
                          onValueChange={(value) => handleInputChange("winner_criteria_operator", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Or">OR</SelectItem>
                            <SelectItem value="And">AND</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="winner_criteria_days_count" className="text-sm dark:text-gray-100 text-gray-700">
                          Winner criteria - Days count
                        </Label>
                        <Input
                          id="winner_criteria_days_count"
                          placeholder="i.e: 1000"
                          className="h-9 text-sm"
                          value={formData.winner_criteria_days_count || ""}
                          onChange={(e) => handleInputChange("winner_criteria_days_count", e.target.value)}
                        />
                      </div>
                      


                    </div>
                      {/* add subject line  */}
                      <div className="show-more-option-btn grid-cols-2 ">
                        <hr />
                        <div className="flex justify-end my-3">
                        <Button
                            variant="default"
                            className="bg-blue-500 text-white hover:bg-blue-600 mr-4 text-sm px-4 py-2"
                            onClick={() => setIsAddSubLine(!isaddSubLine)}
                            disabled={formData.abTEST === 'No'}
                            
                          >
                            <span><Plus className="w-5 h-5 scale-125" /></span> Add Subject Line
                        </Button> 
                        </div>                
                        <hr />
                      
                        {isaddSubLine && (
                          <div className="flex flex-col justify-evenly space-y-8  p-6 rounded-lg shadow-sm">

                            

                            {/* Change subscriber custom field value upon campaign open */}
                            <div className="campaign_open">
                              <div className="header flex justify-between mb-3">
                                <div className="left flex items-center gap-3">
                                  <h2 className="font-semibold dark:text-gray-100 text-gray-800">Test subject lines</h2>
                                </div>
                                <div className="right flex gap-2">
                                  <Button onClick={addSubLineFn} className="bg-blue-500 hover:bg-blue-600 text-white">
                                    <Plus className="w-5 h-5" />
                                  </Button>
                                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                    <Info className="w-5 h-5" />
                                  </Button>
                                </div>
                              </div>
                              <hr className="mb-4" />

                              <AnimatePresence>
                                {addSubLine.map((item) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex gap-4 items-center mb-3"
                                  >
                                    <div className="flex flex-col flex-1">
                                      <label  className="text-sm font-medium dark:text-gray-100 text-gray-700 mb-1">Subject *</label>
                                      <input
                                        type="text"
                                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Subject"
                                      />
                                    </div>
                                    <div className="flex flex-row flex-1 gap-2">
                                      <div className="">
                                      <label className="text-sm font-medium dark:text-gray-100 text-gray-700 mb-1">Opens count</label>
                                      <input
                                        type="text"
                                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        disabled
                                        
                                      />
                                      </div>
                                      <div className="">
                                      <label className="text-sm font-medium dark:text-gray-100 text-gray-700 mb-1">Usage count</label>
                                      <input
                                        type="text"
                                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        disabled
                                      /></div>
                                    </div>
                                    <Button onClick={() => removeAddSubLineFn(item.id)} className="bg-red-500 hover:bg-red-600 text-white mt-6">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
              
                          </div>
                          )}
                      </div>
                    
                  </div>

                  {/* show more option */}
                  <div className="show-more-option-btn ">
                    <hr />
                    <div className="flex justify-end my-3">
                    <Button
                        variant="default"
                        className="bg-blue-500 text-white hover:bg-blue-600 mr-4 text-sm px-4 py-2"
                        onClick={() => setShowMoreOptions(!showMoreOptions)}
                      >
                        {showMoreOptions ? "Hide more options" : "Show more options"}
                    </Button> 
                    </div>                
                    <hr />
                  
                  {showMoreOptions && (
                    <div className="flex flex-col justify-evenly space-y-8  p-6 rounded-lg shadow-sm">

                      {/* Previous opened/unopened campaigns */}
                      <div className="Previous_opened/unopened_campaigns">
                        <div className="heading flex items-center gap-3 mb-3">
                          <Rewind className="size-6 dark:text-gray-100 text-slate-900" />
                          <h1 className="text-lg font-semibold dark:text-gray-100 text-gray-800">Previous opened/unopened campaigns</h1>
                        </div>
                        <div className="bg-sky-500 flex items-center p-3 rounded-md mb-4">
                          <p className="text-white text-sm font-medium">
                            Send this campaign only to subscribers that have opened or have not opened previous campaigns:
                          </p>
                        </div>
                        <div className="flex gap-6">
                          <div className="flex flex-col">
                            <label htmlFor="actions" className="text-sm font-medium mb-1 dark:text-gray-100 text-gray-700">Action</label>
                            <select id="actions" defaultValue='choose' className="border border-gray-300 rounded-md px-3 py-2 w-40 focus:ring-2 focus:ring-blue-500">
                              <option value='choose' disabled>Choose</option>
                              <option value="open">Open</option>
                              <option value="unopen">Unopen</option>
                            </select>
                          </div>

                          <div className="flex flex-col flex-1">
                            <label htmlFor="previous" className="text-sm font-medium mb-1 dark:text-gray-100 text-gray-700">Previous campaign</label>
                            <input type="text" id="previous" className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500" />
                          </div>
                        </div>
                      </div>

                      {/* Change subscriber custom field value upon campaign open */}
                      <div className="campaign_open">
                        <div className="header flex justify-between mb-3">
                          <div className="left flex items-center gap-3">
                            <Database className="w-5 h-5 dark:text-gray-100 text-slate-900" />
                            <h2 className="font-semibold dark:text-gray-100 text-gray-800">Change subscriber custom field value upon campaign open</h2>
                          </div>
                          <div className="right flex gap-2">
                            <Button onClick={addOpenField} className="bg-blue-500 hover:bg-blue-600 text-white">
                              <Plus className="w-5 h-5" />
                            </Button>
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                              <Info className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                        <hr className="mb-4" />

                        <AnimatePresence>
                          {openFields.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex gap-4 items-center mb-3"
                            >
                              <div className="flex flex-col flex-1">
                                <label className="text-sm font-medium dark:text-gray-100 text-gray-700 mb-1">Field *</label>
                                <select className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                  
                                  <option value="choose" disabled>Choose</option>
                                  <option value="email">Email</option>
                                  <option value="custom">Custom Field</option>
                                </select>
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="text-sm font-medium dark:text-gray-100 text-gray-700 mb-1">Field value *</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                  placeholder="Field value"
                                />
                              </div>
                              <Button onClick={() => removeOpenField(item.id)} className="bg-red-500 hover:bg-red-600 text-white mt-6">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Change subscriber custom field value upon campaign sent */}
                      <div className="campaign_sent">
                        <div className="header flex justify-between mb-3">
                          <div className="left flex items-center gap-3">
                            <Database className="w-5 h-5 dark:text-gray-100 text-slate-900" />
                            <h2 className="font-semibold dark:text-gray-100 text-gray-800">Change subscriber custom field value upon campaign sent</h2>
                          </div>
                          <div className="right flex gap-2">
                            <Button onClick={addSentField} className="bg-blue-500 hover:bg-blue-600 text-white">
                              <Plus className="w-5 h-5" />
                            </Button>
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                              <Info className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                        <hr className="mb-4" />

                        <AnimatePresence>
                          {sentFields.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex gap-4 items-center mb-3"
                            >
                              <div className="flex flex-col flex-1">
                                <label className="text-sm font-medium dark:text-gray-100 text-gray-700 mb-1">Field *</label>
                                <select className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                  <option>Choose</option>
                                  <option value="name">Name</option>
                                  <option value="email">Email</option>
                                  <option value="custom">Custom Field</option>
                                </select>
                              </div>
                              <div className="flex flex-col flex-1">
                                <label className="text-sm font-medium dark:text-gray-100 text-gray-700 mb-1">Field value *</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                  placeholder="Field value"
                                />
                              </div>
                              <Button onClick={() => removeSentField(item.id)} className="bg-red-500 hover:bg-red-600 text-white mt-6">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                    )}
                  </div>

                  <div className="border-b mt-10  rounded-md">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-0">
                        {formTabs.map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveFormTab(tab)}
                            className={`py-3 px-6 font-medium text-sm transition-colors flex items-center gap-2 border-b-3 ${activeFormTab === tab
                              ? "border-blue-500 text-blue-600 bg-blue-100 shadow-sm"
                              : "border-transparent text-gray-600 hover:text-blue-500 hover: "
                              }`}
                          >
                            {tab === "Details" && <Mail className="h-4 w-4 text-blue-500" />}
                            {tab === "Setup" && <SlidersHorizontal className="h-4 w-4 text-green-500" />}
                            {tab === "Template" && <div className="h-4 w-4 bg-purple-500 rounded"></div>}
                            {tab === "Confirmation" && <Check className="h-4 w-4 text-green-600" />}
                            {tab}
                          </button>
                        ))}
                      </div>
                      {activeFormTab === "Setup" && (
                        <div className="flex justify-end my-3 ">
                          <Button onClick={handleSaveAndNext} className="bg-blue-500 hover:bg-blue-600 text-white px-6 mr-3">
                            Save and next
                          </Button>
                        </div>
                        
                      )}
                    </div>
                  </div>
                  
                </div>
              )}

              {activeFormTab === "Template" && (
                <div className="space-y-6">
                  <div className="">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <h3 className="font-medium">Campaign template</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          className="bg-blue-500 text-white hover:bg-blue-600 text-xs px-3 py-1 h-8"
                          onClick={() => setShowImportUrlModal(true)}
                        >
                          Import html from url
                        </Button>
                        <Button
                          variant="default"
                          className="bg-blue-500 text-white hover:bg-blue-600 text-xs px-3 py-1 h-8"
                          onClick={() => setShowUploadTemplateModal(true)}
                        >
                          Upload template
                        </Button>
                        <Button
                          variant="default"
                          className="bg-blue-500 text-white hover:bg-blue-600 text-xs px-3 py-1 h-8"
                          onClick={() => setShowChangeTemplateModal(true)}
                        >
                          Change/Select template
                        </Button>

                        <Button
                          variant="default"
                          className="bg-blue-500 text-white hover:bg-blue-600 text-xs px-3 py-1 h-8"
                          onClick={handleCloseForm}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="space-y-1">
                        <Label htmlFor="templateName" className="text-sm dark:text-gray-100 text-gray-700">
                          Template name
                        </Label>
                        <Input
                          id="templateName"
                          placeholder="Template name"
                          className="h-9 text-sm"
                          value={formData.templateName || ""}
                          onChange={(e) => handleInputChange("templateName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="onlyPlainText" className="text-sm dark:text-gray-100 text-gray-700">
                          Only plain text <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.onlyPlainText || "No"}
                          onValueChange={(value) => handleInputChange("onlyPlainText", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="autoPlainText" className="text-sm dark:text-gray-100 text-gray-700">
                          Auto plain text <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.autoPlainText || "Yes"}
                          onValueChange={(value) => handleInputChange("autoPlainText", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-gray-700 dark:text-gray-100 flex items-center gap-2">
                          Content
                          <button
                            type="button"
                            onClick={() => {
                              setInfoModalType("available_tags");
                              setShowInfoModal(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            [Available tags]
                          </button>
                        </Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            className="bg-blue-500 text-white hover:bg-blue-600 text-xs px-3 py-1 h-7"
                          >
                            Toggle template builder
                          </Button>
                          <button
                            type="button"
                            onClick={() => openInfoModal("template_help")}
                            className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600"
                          >
                            ℹ
                          </button>
                        </div>
                      </div>

                      <div className="border border-gray-300 rounded overflow-hidden ">
                        {/* Toolbar remains the same */}
                        <div className=" border-b border-gray-300 shadow-sm">
                          <div className="flex items-center px-3 py-2 gap-1">
                            <button
                              className={`h-7 px-2 text-xs border rounded-sm ${isSourceMode
                                ? "bg-blue-500 text-white border-blue-500"
                                : " text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`} 
                              onClick={() => {
                                if (!isSourceMode) {
                                  const fullHTML = wrapContentInFullHTML(formData.content)
                                  handleInputChange("content", fullHTML)
                                  setIsSourceMode(true)
                                } else {
                                  const bodyContent = extractBodyContent(formData.content)
                                  handleInputChange("content", bodyContent)
                                  setIsSourceMode(false)
                                }
                              }}
                            >
                              📄 Source
                            </button>

                            <div className=" border-b border-gray-300 shadow-sm">
                              <div className="flex items-center px-3 py-2 gap-1">
                                {/* Font Dropdowns */}
                                <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
                                  <select
                                    className="h-7 px-2 text-xs border border-gray-300  rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[90px]"
                                    disabled={isSourceMode}
                                    onChange={(e) => document.execCommand("fontName", false, e.target.value)}
                                  >
                                    <option value="Arial">Arial</option>
                                    <option value="Calibri">Calibri</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Helvetica">Helvetica</option>
                                  </select>

                                  <select
                                    className="h-7 px-2 text-xs border border-gray-300   rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-12"
                                    disabled={isSourceMode}
                                    onChange={(e) => document.execCommand("fontSize", false, e.target.value)}
                                  >
                                    <option value="1">8</option>
                                    <option value="2">10</option>
                                    <option value="3">12</option>
                                    <option value="4">14</option>
                                    <option value="5">18</option>
                                    <option value="6">24</option>
                                    <option value="7">26</option>
                                    <option value="8">28</option>
                                  </select>
                                </div>

                                {/* Bold, Italic, Underline */}
                                <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300">
                                  <button
                                    className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm font-bold rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => document.execCommand("bold", false, undefined)}
                                    title="Bold"
                                  >
                                    B
                                  </button>
                                  <button
                                    className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm italic rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => document.execCommand("italic", false, undefined)}
                                    title="Italic"
                                  >
                                    I
                                  </button>
                                  <button
                                    className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm underline rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => document.execCommand("underline", false, undefined)}
                                    title="Underline"
                                  >
                                    U
                                  </button>
                                  <button
                                    className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-center text-xs rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => setShowSpecialCharacterModal(true)}
                                    title="Special Characters"
                                  >
                                    Ω
                                  </button>
                                  {showSpecialCharacterModal && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                      <div className="  rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                                          <h3 className="text-lg font-medium text-gray-900">Select Special Character</h3>
                                          <button
                                            onClick={() => setShowSpecialCharacterModal(false)}
                                            className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
                                          >
                                            ×
                                          </button>
                                        </div>

                                        <div className="p-4 max-h-96 overflow-y-auto">
                                          <div className="grid grid-cols-12 gap-1 text-center">
                                            {/* Row 1 */}
                                            {['!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ','].map((char, i) => (
                                              <button
                                                key={`row1-${i}`}
                                                className="h-8 w-8 border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm"
                                                onClick={() => {
                                                  const editor = document.querySelector('div[contenteditable="true"]');
                                                  if (editor) {
                                                    (editor as HTMLElement).focus();
                                                    document.execCommand('insertText', false, char);
                                                    const content = editor.innerHTML;
                                                    handleInputChange('content', content);
                                                  }
                                                  setShowSpecialCharacterModal(false);
                                                }}
                                              >
                                                {char}
                                              </button>
                                            ))}

                                            {/* Row 2 */}
                                            {['-', '.', '/', '0', '1', '2', '3', '4', '5', '6', '7', '8'].map((char, i) => (
                                              <button
                                                key={`row2-${i}`}
                                                className="h-8 w-8 border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm"
                                                onClick={() => {
                                                  const editor = document.querySelector('div[contenteditable="true"]');
                                                  if (editor) {
                                                    (editor as HTMLElement).focus();
                                                    document.execCommand('insertText', false, char);
                                                    const content = editor.innerHTML;
                                                    handleInputChange('content', content);
                                                  }
                                                  setShowSpecialCharacterModal(false);
                                                }}
                                              >
                                                {char}
                                              </button>
                                            ))}

                                            {/* Row 3 */}
                                            {['9', ':', ';', '<', '=', '>', '?', '@', 'A', 'B', 'C', 'D'].map((char, i) => (
                                              <button
                                                key={`row3-${i}`}
                                                className="h-8 w-8 border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm"
                                                onClick={() => {
                                                  const editor = document.querySelector('div[contenteditable="true"]');
                                                  if (editor) {
                                                    (editor as HTMLElement).focus();
                                                    document.execCommand('insertText', false, char);
                                                    const content = editor.innerHTML;
                                                    handleInputChange('content', content);
                                                  }
                                                  setShowSpecialCharacterModal(false);
                                                }}
                                              >
                                                {char}
                                              </button>
                                            ))}

                                            {/* Row 4 */}
                                            {['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'].map((char, i) => (
                                              <button
                                                key={`row4-${i}`}
                                                className="h-8 w-8 border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm"
                                                onClick={() => {
                                                  const editor = document.querySelector('div[contenteditable="true"]');
                                                  if (editor) {
                                                    (editor as HTMLElement).focus();
                                                    document.execCommand('insertText', false, char);
                                                    const content = editor.innerHTML;
                                                    handleInputChange('content', content);
                                                  }
                                                  setShowSpecialCharacterModal(false);
                                                }}
                                              >
                                                {char}
                                              </button>
                                            ))}

                                            {/* Special characters like in image */}
                                            {['Ω', '€', '£', '¥', '©', '®', '™', '°', '±', '²', '³', '¼'].map((char, i) => (
                                              <button
                                                key={`special-${i}`}
                                                className="h-8 w-8 border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm"
                                                onClick={() => {
                                                  const editor = document.querySelector('div[contenteditable="true"]');
                                                  if (editor) {
                                                    (editor as HTMLElement).focus();
                                                    document.execCommand('insertText', false, char);
                                                    const content = editor.innerHTML;
                                                    handleInputChange('content', content);
                                                  }
                                                  setShowSpecialCharacterModal(false);
                                                }}
                                              >
                                                {char}
                                              </button>
                                            ))}

                                            {['½', '¾', 'µ', 'Á', 'À', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'É'].map((char, i) => (
                                              <button
                                                key={`special2-${i}`}
                                                className="h-8 w-8 border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm"
                                                onClick={() => {
                                                  const editor = document.querySelector('div[contenteditable="true"]');
                                                  if (editor) {
                                                    (editor as HTMLElement).focus();
                                                    document.execCommand('insertText', false, char);
                                                    const content = editor.innerHTML;
                                                    handleInputChange('content', content);
                                                  }
                                                  setShowSpecialCharacterModal(false);
                                                }}
                                              >
                                                {char}
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                                          <button
                                            onClick={() => setShowSpecialCharacterModal(false)}
                                            className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-700 rounded"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {/* Alignment - Exact Word Icons */}
                                <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300">
                                  <button
                                    className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-center rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => document.execCommand("justifyLeft", false, undefined)}
                                    title="Align Left"
                                  >
                                    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
                                      <rect x="0" y="0" width="14" height="1.5" />
                                      <rect x="0" y="2.5" width="10" height="1.5" />
                                      <rect x="0" y="5" width="12" height="1.5" />
                                      <rect x="0" y="7.5" width="8" height="1.5" />
                                    </svg>
                                  </button>

                                  <button
                                    className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-center rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => document.execCommand("justifyCenter", false, undefined)}
                                    title="Center"
                                  >
                                    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
                                      <rect x="0" y="0" width="14" height="1.5" />
                                      <rect x="2" y="2.5" width="10" height="1.5" />
                                      <rect x="1" y="5" width="12" height="1.5" />
                                      <rect x="3" y="7.5" width="8" height="1.5" />
                                    </svg>
                                  </button>

                                  <button
                                    className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-center rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => document.execCommand("justifyRight", false, undefined)}
                                    title="Align Right"
                                  >
                                    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
                                      <rect x="0" y="0" width="14" height="1.5" />
                                      <rect x="4" y="2.5" width="10" height="1.5" />
                                      <rect x="2" y="5" width="12" height="1.5" />
                                      <rect x="6" y="7.5" width="8" height="1.5" />
                                    </svg>
                                  </button>

                                  <button
                                    className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-center rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => document.execCommand("justifyFull", false, undefined)}
                                    title="Justify"
                                  >
                                    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
                                      <rect x="0" y="0" width="14" height="1.5" />
                                      <rect x="0" y="2.5" width="14" height="1.5" />
                                      <rect x="0" y="5" width="14" height="1.5" />
                                      <rect x="0" y="7.5" width="10" height="1.5" />
                                    </svg>
                                  </button>
                                </div>
                                {/* Lists */}
                                <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300">
                                  <button
                                    className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-center text-sm rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => {
                                      const editor = document.querySelector('div[contenteditable="true"]');
                                      if (editor) {
                                        (editor as HTMLElement).focus();

                                        const selection = window.getSelection();
                                        if (selection && selection.rangeCount > 0) {
                                          const range = selection.getRangeAt(0);
                                          const listHTML = '<ul style="margin-left: 20px; list-style-type: disc;"><li style="display: list-item;"></li></ul>';
                                          range.deleteContents();
                                          range.insertNode(range.createContextualFragment(listHTML));

                                          // Position cursor inside the li
                                          const newLi = editor.querySelector('ul li:last-child');
                                          if (newLi) {
                                            const newRange = document.createRange();
                                            newRange.selectNodeContents(newLi);
                                            newRange.collapse(false);
                                            selection.removeAllRanges();
                                            selection.addRange(newRange);
                                          }

                                          setTimeout(() => {
                                            handleInputChange("content", editor.innerHTML);
                                          }, 10);
                                        }
                                      }
                                    }}
                                    title="Bullet Points"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                      <circle cx="2" cy="2" r="1" fill="currentColor" />
                                      <rect x="4" y="1.5" width="6" height="1" fill="currentColor" />
                                      <circle cx="2" cy="6" r="1" fill="currentColor" />
                                      <rect x="4" y="5.5" width="6" height="1" fill="currentColor" />
                                      <circle cx="2" cy="10" r="1" fill="currentColor" />
                                      <rect x="4" y="9.5" width="6" height="1" fill="currentColor" />
                                    </svg>
                                  </button>

                                  <button
                                    className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-center text-xs rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => {
                                      const editor = document.querySelector('div[contenteditable="true"]');
                                      if (editor) {
                                        (editor as HTMLElement).focus();

                                        const selection = window.getSelection();
                                        if (selection && selection.rangeCount > 0) {
                                          const range = selection.getRangeAt(0);
                                          const listHTML = '<ol style="margin-left: 20px; list-style-type: decimal; padding-left: 0;"><li style="display: list-item; margin-left: 0;"></li></ol><br>';
                                          range.deleteContents();
                                          range.insertNode(range.createContextualFragment(listHTML));

                                          // Position cursor inside the li
                                          const newLi = editor.querySelector('ol li:last-child');
                                          if (newLi) {
                                            const newRange = document.createRange();
                                            newRange.selectNodeContents(newLi);
                                            newRange.collapse(false);
                                            selection.removeAllRanges();
                                            selection.addRange(newRange);
                                          }

                                          setTimeout(() => {
                                            handleInputChange("content", editor.innerHTML);
                                          }, 10);
                                        }
                                      }
                                    }}
                                    title="Numbered List"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                      <text x="1" y="3" fontSize="3" fill="currentColor">1.</text>
                                      <rect x="4" y="1.5" width="6" height="1" fill="currentColor" />
                                      <text x="1" y="7" fontSize="3" fill="currentColor">2.</text>
                                      <rect x="4" y="5.5" width="6" height="1" fill="currentColor" />
                                      <text x="1" y="11" fontSize="3" fill="currentColor">3.</text>
                                      <rect x="4" y="9.5" width="6" height="1" fill="currentColor" />
                                    </svg>
                                  </button>
                                </div>
                                {/* Link, Flag, Image buttons */}
                                <div className="flex items-center gap-1">
                                  <button
                                    className="h-7 px-2   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-xs rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => setShowLinkModal(true)}
                                    title="Insert Link"
                                  >
                                    🔗
                                  </button>
                                  <button
                                    className="h-7 px-2   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-xs rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => setShowAnchorModal(true)}
                                    title="Insert Anchor"
                                  >
                                    🏴
                                  </button>
                                  <button
                                    className="h-7 px-2   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-xs rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => setShowImageModal(true)}
                                    title="Insert Image"
                                  >
                                    🖼️
                                  </button>
                                  <button
                                    className="h-7 px-2   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 text-xs rounded focus:outline-none"
                                    disabled={isSourceMode}
                                    onClick={() => setShowFlashModal(true)}
                                    title="Insert Flash"
                                  >
                                    ⚡
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Second Row - Dropdowns */}
                          <div className="flex items-center px-2 py-1 gap-2">
                            <select
                              className="h-7 px-2 text-xs border border-gray-300 rounded-sm"
                              disabled={isSourceMode}
                              onChange={(e) => document.execCommand("formatBlock", false, e.target.value)}
                            >
                              <option value="">Styles</option>
                              <option value="h1">Heading 1</option>
                              <option value="h2">Heading 2</option>
                              <option value="p">Paragraph</option>
                            </select>

                            <select
                              className="h-7 px-2 text-xs border border-gray-300   rounded-sm"
                              disabled={isSourceMode}
                              onChange={(e) => document.execCommand("fontName", false, e.target.value)}
                            >
                              <option>Font</option>
                              <option value="Arial">Arial</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="Times New Roman">Times New Roman</option>
                            </select>

                            <select
                              className="h-7 px-2 text-xs border border-gray-300   rounded-sm w-16"
                              disabled={isSourceMode}
                              onChange={(e) => document.execCommand("fontSize", false, e.target.value)}
                            >
                              <option>Size</option>
                              <option value="1">8pt</option>
                              <option value="2">10pt</option>
                              <option value="3">12pt</option>
                              <option value="4">14pt</option>
                              <option value="5">18pt</option>
                            </select>

                            <div className="flex items-center gap-1 ml-2">
                              <button
                                className="h-7 w-7   border border-gray-300  dark:hover:bg-gray-600 hover:bg-gray-50 text-sm"
                                disabled={isSourceMode}
                              >
                                A
                              </button>
                              <input
                                type="color"
                                className="w-6 h-4 border border-gray-300 cursor-pointer"
                                disabled={isSourceMode}
                                onChange={(e) => document.execCommand("foreColor", false, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* FIXED EDITOR CONTENT */}
                        <div className="min-h-[400px] ">
                          {isSourceMode ? (
                            <textarea
                              className="min-h-[400px] w-full outline-none text-sm focus:outline-none p-4 font-mono resize-none border-none"
                              style={{
                                fontSize: "13px",
                                lineHeight: "1.6",
                                fontFamily: "Monaco, Consolas, 'Courier New', monospace",
                                minHeight: "400px",
                                color: "#000",
                              }}
                              value={formData.content || ""}
                              onChange={(e) => handleInputChange("content", e.target.value)}
                              placeholder="Enter HTML source code here..."
                            />
                          ) : (
                            <div className="min-h-[400px] w-full relative">
                              {(!formData.content || formData.content.trim() === "") && (
                                <div
                                  className="absolute inset-4 text-gray-400 italic pointer-events-none"
                                  style={{ fontSize: "13px", lineHeight: "1.6" }}
                                >
                                  Start typing your email content here...
                                </div>
                              )}
                              <div
                                ref={(el) => {
                                  if (el && !isSourceMode) {
                                    // **Fixed typing issue**: Used a ref callback to manage innerHTML updates and preserve cursor position
                                    if (el.innerHTML !== (formData.content || "")) {
                                      const selection = window.getSelection()
                                      const range = selection?.rangeCount ? selection.getRangeAt(0) : null
                                      const startOffset = range?.startOffset || 0
                                      const endOffset = range?.endOffset || 0
                                      const startContainer = range?.startContainer

                                      el.innerHTML = formData.content || ""

                                      // Restore cursor position
                                      if (range && startContainer) {
                                        try {
                                          const newRange = document.createRange()
                                          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)

                                          let currentOffset = 0
                                          let targetNode = null
                                          let node

                                          while ((node = walker.nextNode())) {
                                            const nodeLength = node.textContent?.length || 0
                                            if (currentOffset + nodeLength >= startOffset) {
                                              targetNode = node
                                              break
                                            }
                                            currentOffset += nodeLength
                                          }

                                          if (targetNode) {
                                            const relativeOffset = Math.min(
                                              startOffset - currentOffset,
                                              targetNode.textContent?.length || 0,
                                            )
                                            newRange.setStart(targetNode, relativeOffset)
                                            newRange.setEnd(
                                              targetNode,
                                              Math.min(endOffset - currentOffset, targetNode.textContent?.length || 0),
                                            )
                                            selection?.removeAllRanges()
                                            selection?.addRange(newRange)
                                          }
                                        } catch (e) {
                                          // Fallback: place cursor at end
                                          const newRange = document.createRange()
                                          newRange.selectNodeContents(el)
                                          newRange.collapse(false)
                                          selection?.removeAllRanges()
                                          selection?.addRange(newRange)
                                        }
                                      }
                                    }
                                  }
                                }}
                                contentEditable
                                suppressContentEditableWarning={true}
                                dir="ltr"
                                className="min-h-[400px] w-full outline-none p-4"
                                style={{
                                  border: "none",
                                  fontSize: "13px",
                                  lineHeight: "1.6",
                                  fontFamily: "Arial, sans-serif",
                                  minHeight: "400px",
                                  color: "#000",
                                  direction: "ltr",
                                  textAlign: "left",
                                }}
                                onInput={(e) => {
                                  const htmlContent = e.currentTarget.innerHTML
                                  handleInputChange("content", htmlContent)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const selection = window.getSelection();
                                    const range = selection?.getRangeAt(0);
                                    const currentElement = range?.startContainer;

                                    // Check if we're inside a list item
                                    let listItem: Element | null = null;

                                    if (currentElement?.nodeType === Node.ELEMENT_NODE) {
                                      listItem = (currentElement as Element).closest('li');
                                    } else if (currentElement?.parentElement) {
                                      listItem = currentElement.parentElement.closest('li');
                                    }

                                    if (listItem) {
                                      e.preventDefault();

                                      // Check if it's in ol (numbered) or ul (bulleted)
                                      const list = listItem.closest('ol, ul');
                                      if (list) {
                                        // Create new list item
                                        const newLi = document.createElement('li');
                                        newLi.style.cssText = 'display: list-item; margin-left: 0;';

                                        // Insert after current li
                                        listItem.parentNode?.insertBefore(newLi, listItem.nextSibling);

                                        // Move cursor to new li
                                        const newRange = document.createRange();
                                        newRange.selectNodeContents(newLi);
                                        newRange.collapse(true);
                                        selection?.removeAllRanges();
                                        selection?.addRange(newRange);

                                        // Update content
                                        const editor = e.currentTarget;
                                        setTimeout(() => {
                                          handleInputChange("content", editor.innerHTML);
                                        }, 10);

                                        return;
                                      }
                                    }

                                    // Default behavior for non-list items
                                    if (!e.shiftKey) {
                                      e.preventDefault();
                                      document.execCommand("insertHTML", false, "<br><br>");
                                    }
                                  }
                                }}
                                onFocus={(e) => {
                                  // Ensure cursor behaves properly
                                  const selection = window.getSelection()
                                  if (selection && selection.rangeCount === 0) {
                                    const range = document.createRange()
                                    range.selectNodeContents(e.currentTarget)
                                    range.collapse(true)
                                    selection.addRange(range)
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* UTM Modal */}
                  {showUtmModal && (
                    <div className="fixed inset-0 bg-white bg-opacity-50 mt-[-10rem] h-[100vh] flex items-center justify-center z-50">
                      <div className=" rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                        <div className="flex items-center justify-between p-4  border-b">
                          <h3 className="text-lg font-medium dark:text-gray-50 text-gray-900">Google UTM tags pattern</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowUtmModal(false)}
                            className="h-8 w-8 p-0 dark:hover:bg-red-600 hover:bg-gray-200"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="p-4">
                          <p className="text-sm dark:text-gray-300 text-gray-600 mb-4">
                            After you insert your UTM tags pattern, each link from your email template will be transformed and this pattern will be appended to the tracking. Beside all the regular template tags, following special tags are also recognized:
                          </p>

                          {/* Table Layout */}
                          <div className="border border-gray-300 rounded mb-4">
                            <div className="bg-gray-50 dark:bg-gray-950 border-b border-gray-300 flex">
                              <div className="flex-1 p-2 border-r border-gray-300">
                                <span className="font-medium text-sm">Tag</span>
                              </div>
                              <div className="flex-1 p-2">
                                <span className="font-medium text-sm">Description</span>
                              </div>
                            </div>
                            <div className="flex">
                              <div className="flex-1 p-2 border-r border-gray-300">
                                <span className="font-mono text-sm text-blue-600">[TITLE_ATTR]</span>
                              </div>
                              <div className="flex-1 p-2">
                                <span className="text-sm  text-gray-500">Will use the title attribute of the element</span>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Example pattern:</label>
                            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-300 rounded p-3 text-xs font-mono break-all dark:text-gray-400 text-gray-700">
                              ?utm_source=[CAMPAIGN_NAME]&utm_medium=email&utm_campaign=[CAMPAIGN_UID]&utm_content=[TITLE_ATTR]
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Insert your pattern:</label>
                            <textarea
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20 resize-none"
                              value={utmPattern}
                              onChange={(e) => setUtmPattern(e.target.value)}
                              placeholder=""
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t dark:bg-gray-950 bg-gray-50">
                          <Button
                            variant="outline"
                            onClick={() => setShowUtmModal(false)}
                            className="text-gray-500 border-gray-300 dark:hover:bg-red-500 hover:bg-gray-100"
                          >
                            Close
                          </Button>
                          <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => {
                              console.log("UTM Pattern saved:", utmPattern)
                              setShowUtmModal(false)
                            }}
                          >
                            Parse links and add pattern
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {showPlainTextMode && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-700">Plain text</h4>
                          <button
                            type="button"
                            onClick={() => {
                              setInfoModalType("available_tags");
                              setShowInfoModal(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            [Available tags]
                          </button>
                        </div>
                        <button
                          onClick={() => setShowPlainTextMode(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="border border-blue-300 rounded">
                        <textarea
                          className="w-full h-48 p-3 text-sm resize-none border-none outline-none focus:outline-none"
                          placeholder="Plain text version will appear here..."
                          value={formData.plainTextContent || ''}
                          onChange={(e) => handleInputChange("plainTextContent", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  {/* Random Content Modal */}
                  {/* Random Content Section - inline like plain text */}
                  {showRandomContentModal && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium dark:text-gray-100 text-gray-900">Random content blocks</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            className="bg-blue-500 text-white hover:bg-blue-600 w-8 h-8 p-0 rounded-md flex items-center justify-center"
                            onClick={() => {
                              setRandomContentBlocks([...randomContentBlocks, { id: Date.now(), name: '', content: '', isSourceMode: false }])
                            }}
                          >
                            +
                          </Button>
                          <Button
                            variant="default"
                            className="bg-blue-500 text-white hover:bg-blue-600 w-8 h-8 p-0 rounded-md flex items-center justify-center"
                            onClick={() => {
                              setInfoModalType("random_content");
                              setShowInfoModal(true);
                            }}
                          >
                            ℹ
                          </Button>
                          <button
                            onClick={() => setShowRandomContentModal(false)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto">
                        {randomContentBlocks.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 border border-gray-300 rounded">
                            No random content blocks yet. Click + to add one.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {randomContentBlocks.map((block, index) => (
                              <div key={block.id} className="border border-gray-300 rounded-lg overflow-hidden">
                                {/* Fixed Header with delete button on right */}
                                <div className="bg-gray-50 dark:bg-gray-950 p-3 border-b flex items-center justify-between">
                                  <span className="text-sm font-medium text-blue-600">Name *</span>
                                  <button
                                    className="w-6 h-6 text-red-500 hover:text-red-700 flex items-center justify-center rounded hover:bg-red-50"
                                    onClick={() => {
                                      const newBlocks = randomContentBlocks.filter((_, i) => i !== index)
                                      setRandomContentBlocks(newBlocks)
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>

                                <div className="p-3">
                                  <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3"
                                    placeholder="Name"
                                    value={block.name}
                                    onChange={(e) => {
                                      const newBlocks = [...randomContentBlocks]
                                      newBlocks[index].name = e.target.value
                                      setRandomContentBlocks(newBlocks)
                                    }}
                                  />

                                  <label className="block text-sm font-medium dark:text-gray-100 text-gray-700 mb-2">Content *</label>

                                  {/* Fully Functional Toolbar */}
                                  <div className="bg-gray-50 dark:bg-gray-950 border border-gray-300 rounded-t">
                                    <div className="flex items-center px-3 py-2 gap-1">
                                      {/* Source Mode Toggle */}
                                      <button
                                        className={`h-7 px-2 text-xs border rounded-sm ${block.isSourceMode
                                          ? "bg-blue-500 text-white border-blue-500"
                                          : "  text-gray-700 border-gray-300 hover:bg-gray-50"
                                          }`}
                                        onClick={() => {
                                          const newBlocks = [...randomContentBlocks]
                                          if (!block.isSourceMode) {
                                            // Switch to source mode - wrap content in HTML if needed
                                            const fullHTML = wrapContentInFullHTML(block.content)
                                            newBlocks[index].content = fullHTML
                                            newBlocks[index].isSourceMode = true
                                          } else {
                                            // Switch back to visual mode - extract body content
                                            const bodyContent = extractBodyContent(block.content)
                                            newBlocks[index].content = bodyContent
                                            newBlocks[index].isSourceMode = false
                                          }
                                          setRandomContentBlocks(newBlocks)
                                        }}
                                      >
                                        📄 Source
                                      </button>

                                      {/* Font Family */}
                                      <select
                                        className="h-7 px-2 text-xs border border-gray-300   rounded"
                                        disabled={block.isSourceMode}
                                        onChange={(e) => {
                                          const editor = document.querySelector(`#random-editor-${index}`) as HTMLDivElement | null;
                                          if (editor) {
                                            editor.focus()
                                            document.execCommand('fontName', false, e.target.value)
                                            setTimeout(() => {
                                              const newBlocks = [...randomContentBlocks]
                                              newBlocks[index].content = editor.innerHTML
                                              setRandomContentBlocks(newBlocks)
                                            }, 10)
                                          }
                                        }}
                                      >
                                        <option value="Arial">Arial</option>
                                        <option value="Helvetica">Helvetica</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Calibri">Calibri</option>
                                      </select>

                                      {/* Font Size */}
                                      <select
                                        className="h-7 px-2 text-xs border border-gray-300   rounded w-12"
                                        disabled={block.isSourceMode}
                                        onChange={(e) => {
                                          const editor = document.querySelector(`#random-editor-${index}`) as HTMLDivElement | null;
                                          if (editor) {
                                            editor.focus()
                                            document.execCommand('fontSize', false, e.target.value)
                                            setTimeout(() => {
                                              const newBlocks = [...randomContentBlocks]
                                              newBlocks[index].content = editor.innerHTML
                                              setRandomContentBlocks(newBlocks)
                                            }, 10)
                                          }
                                        }}
                                      >
                                        <option value="1">8</option>
                                        <option value="2">10</option>
                                        <option value="3">12</option>
                                        <option value="4">14</option>
                                        <option value="5">16</option>
                                        <option value="6">18</option>
                                      </select>

                                      {/* Formatting Buttons */}
                                      <button
                                        className="h-7 w-7 dark:hover:bg-gray-800 border border-gray-300 hover:bg-gray-50 text-sm font-bold rounded"
                                        disabled={block.isSourceMode}
                                        onClick={() => {
                                          const editor = document.querySelector(`#random-editor-${index}`) as HTMLDivElement | null;
                                          if (editor) {
                                            editor.focus()
                                            document.execCommand('bold', false, undefined)
                                            setTimeout(() => {
                                              const newBlocks = [...randomContentBlocks]
                                              newBlocks[index].content = editor.innerHTML
                                              setRandomContentBlocks(newBlocks)
                                            }, 10)
                                          }
                                        }}
                                      >
                                        B
                                      </button>

                                      <button
                                        className="h-7 w-7 dark:hover:bg-gray-800 border border-gray-300 hover:bg-gray-50 text-sm italic rounded"
                                        disabled={block.isSourceMode}
                                        onClick={() => {
                                          const editor = document.querySelector(`#random-editor-${index}`) as HTMLDivElement | null;
                                          if (editor) {
                                            editor.focus()
                                            document.execCommand('italic', false, undefined)
                                            setTimeout(() => {
                                              const newBlocks = [...randomContentBlocks]
                                              newBlocks[index].content = editor.innerHTML
                                              setRandomContentBlocks(newBlocks)
                                            }, 10)
                                          }
                                        }}
                                      >
                                        I
                                      </button>

                                      <button
                                        className="h-7 w-7 dark:hover:bg-gray-800 border border-gray-300 hover:bg-gray-50 text-sm underline rounded"
                                        disabled={block.isSourceMode}
                                        onClick={() => {
                                          const editor = document.querySelector(`#random-editor-${index}`) as HTMLDivElement | null;
                                          if (editor) {
                                            editor.focus()
                                            document.execCommand('underline', false, undefined)
                                            setTimeout(() => {
                                              const newBlocks = [...randomContentBlocks]
                                              newBlocks[index].content = editor.innerHTML
                                              setRandomContentBlocks(newBlocks)
                                            }, 10)
                                          }
                                        }}
                                      >
                                        U
                                      </button>

                                      {/* Alignment Buttons */}
                                      <div className="flex items-center gap-0.5 ml-2 border-l border-gray-300 pl-2">
                                        <button
                                          className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-center rounded"
                                          disabled={block.isSourceMode}
                                          onClick={() => {
                                            const editor = document.querySelector(`#random-editor-${index}`) as HTMLDivElement | null;
                                            if (editor) {
                                              editor.focus()
                                              document.execCommand('justifyLeft', false, undefined)
                                              setTimeout(() => {
                                                const newBlocks = [...randomContentBlocks]
                                                newBlocks[index].content = editor.innerHTML
                                                setRandomContentBlocks(newBlocks)
                                              }, 10)
                                            }
                                          }}
                                        >
                                          ⇤
                                        </button>
                                        <button
                                          className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-center rounded"
                                          disabled={block.isSourceMode}
                                          onClick={() => {
                                            const editor = document.querySelector(`#random-editor-${index}`) as HTMLDivElement | null;
                                            if (editor) {
                                              editor.focus()
                                              document.execCommand('justifyCenter', false, undefined)
                                              setTimeout(() => {
                                                const newBlocks = [...randomContentBlocks]
                                                newBlocks[index].content = editor.innerHTML
                                                setRandomContentBlocks(newBlocks)
                                              }, 10)
                                            }
                                          }}
                                        >
                                          ≡
                                        </button>
                                        <button
                                          className="h-7 w-7   border border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-center rounded"
                                          disabled={block.isSourceMode}
                                          onClick={() => {
                                            const editor = document.querySelector(`#random-editor-${index}`) as HTMLDivElement | null;
                                            if (editor) {
                                              editor.focus()
                                              document.execCommand('justifyRight', false, undefined)
                                              setTimeout(() => {
                                                const newBlocks = [...randomContentBlocks]
                                                newBlocks[index].content = editor.innerHTML
                                                setRandomContentBlocks(newBlocks)
                                              }, 10)
                                            }
                                          }}
                                        >
                                          ⇥
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Content Editor */}
                                  <div className="border border-gray-300 border-t-0 rounded-b">
                                    {block.isSourceMode ? (
                                      <textarea
                                        className="w-full h-32 p-3 text-sm resize-none border-none outline-none font-mono"
                                        style={{
                                          fontSize: "13px",
                                          lineHeight: "1.6",
                                          fontFamily: "Monaco, Consolas, 'Courier New', monospace",
                                        }}
                                        value={block.content || ""}
                                        onChange={(e) => {
                                          const newBlocks = [...randomContentBlocks]
                                          newBlocks[index].content = e.target.value
                                          setRandomContentBlocks(newBlocks)
                                        }}
                                        placeholder="Enter HTML source code here..."
                                      />
                                    ) : (
                                      <div className="relative">
                                        {(!block.content || block.content.trim() === "") && (
                                          <div
                                            className="absolute inset-3 text-gray-400 italic pointer-events-none"
                                            style={{ fontSize: "13px", lineHeight: "1.6" }}
                                          >
                                            Enter content here...
                                          </div>
                                        )}
                                        <div
                                          id={`random-editor-${index}`}
                                          contentEditable
                                          suppressContentEditableWarning={true}
                                          className="w-full h-32 p-3 text-sm outline-none"
                                          style={{
                                            fontSize: "13px",
                                            lineHeight: "1.6",
                                            fontFamily: "Arial, sans-serif",
                                            minHeight: "128px",
                                          }}
                                          dangerouslySetInnerHTML={{ __html: block.content || "" }}
                                          onInput={(e) => {
                                            const newBlocks = [...randomContentBlocks]
                                            newBlocks[index].content = e.currentTarget.innerHTML
                                            setRandomContentBlocks(newBlocks)
                                          }}
                                          onFocus={(e) => {
                                            const selection = window.getSelection()
                                            if (selection && selection.rangeCount === 0) {
                                              const range = document.createRange()
                                              range.selectNodeContents(e.currentTarget)
                                              range.collapse(true)
                                              selection.addRange(range)
                                            }
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* UTM and Random Content Section */}
                  <div className="flex gap-2 mt-6 mb-4">
                    <Button
                      variant="default"
                      className="bg-blue-500 text-white hover:bg-blue-600 text-sm px-4 py-2"
                      onClick={() => setShowUtmModal(true)}
                    >
                      UTM tags
                    </Button>
                    <Button
                      variant="default"
                      className="bg-blue-500 text-white hover:bg-blue-600 text-sm px-4 py-2"
                      onClick={() => setShowPlainTextMode(!showPlainTextMode)}
                    >
                      Show plain text version
                    </Button>
                    <Button
                      variant="default"
                      className="bg-blue-500 text-white hover:bg-blue-600 text-sm px-4 py-2"
                      onClick={() => setShowRandomContentModal(true)}
                    >
                      Random content
                    </Button>
                    <Button
                      variant="default"
                      className="bg-blue-500 text-white hover:bg-blue-600 text-sm px-4 py-2"
                      onClick={() => {
                        console.log("Content saved:", formData.content)
                        // Add save logic here
                      }}
                    >
                      Save content
                    </Button>
                  </div>
                  <div className="border-b mt-10 dark:bg-gray-900 bg-gray-50">
                    <div className="flex space-x-0">
                      {formTabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveFormTab(tab)}
                          className={`py-3 px-6 font-medium text-sm transition-colors flex items-center gap-2 border-b-3 ${activeFormTab === tab
                            ? "border-blue-500 text-blue-600 bg-blue-100 shadow-sm"
                            : "border-transparent text-gray-600 hover:text-blue-500 hover: "
                            }`}
                        >
                          {tab === "Details" && <Mail className="h-4 w-4 text-blue-500" />}
                          {tab === "Setup" && <SlidersHorizontal className="h-4 w-4 text-green-500" />}
                          {tab === "Template" && <div className="h-4 w-4 bg-purple-500 rounded"></div>}
                          {tab === "Confirmation" && <Check className="h-4 w-4 text-green-600" />}
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveAndNext} className="bg-blue-500 hover:bg-blue-600 text-white px-6">
                      Save and next
                    </Button>
                  </div>
                </div>
              )}

              {activeFormTab === "Confirmation" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <h3 className="text-lg font-medium dark:text-gray-100 text-gray-900">Campaign confirmation</h3>
                    </div>
                    <Button
                      variant="default"
                      className="bg-blue-500 text-white hover:bg-blue-600 text-sm px-4 py-2"
                      onClick={handleCloseForm}
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Top section with Send at and Advanced recurring */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Left side - Send at and options */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium dark:text-gray-100 text-gray-700">Send at *</Label>
                        <Input className="mt-1 h-9 text-sm dark:bg-gray-900 bg-gray-50" value="9/20/25, 11:39 AM" readOnly />
                      </div>

                      <div>
                        <Label className="text-sm font-medium dark:text-gray-100 text-gray-700">Daily sending window - Start hour</Label>
                        <Select defaultValue="choose">
                          <SelectTrigger className="mt-1 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="choose">Choose</SelectItem>
                            <SelectItem value="05:30">05:30</SelectItem>
                            <SelectItem value="06:00">06:00</SelectItem>
                            <SelectItem value="06:30">06:30</SelectItem>
                            <SelectItem value="07:00">07:00</SelectItem>
                            <SelectItem value="07:30">07:30</SelectItem>
                            <SelectItem value="08:00">08:00</SelectItem>
                            <SelectItem value="08:30">08:30</SelectItem>
                            <SelectItem value="09:00">09:00</SelectItem>
                            <SelectItem value="09:30">09:30</SelectItem>
                            <SelectItem value="10:00">10:00</SelectItem>
                            <SelectItem value="10:30">10:30</SelectItem>
                            <SelectItem value="11:00">11:00</SelectItem>
                            <SelectItem value="11:30">11:30</SelectItem>
                            <SelectItem value="12:00">12:00</SelectItem>
                            <SelectItem value="12:30">12:30</SelectItem>
                            <SelectItem value="13:00">13:00</SelectItem>
                            <SelectItem value="13:30">13:30</SelectItem>
                            <SelectItem value="14:00">14:00</SelectItem>
                            <SelectItem value="14:30">14:30</SelectItem>
                            <SelectItem value="15:00">15:00</SelectItem>
                            <SelectItem value="15:30">15:30</SelectItem>
                            <SelectItem value="16:00">16:00</SelectItem>
                            <SelectItem value="16:30">16:30</SelectItem>
                            <SelectItem value="17:00">17:00</SelectItem>
                            <SelectItem value="17:30">17:30</SelectItem>
                            <SelectItem value="18:00">18:00</SelectItem>
                            <SelectItem value="18:30">18:30</SelectItem>
                            <SelectItem value="19:00">19:00</SelectItem>
                            <SelectItem value="19:30">19:30</SelectItem>
                            <SelectItem value="20:00">20:00</SelectItem>
                            <SelectItem value="20:30">20:30</SelectItem>
                            <SelectItem value="21:00">21:00</SelectItem>
                            <SelectItem value="21:30">21:30</SelectItem>
                            <SelectItem value="22:00">22:00</SelectItem>
                            <SelectItem value="22:30">22:30</SelectItem>
                            <SelectItem value="23:00">23:00</SelectItem>
                            <SelectItem value="23:30">23:30</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium dark:text-gray-100 text-gray-700">Enable timewarp</Label>
                        <Select defaultValue="no">
                          <SelectTrigger className="mt-1 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Right side - Advanced recurring */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium dark:text-gray-100 text-gray-700">Advanced recurring</Label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 text-xs text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-fuchsia-500 bg-transparent"
                          >
                            Reset selection
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label className="text-sm font-medium dark:text-gray-100 text-gray-700">Daily sending window - Interval</Label>
                          <Select defaultValue="choose">
                            <SelectTrigger className="mt-1 h   -9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="choose">Choose</SelectItem>
                              <SelectItem value="1">1 hour</SelectItem>
                              <SelectItem value="2">2 hours</SelectItem>
                              <SelectItem value="3">3 hours</SelectItem>
                              <SelectItem value="4">4 hours</SelectItem>
                              <SelectItem value="5">5 hours</SelectItem>
                              <SelectItem value="6">6 hours</SelectItem>
                              <SelectItem value="7">7 hours</SelectItem>
                              <SelectItem value="8">8 hours</SelectItem>
                              <SelectItem value="9">9 hours</SelectItem>
                              <SelectItem value="10">10 hours</SelectItem>
                              <SelectItem value="11">11 hours</SelectItem>
                              <SelectItem value="12">12 hours</SelectItem>
                              <SelectItem value="13">13 hours</SelectItem>
                              <SelectItem value="14">14 hours</SelectItem>
                              <SelectItem value="15">15 hours</SelectItem>
                              <SelectItem value="16">16 hours</SelectItem>
                              <SelectItem value="17">17 hours</SelectItem>
                              <SelectItem value="18">18 hours</SelectItem>
                              <SelectItem value="19">19 hours</SelectItem>
                              <SelectItem value="20">20 hours</SelectItem>
                              <SelectItem value="21">21 hours</SelectItem>
                              <SelectItem value="22">22 hours</SelectItem>
                              <SelectItem value="23">23 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label className="text-sm font-medium dark:text-gray-100 text-gray-700">Timewarp hour</Label>
                          <Select defaultValue="01">
                            <SelectTrigger className="mt-1 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="01">01</SelectItem>
                              <SelectItem value="02">02</SelectItem>
                              <SelectItem value="03">03</SelectItem>
                              <SelectItem value="04">04</SelectItem>
                              <SelectItem value="05">05</SelectItem>
                              <SelectItem value="06">06</SelectItem>
                              <SelectItem value="07">07</SelectItem>
                              <SelectItem value="08">08</SelectItem>
                              <SelectItem value="09">09</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="11">11</SelectItem>
                              <SelectItem value="12">12</SelectItem>
                              <SelectItem value="13">13</SelectItem>
                              <SelectItem value="14">14</SelectItem>
                              <SelectItem value="15">15</SelectItem>
                              <SelectItem value="16">16</SelectItem>
                              <SelectItem value="17">17</SelectItem>
                              <SelectItem value="18">18</SelectItem>
                              <SelectItem value="19">19</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="21">21</SelectItem>
                              <SelectItem value="22">22</SelectItem>
                              <SelectItem value="23">23</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium dark:text-gray-100 text-gray-700">Timewarp minute</Label>
                          <Select defaultValue="01">
                            <SelectTrigger className="mt-1 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="01">01</SelectItem>
                              <SelectItem value="02">02</SelectItem>
                              <SelectItem value="03">03</SelectItem>
                              <SelectItem value="04">04</SelectItem>
                              <SelectItem value="05">05</SelectItem>
                              <SelectItem value="06">06</SelectItem>
                              <SelectItem value="07">07</SelectItem>
                              <SelectItem value="08">08</SelectItem>
                              <SelectItem value="09">09</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="11">11</SelectItem>
                              <SelectItem value="12">12</SelectItem>
                              <SelectItem value="13">13</SelectItem>
                              <SelectItem value="14">14</SelectItem>
                              <SelectItem value="15">15</SelectItem>
                              <SelectItem value="16">16</SelectItem>
                              <SelectItem value="17">17</SelectItem>
                              <SelectItem value="18">18</SelectItem>
                              <SelectItem value="19">19</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="21">21</SelectItem>
                              <SelectItem value="22">22</SelectItem>
                              <SelectItem value="23">23</SelectItem>
                              <SelectItem value="24">24</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="26">26</SelectItem>
                              <SelectItem value="27">27</SelectItem>
                              <SelectItem value="28">28</SelectItem>
                              <SelectItem value="29">29</SelectItem>
                              <SelectItem value="30">30</SelectItem>
                              <SelectItem value="31">31</SelectItem>
                              <SelectItem value="32">32</SelectItem>
                              <SelectItem value="33">33</SelectItem>
                              <SelectItem value="34">34</SelectItem>
                              <SelectItem value="35">35</SelectItem>
                              <SelectItem value="36">36</SelectItem>
                              <SelectItem value="37">37</SelectItem>
                              <SelectItem value="38">38</SelectItem>
                              <SelectItem value="39">39</SelectItem>
                              <SelectItem value="40">40</SelectItem>
                              <SelectItem value="41">41</SelectItem>
                              <SelectItem value="42">42</SelectItem>
                              <SelectItem value="43">43</SelectItem>
                              <SelectItem value="44">44</SelectItem>
                              <SelectItem value="45">45</SelectItem>
                              <SelectItem value="46">46</SelectItem>
                              <SelectItem value="47">47</SelectItem>
                              <SelectItem value="48">48</SelectItem>
                              <SelectItem value="49">49</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="51">51</SelectItem>
                              <SelectItem value="52">52</SelectItem>
                              <SelectItem value="53">53</SelectItem>
                              <SelectItem value="54">54</SelectItem>
                              <SelectItem value="55">55</SelectItem>
                              <SelectItem value="56">56</SelectItem>
                              <SelectItem value="57">57</SelectItem>
                              <SelectItem value="58">58</SelectItem>
                              <SelectItem value="59">59</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Campaign details section */}
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex">
                        <div className="w-32 dark:text-gray-100 text-gray-700 font-medium">Campaign name</div>
                        <div className="flex-1 text-blue-600">Weekly deight subscriber</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex">
                        <div className="w-32 dark:text-gray-100 text-gray-700 font-medium">List/Segment</div>
                        <div className="flex-1 dark:text-gray-400 text-gray-900">aa aa</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex">
                        <div className="w-32 dark:text-gray-100 text-gray-700 font-medium">From name</div>
                        <div className="flex-1 dark:text-gray-400 text-gray-900">Krish</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex">
                        <div className="w-32 dark:text-gray-100 text-gray-700 font-medium">Reply to</div>
                        <div className="flex-1 text-blue-600">official.krishnendu@gmail.com</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex">
                        <div className="w-32 dark:text-gray-100 text-gray-700 font-medium">To name</div>
                        <div className="flex-1 dark:text-gray-400 text-gray-900">[EMAIL]</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex">
                        <div className="w-32 dark:text-gray-100 text-gray-700 font-medium">Subject</div>
                        <div className="flex-1 dark:text-gray-400 text-gray-900">Hello!</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex">
                        <div className="w-32 dark:text-gray-100 text-gray-700 font-medium">Date added</div>
                        <div className="flex-1 dark:text-gray-400 text-gray-900">9/20/25, 11:36 AM</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex">
                        <div className="w-32 dark:text-gray-100 text-gray-700 font-medium">Last updated</div>
                        <div className="flex-1 dark:text-gray-400 text-gray-900">9/20/25, 2:51 PM</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex">
                        <div className="w-32 dark:text-gray-100 text-gray-700 font-medium">Estimated recipients count</div>
                        <div className="flex-1 dark:text-gray-400 text-gray-900">
                          This campaign will target approximately 0 subscribers.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="border-t mt-8 dark:bg-gray-900 bg-gray-50">
                    <div className="flex space-x-0">
                      {formTabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveFormTab(tab)}
                          className={`py-3 px-6 font-medium text-sm transition-colors flex items-center gap-2 border-b-3 ${activeFormTab === tab
                              ? "border-blue-500 text-blue-600 bg-blue-100 shadow-sm"
                              : "border-transparent  text-gray-600 hover:text-blue-500 hover: "
                            }`}
                        >
                          {tab === "Details" && <Mail className="h-4 w-4 text-blue-500" />}
                          {tab === "Setup" && <SlidersHorizontal className="h-4 w-4 text-green-500" />}
                          {tab === "Template" && <div className="h-4 w-4 bg-purple-500 rounded"></div>}
                          {tab === "Confirmation" && <Check className="h-4 w-4 text-green-600" />}
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end pt-6">
                    <Button
                      onClick={() => {
                        alert("Campaign created successfully!");
                        handleCloseForm();
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Tags Modal */}
        {showAvailableTags && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="  rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Available tags</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAvailableTags(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-y-auto max-h-96 p-4">
                <div className="space-y-2">
                  {availableTags.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200 cursor-pointer transition-colors"
                      onClick={() => handleTagClick(item.tag)}
                    >
                      <div className="flex-1">
                        <div className="font-mono text-sm text-blue-600">{item.tag}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                      <div className="text-xs text-gray-400 ml-4">NO</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAvailableTags(false)}
                  className="text-gray-600 border-gray-300 hover:bg-gray-100"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Emoji Picker Modal */}
        {showEmojiPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="  rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Toggle emoji list</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-y-auto max-h-96 p-4">
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <div key={category} className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 text-sm">{category}</h4>
                    <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 gap-2">
                      {emojis.map((emoji, index) => (
                        <button
                          key={`${category}-${index}`}
                          className="text-2xl p-2 hover:bg-gray-100 rounded transition-colors"
                          onClick={() => handleEmojiClick(emoji)}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t bg-blue-50">
                <p className="text-sm text-blue-700">
                  You can click on any emoji to enter it in the subject or scroll for more.
                </p>
              </div>

              <div className="p-4 border-t bg-gray-50 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-gray-600 border-gray-300 hover:bg-gray-100"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info Modal */}
        {showInfoModal && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className="  rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">ℹ</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Info</h3>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="text-sm text-gray-700">
                {/* Conditional content based on infoModalType */}
                {infoModalType === "random_content" ? (
                  // Random Content Info
                  <div>
                    <p className="mb-4">
                      Random content blocks allows you to rotate random HTML content in your template body by using the [RANDOM_CONTENT] tag.
                    </p>
                    <p className="mb-4">
                      You can define one or more random content blocks, and then you will be able to call the [RANDOM_CONTENT] tag like:
                    </p>
                    <p className="mb-4 font-mono bg-gray-100 p-2 rounded text-xs">
                      [RANDOM_CONTENT: BLOCK-N1 | BLOCK-N2 | BLOCK-N3] where N1, N2, N3 are the names of your blocks you want to use.
                    </p>
                    <p>
                      You can use an unlimited number of blocks.
                    </p>
                  </div>
                ) : infoModalType === "available_tags" ? (
                  // Available Tags for Plain Text Editor
                  <div>
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0   border-b">
                          <tr>
                            <th className="text-left py-2 px-3 font-semibold">Tag</th>
                            <th className="text-left py-2 px-3 font-semibold">Required</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_FULL_ADDRESS]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[UPDATE_PROFILE_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[WEB_VERSION_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[FORWARD_FRIEND_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[LIST_UID]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[LIST_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[LIST_SUBJECT]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[LIST_DESCRIPTION]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[LIST_FROM_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[LIST_FROM_EMAIL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[LIST_VCARD_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CURRENT_YEAR]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CURRENT_MONTH]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CURRENT_DAY]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CURRENT_DATE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CURRENT_MONTH_FULL_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_WEBSITE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_ADDRESS_1]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_ADDRESS_2]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_CITY]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_ZONE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_ZONE_CODE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_ZIP]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_COUNTRY]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_COUNTRY_CODE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COMPANY_PHONE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_TYPE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_SUBJECT]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_TO_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_FROM_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_FROM_EMAIL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_REPLY_TO]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_UID]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_SEND_AT]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_STARTED_AT]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_DATE_ADDED]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_SEGMENT_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_VCARD_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_UID]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_IP]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_DATE_ADDED]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_DATE_ADDED_LOCALIZED]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_OPTIN_IP]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_OPTIN_DATE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_CONFIRM_IP]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_CONFIRM_DATE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_LAST_SENT_DATE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_LAST_SENT_DATE_LOCALIZED]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_EMAIL_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBER_EMAIL_DOMAIN]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[EMAIL_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[EMAIL_DOMAIN]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[DATE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[DATETIME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[RANDOM_CONTENT:a|b|c]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[REMOTE_CONTENT url='https://www.google.com/']</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[COUNTDOWN until='2025-09-20 18:27:15' size='large' text-color='db9842' background-color='ffffff' show-circle='yes' circle-background-color='ffcccc' circle-foreground-color='ff0000' max-frames=60 show-text-label='yes']</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CAMPAIGN_REPORT_ABUSE_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CURRENT_DOMAIN_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CURRENT_DOMAIN]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SIGN_LT]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SIGN_LTE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SIGN_GT]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SIGN_GTE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[DS_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[DS_HOST]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[DS_TYPE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[DS_ID]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[DS_FROM_NAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[DS_FROM_EMAIL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[DS_REPLYTO_EMAIL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBE_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SUBSCRIBE_LINK]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[UNSUBSCRIBE_URL]</td><td className="py-2 px-3 text-green-500 font-semibold">YES</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[UNSUBSCRIBE_LINK]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[DIRECT_UNSUBSCRIBE_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[DIRECT_UNSUBSCRIBE_LINK]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[UNSUBSCRIBE_FROM_CUSTOMER_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[UNSUBSCRIBE_FROM_CUSTOMER_LINK]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[SURVEY:SURVEY_UNIQUE_ID_HERE:VIEW_URL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[EMAIL]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[FNAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[LNAME]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                          <tr><td className="py-2 px-3 font-mono">[CCT_SHYAMASHREE]</td><td className="py-2 px-3 text-red-500">NO</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  // Default Dynamic Tags Info
                  <div>
                    <p className="mb-4">The template you create with the builder must be modified only using the builder.
                      Do not modify the template outside the builder, it will break.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Import URL Modal */}
        {showImportUrlModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="  rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Import html template from url</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImportUrlModal(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4">
                <div className="bg-blue-500 text-white p-3 rounded mb-4 text-sm">
                  Please note that your url must contain a valid html email template with absolute paths to resources!
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fromUrl" className="text-sm text-gray-700">
                      From url
                    </Label>
                    <Input
                      id="fromUrl"
                      value={importUrlData.fromUrl}
                      onChange={(e) => setImportUrlData((prev) => ({ ...prev, fromUrl: e.target.value }))}
                      className="mt-1 w-full"
                      placeholder="Enter template URL"
                    />
                  </div>

                  <div>
                    <Label htmlFor="autoPlainTextImport" className="text-sm text-gray-700">
                      Auto plain text <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={importUrlData.autoPlainText}
                      onValueChange={(value) => setImportUrlData((prev) => ({ ...prev, autoPlainText: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Whether the plain text version of the html template should be auto generated.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => setShowImportUrlModal(false)}
                  className="text-gray-600 border-gray-300 hover:bg-gray-100"
                >
                  Close
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    console.log("Import URL:", importUrlData)
                    setShowImportUrlModal(false)
                  }}
                >
                  Import
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Template Modal */}
        {showUploadTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="  rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Upload template archive</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadTemplateModal(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4">
                <div className="bg-blue-500 text-white p-3 rounded mb-4 text-sm">
                  Please see this example archive in order to understand how you should format your uploaded archive!
                  Also, please note we only accept Zip files.
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="archiveFile" className="text-sm text-gray-700">
                      Archive file <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="file"
                        id="archiveFile"
                        accept=".zip"
                        onChange={(e) =>
                          setUploadTemplateData((prev) => ({ ...prev, archiveFile: e.target.files?.[0] || null }))
                        }
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("archiveFile")?.click()}
                        className="text-sm"
                      >
                        Choose file
                      </Button>
                      <span className="text-sm text-gray-500">
                        {uploadTemplateData.archiveFile ? uploadTemplateData.archiveFile.name : "No file chosen"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="autoPlainTextUpload" className="text-sm text-gray-700">
                      Auto Plain Text
                    </Label>
                    <Select
                      value={uploadTemplateData.autoPlainText}
                      onValueChange={(value) => setUploadTemplateData((prev) => ({ ...prev, autoPlainText: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Whether the plain text version of the html template should be auto generated.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadTemplateModal(false)}
                  className="text-gray-600 border-gray-300 hover:bg-gray-100"
                >
                  Close
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    console.log("Upload Template:", uploadTemplateData)
                    setShowUploadTemplateModal(false)
                  }}
                >
                  Upload archive
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Change/Select Template Modal */}
        {showChangeTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="  rounded-lg shadow-xl w-full max-w-6xl mx-4 h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <h3 className="text-lg font-medium text-gray-900">Campaign template</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="bg-blue-500 text-white hover:bg-blue-600 text-xs px-3 py-1 h-8"
                    onClick={() => setShowChangeTemplateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTemplateInfoModal(true)}
                    className="h-8 w-8 p-0 bg-blue-500 text-white hover:bg-blue-600"
                  >
                    ℹ
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">Screenshot</th>
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-left p-3 font-medium">Date added</th>
                        <th className="text-left p-3 font-medium">Last updated</th>
                        <th className="text-left p-3 font-medium">Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No results found.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t bg-gray-50">
                <div className="flex items-center justify-between p-4">
                  <div className="flex space-x-0">
                    {formTabs.map((tab, index) => (
                      <button
                        key={tab}
                        className={`py-2 px-4 font-medium text-sm transition-colors ${index === 2 ? "bg-blue-500 text-white" : "text-gray-600 hover:text-blue-500"
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                    <button className="py-2 px-4 font-medium text-sm text-gray-600 hover:text-blue-500">Done</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">10</span>
                    <Select>
                      <SelectTrigger className="h-8 w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Info Modal */}
        {showTemplateInfoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="  rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
              <div className="bg-blue-500 text-white p-4 flex items-center gap-2">
                <div className="w-5 h-5   bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-bold text-sm">i</span>
                </div>
                <h3 className="font-medium">Info</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplateInfoModal(false)}
                  className="ml-auto h-6 w-6 p-0 text-white hover:  hover:bg-opacity-20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700">
                  Please note, once you select a template, the existing content of the campaign template will be
                  overridden by the one you have selected.
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  If you don't want this, then just click on the cancel button and you will be redirect back to the
                  initial template page.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Link Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="  rounded-lg w-[600px] max-w-[90vw]"> {/* Increased width */}
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium">Link</h3>
                <button onClick={() => setShowLinkModal(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>

              <div className="flex border-b">
                {["Link Info", "Target", "Advanced"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setLinkActiveTab(tab)}
                    className={`px-4 py-2 text-sm ${linkActiveTab === tab ? 'bg-blue-100 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6"> {/* Increased padding */}
                {linkActiveTab === "Link Info" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Display Text</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={linkData.displayText}
                        onChange={(e) => setLinkData({ ...linkData, displayText: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Link Type</label>
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={linkData.linkType || "URL"}
                        onChange={(e) => setLinkData({ ...linkData, linkType: e.target.value })}
                      >
                        <option value="URL">URL</option>
                        <option value="Link to anchor in the text">Link to anchor in the text</option>
                        <option value="E-mail">E-mail</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Protocol</label>
                      <div className="flex gap-2">
                        <select
                          className="border border-gray-300 rounded px-3 py-2 text-sm w-32"
                          value={linkData.protocol || "http://"}
                          onChange={(e) => setLinkData({ ...linkData, protocol: e.target.value })}
                        >
                          <option value="http://">http://</option>
                          <option value="https://">https://</option>
                          <option value="ftp://">ftp://</option>
                          <option value="news://">news://</option>
                          <option value="other">&lt;other&gt;</option>
                        </select>
                        <input
                          type="text"
                          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="URL"
                          value={linkData.url}
                          onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                        disabled
                      >
                        Browse Server
                      </button>
                    </div>
                  </div>
                )}

                {linkActiveTab === "Target" && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Target</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={linkData.target}
                      onChange={(e) => setLinkData({ ...linkData, target: e.target.value })}
                    >
                      <option value="">&lt;not set&gt;</option>
                      <option value="_blank">New Window (_blank)</option>
                      <option value="_self">Same Window (_self)</option>
                      <option value="_parent">Parent Window (_parent)</option>
                      <option value="_top">Topmost Window (_top)</option>
                      <option value="_frame">&lt;frame&gt;</option>
                      <option value="_popup">&lt;popup window&gt;</option>
                    </select>

                    {/* Show frame name input when frame is selected */}
                    {linkData.target === "_frame" && (
                      <div className="mt-3">
                        <label className="block text-sm text-gray-700 mb-1">Target Frame Name</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="Enter frame name"
                          value={linkData.frameName || ''}
                          onChange={(e) => setLinkData({ ...linkData, frameName: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Show popup window configuration when popup is selected */}
                    {linkData.target === "_popup" && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Popup Window Name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder="Enter popup window name"
                            value={linkData.popupName || ''}
                            onChange={(e) => setLinkData({ ...linkData, popupName: e.target.value })}
                          />
                        </div>

                        <div className="border border-gray-300 rounded p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Popup Window Features</h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={linkData.popupFeatures?.resizable || false}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      resizable: e.target.checked
                                    }
                                  })}
                                />
                                Resizable
                              </label>

                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={linkData.popupFeatures?.locationBar || false}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      locationBar: e.target.checked
                                    }
                                  })}
                                />
                                Location Bar
                              </label>

                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={linkData.popupFeatures?.menuBar || false}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      menuBar: e.target.checked
                                    }
                                  })}
                                />
                                Menu Bar
                              </label>

                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={linkData.popupFeatures?.scrollBars || false}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      scrollBars: e.target.checked
                                    }
                                  })}
                                />
                                Scroll Bars
                              </label>

                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Width</label>
                                <input
                                  type="number"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                  value={linkData.popupFeatures?.width || ''}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      width: e.target.value
                                    }
                                  })}
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Height</label>
                                <input
                                  type="number"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                  value={linkData.popupFeatures?.height || ''}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      height: e.target.value
                                    }
                                  })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={linkData.popupFeatures?.statusBar || false}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      statusBar: e.target.checked
                                    }
                                  })}
                                />
                                Status Bar
                              </label>

                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={linkData.popupFeatures?.toolbar || false}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      toolbar: e.target.checked
                                    }
                                  })}
                                />
                                Toolbar
                              </label>

                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={linkData.popupFeatures?.fullScreen || false}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      fullScreen: e.target.checked
                                    }
                                  })}
                                />
                                Full Screen (IE)
                              </label>

                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={linkData.popupFeatures?.dependent || false}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      dependent: e.target.checked
                                    }
                                  })}
                                />
                                Dependent (Netscape)
                              </label>

                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Left Position</label>
                                <input
                                  type="number"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                  value={linkData.popupFeatures?.left || ''}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      left: e.target.value
                                    }
                                  })}
                                />
                              </div>

                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Top Position</label>
                                <input
                                  type="number"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                  value={linkData.popupFeatures?.top || ''}
                                  onChange={(e) => setLinkData({
                                    ...linkData,
                                    popupFeatures: {
                                      ...linkData.popupFeatures,
                                      top: e.target.value
                                    }
                                  })}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {linkActiveTab === "Advanced" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Id</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Language Direction</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                          <option>&lt;not set&gt;</option>
                          <option value="ltr">Left to Right</option>
                          <option value="rtl">Right to Left</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Access Key</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Name</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Language Code</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Tab Index</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Advisory Title</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Advisory Content Type</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Stylesheet Classes</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Linked Resource Charset</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Relationship</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Style</label>
                        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center">
                        <input type="checkbox" id="forceDownload" className="mr-2" />
                        <label htmlFor="forceDownload" className="text-sm text-gray-700">Force Download</label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLinkModal(false)
                  }}
                  className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Anchor Modal */}
        {showAnchorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="  rounded-lg w-80">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium">Anchor Properties</h3>
                <button onClick={() => setShowAnchorModal(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>

              <div className="p-4">
                <label className="block text-sm text-gray-700 mb-1">Anchor Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={anchorData.anchorName}
                  onChange={(e) => setAnchorData({ ...anchorData, anchorName: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  onClick={() => setShowAnchorModal(false)}
                  className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Insert anchor logic here
                    setShowAnchorModal(false)
                  }}
                  className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="  rounded-lg w-[600px] max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium">Image Properties</h3>
                <button onClick={() => setShowImageModal(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>

              <div className="flex border-b">
                {["Image Info", "Link", "Advanced"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setImageActiveTab(tab)}
                    className={`px-4 py-2 text-sm ${imageActiveTab === tab ? 'bg-blue-100 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {imageActiveTab === "Image Info" && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">URL</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            value={imageData.url}
                            onChange={(e) => setImageData({ ...imageData, url: e.target.value })}
                          />
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm text-gray-700 mb-1">Alternative Text</label>
                          <textarea
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-16 resize-none"
                            value={imageData.altText}
                            onChange={(e) => setImageData({ ...imageData, altText: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2 mt-4">
                          <div className="flex-1">
                            <label className="block text-sm text-gray-700 mb-1">Width</label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                              value={imageData.width}
                              onChange={(e) => setImageData({ ...imageData, width: e.target.value })}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm text-gray-700 mb-1">Height</label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                              value={imageData.height}
                              onChange={(e) => setImageData({ ...imageData, height: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <div className="flex-1">
                            <label className="block text-sm text-gray-700 mb-1">Border</label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                              value={imageData.border || ''}
                              onChange={(e) => setImageData({ ...imageData, border: e.target.value })}
                            />
                          </div>
                          <div className="w-8 flex items-end">
                            <button className="text-gray-500 hover:text-gray-700 text-sm">🔒</button>
                          </div>
                          <div className="w-8 flex items-end">
                            <button className="text-gray-500 hover:text-gray-700 text-sm">🔄</button>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <div className="flex-1">
                            <label className="block text-sm text-gray-700 mb-1">HSpace</label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                              value={imageData.hspace || ''}
                              onChange={(e) => setImageData({ ...imageData, hspace: e.target.value })}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm text-gray-700 mb-1">VSpace</label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                              value={imageData.vspace || ''}
                              onChange={(e) => setImageData({ ...imageData, vspace: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm text-gray-700 mb-1">Alignment</label>
                          <select
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            value={imageData.alignment || ''}
                            onChange={(e) => setImageData({ ...imageData, alignment: e.target.value })}
                          >
                            <option value="">&lt;not set&gt;</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="top">Top</option>
                            <option value="middle">Middle</option>
                            <option value="bottom">Bottom</option>
                          </select>
                        </div>
                      </div>
                      <div className="w-48">
                        <label className="block text-sm text-gray-700 mb-1">Preview</label>
                        <div className="border border-gray-300 rounded p-2 h-64 overflow-y-auto text-xs text-gray-600">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas feugiat consequat dui, et molestie metus. Vivamus diam purus, cursus a, commodo non, facilisis vitae, nulla. Aenean dictum lacinia tortor. Nunc iaculis nibh non iaculis aliquam. Orci tellus evismod neque. Sed ornare massa mauris, sed dictum velit. Nulla pretium mi et risus. Fusce mi pede, tempor id, cursus ac, ullamcorper nec, enim. Sed tortor. Curabitur molestie. Duis velit augue, condimentum at, ultrices a, luctus ut, orci. Donec pellentesque egestas eros. Integer cursus, augue in cursus faucibus, eros pede bibendum sem, in tempus tellus justo quis ligula. Etiam eget tortor. Vestibulum rutrum, est ut eleifend eleifend...
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {imageActiveTab === "Link" && (
                  <div className="space-y-4">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-700 mb-1">URL</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={imageData.linkUrl || ''}
                          onChange={(e) => setImageData({ ...imageData, linkUrl: e.target.value })}
                        />
                      </div>
                      <button className="px-3 py-2 text-sm border border-blue-400 text-blue-600 rounded hover:bg-blue-50 dark:hover:bg-gray-600">
                        Browse Server
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Target</label>
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={imageData.linkTarget || ''}
                        onChange={(e) => setImageData({ ...imageData, linkTarget: e.target.value })}
                      >
                        <option value="">&lt;not set&gt;</option>
                        <option value="_blank">New Window (_blank)</option>
                        <option value="_self">Same Window (_self)</option>
                        <option value="_parent">Parent Window (_parent)</option>
                        <option value="_top">Topmost Window (_top)</option>
                      </select>
                    </div>
                  </div>
                )}

                {imageActiveTab === "Advanced" && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-700 mb-1">Id</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={imageData.id || ''}
                          onChange={(e) => setImageData({ ...imageData, id: e.target.value })}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-700 mb-1">Language Direction</label>
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={imageData.langDirection || ''}
                          onChange={(e) => setImageData({ ...imageData, langDirection: e.target.value })}
                        >
                          <option value="">&lt;not set&gt;</option>
                          <option value="ltr">Left to Right</option>
                          <option value="rtl">Right to Left</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-700 mb-1">Language Code</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={imageData.langCode || ''}
                          onChange={(e) => setImageData({ ...imageData, langCode: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Long Description URL</label>
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-16 resize-none"
                        value={imageData.longDesc || ''}
                        onChange={(e) => setImageData({ ...imageData, longDesc: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-700 mb-1">Stylesheet Classes</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={imageData.cssClass || ''}
                          onChange={(e) => setImageData({ ...imageData, cssClass: e.target.value })}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-700 mb-1">Advisory Title</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={imageData.title || ''}
                          onChange={(e) => setImageData({ ...imageData, title: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Style</label>
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20 resize-none"
                        value={imageData.style || ''}
                        onChange={(e) => setImageData({ ...imageData, style: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Insert image logic here
                    setShowImageModal(false)
                  }}
                  className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
        {showFlashModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="  rounded-lg w-[500px] max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium">Flash Properties</h3>
                <button onClick={() => setShowFlashModal(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>

              <div className="flex border-b">
                {["General", "Properties", "Advanced"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFlashActiveTab(tab)}
                    className={`px-4 py-2 text-sm ${flashActiveTab === tab ? 'bg-blue-100 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {flashActiveTab === "General" && (
                  <div className="space-y-4">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-700 mb-1">URL</label>
                        <input
                          type="text"
                          className="w-full border border-blue-400 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          value={flashData.url || ''}
                          onChange={(e) => setFlashData({ ...flashData, url: e.target.value })}
                        />
                      </div>
                      <button className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded hover:bg-gray-50">
                        Browse Server
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Width</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={flashData.width || ''}
                          onChange={(e) => setFlashData({ ...flashData, width: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Height</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={flashData.height || ''}
                          onChange={(e) => setFlashData({ ...flashData, height: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">HSpace</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={flashData.hspace || ''}
                          onChange={(e) => setFlashData({ ...flashData, hspace: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">VSpace</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={flashData.vspace || ''}
                          onChange={(e) => setFlashData({ ...flashData, vspace: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Preview</label>
                      <div className="w-full h-48 border border-gray-300 rounded bg-gray-50"></div>
                    </div>
                  </div>
                )}

                {flashActiveTab === "Properties" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Scale</label>
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={flashData.scale || ''}
                          onChange={(e) => setFlashData({ ...flashData, scale: e.target.value })}
                        >
                          <option value="">&lt;not set&gt;</option>
                          <option value="showall">Show All</option>
                          <option value="noborder">No Border</option>
                          <option value="exactfit">Exact Fit</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Script Access</label>
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={flashData.scriptAccess || ''}
                          onChange={(e) => setFlashData({ ...flashData, scriptAccess: e.target.value })}
                        >
                          <option value="">&lt;not set&gt;</option>
                          <option value="always">Always</option>
                          <option value="sameDomain">Same Domain</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Window mode</label>
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={flashData.windowMode || ''}
                          onChange={(e) => setFlashData({ ...flashData, windowMode: e.target.value })}
                        >
                          <option value="">&lt;not set&gt;</option>
                          <option value="window">Window</option>
                          <option value="opaque">Opaque</option>
                          <option value="transparent">Transparent</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Quality</label>
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={flashData.quality || ''}
                          onChange={(e) => setFlashData({ ...flashData, quality: e.target.value })}
                        >
                          <option value="">High</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="best">Best</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Alignment</label>
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={flashData.alignment || ''}
                        onChange={(e) => setFlashData({ ...flashData, alignment: e.target.value })}
                      >
                        <option value="">&lt;not set&gt;</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="top">Top</option>
                        <option value="middle">Middle</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>

                    <div className="border border-gray-300 rounded p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Variables for Flash</h4>
                      <div className="space-y-2">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={flashData.enableFlashMenu || false}
                            onChange={(e) => setFlashData({
                              ...flashData,
                              enableFlashMenu: e.target.checked
                            })}
                          />
                          Enable Flash Menu
                        </label>
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={flashData.autoPlay || false}
                            onChange={(e) => setFlashData({
                              ...flashData,
                              autoPlay: e.target.checked
                            })}
                          />
                          Auto Play
                        </label>
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={flashData.loop || false}
                            onChange={(e) => setFlashData({
                              ...flashData,
                              loop: e.target.checked
                            })}
                          />
                          Loop
                        </label>
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={flashData.allowFullscreen || false}
                            onChange={(e) => setFlashData({
                              ...flashData,
                              allowFullscreen: e.target.checked
                            })}
                          />
                          Allow Fullscreen
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {flashActiveTab === "Advanced" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Id</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={flashData.id || ''}
                        onChange={(e) => setFlashData({ ...flashData, id: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Background color</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={flashData.backgroundColor || ''}
                          onChange={(e) => setFlashData({ ...flashData, backgroundColor: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Stylesheet Classes</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={flashData.cssClass || ''}
                          onChange={(e) => setFlashData({ ...flashData, cssClass: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Style</label>
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-32 resize-none"
                        value={flashData.style || ''}
                        onChange={(e) => setFlashData({ ...flashData, style: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  onClick={() => setShowFlashModal(false)}
                  className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Insert flash logic here
                    setShowFlashModal(false)
                  }}
                  className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Main Campaigns List View
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Campaigns</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu open={showToggleColumns} onOpenChange={setShowToggleColumns}>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Toggle columns</span>
                <span className="sm:hidden">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
              <div className="p-2 space-y-2">
                {columns.map((column) => (
                  <div key={column} className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer ${visibleColumns[column] ? "bg-blue-500 border-blue-500" : "border-gray-300"
                        }`}
                      onClick={() => handleColumnToggle(column, !visibleColumns[column])}
                    >
                      {visibleColumns[column] && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <label
                      className="text-sm cursor-pointer flex-1"
                      onClick={() => handleColumnToggle(column, !visibleColumns[column])}
                    >
                      {column}
                    </label>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <Button onClick={handleSaveChanges} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Save changes
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create new</span>
            <span className="sm:hidden">Create</span>
          </Button>
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Upload className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Import from share code</span>
            <span className="lg:hidden">Import</span>
          </Button>
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
            <RotateCcw className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns
                  .filter((col) => visibleColumns[col])
                  .map((column) => (
                    <th key={column} className="text-left p-3 font-medium whitespace-nowrap">
                      {column}
                    </th>
                  ))}
              </tr>
              <tr className="border-b dark:bg-gray-950 bg-gray-50">
                {columns
                  .filter((col) => visibleColumns[col])
                  .map((column) => (
                    <th key={`filter-${column}`} className="p-2">
                      {column === "Status" || column === "Type" ? (
                        <Select >
                          <SelectTrigger className="h-8 dark:bg-gray-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem className="dark:bg-gray-700" value="all">All</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input className="h-8 dark:bg-gray-500" placeholder="" />
                      )}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={columns.filter((col) => visibleColumns[col]).length}
                  className="text-center py-8 text-gray-500"
                >
                  No results found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Page 1 of 1</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}


