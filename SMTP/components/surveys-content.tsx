"use client"

import { useState, useEffect } from "react"
import {
  ClipboardList,
  Plus,
  RefreshCw,
  Copy,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  MoreHorizontal,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

interface Survey {
  id: string
  name: string
  displayName: string
  description: string
  finishRedirect: string
  status: "Draft" | "Active" | "Inactive"
  startAt: string
  endAt: string
  respondersCount: number
  dateAdded: string
  lastUpdated: string
}

interface Column {
  id: string
  label: string
  visible: boolean
}

const STORAGE_KEY = "smtp-dashboard-surveys"

export default function SurveysContent() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)
  const [showActionDropdown, setShowActionDropdown] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [columns, setColumns] = useState<Column[]>([
    { id: "survey", label: "Survey", visible: true },
    { id: "name", label: "Name", visible: true },
    { id: "displayName", label: "Display name", visible: true },
    { id: "respondersCount", label: "Responders count", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "dateAdded", label: "Date added", visible: true },
    { id: "lastUpdated", label: "Last updated", visible: true },
  ])

  const [formData, setFormData] = useState({
  name: "",
  displayName: "",
  description: "",
  finishRedirect: "",
  status: "Draft" as "Draft" | "Active" | "Inactive", // Change this line
  startAt: "",
  endAt: "",
})


  // Load surveys from localStorage on component mount
  useEffect(() => {
    const savedSurveys = localStorage.getItem(STORAGE_KEY)
    if (savedSurveys) {
      try {
        setSurveys(JSON.parse(savedSurveys))
      } catch (error) {
        console.error("Error loading surveys from localStorage:", error)
      }
    }
  }, [])

  // Save surveys to localStorage whenever surveys change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(surveys))
  }, [surveys])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }
    if (!formData.displayName.trim()) {
      errors.displayName = "Display name is required"
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }
    if (!formData.status) {
      errors.status = "Status is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateSurvey = () => {
    if (!validateForm()) {
      return
    }

    const newSurvey: Survey = {
      id: generateId(),
      ...formData,
      respondersCount: 0,
      dateAdded: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString(),
      lastUpdated: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString(),
    }

    setSurveys((prev) => [...prev, newSurvey])
    setShowCreateForm(false)
    setEditingSurvey(null)
    resetForm()
    showSuccessMessage("Survey created successfully!")
  }

  const handleEditSurvey = () => {
    if (!validateForm() || !editingSurvey) {
      return
    }

    setSurveys((prev) =>
      prev.map((survey) =>
        survey.id === editingSurvey.id
          ? {
              ...survey,
              ...formData,
              lastUpdated: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString(),
            }
          : survey,
      ),
    )

    setShowCreateForm(false)
    setEditingSurvey(null)
    resetForm()
    showSuccessMessage("Survey updated successfully!")
  }

  const handleCopySurvey = (survey: Survey) => {
    // Find the highest copy number for this survey name
    const existingCopies = surveys.filter(
      (s) =>
        s.name.startsWith(survey.name) &&
        (s.name === survey.name ||
          s.name.match(new RegExp(`^${survey.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} #\\d+$`))),
    )

    const copyNumber = existingCopies.length > 0 ? existingCopies.length + 1 : 1

    const copiedSurvey: Survey = {
      ...survey,
      id: generateId(),
      name: `${survey.name} #${copyNumber}`,
      displayName: `${survey.displayName} #${copyNumber}`,
      dateAdded: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString(),
      lastUpdated: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString(),
    }

    setSurveys((prev) => [...prev, copiedSurvey])
    setShowActionDropdown(null)
    showSuccessMessage("Successfully copied!")
  }

  const handleDeleteSurvey = (id: string) => {
    setSurveys((prev) => prev.filter((survey) => survey.id !== id))
    setShowDeleteModal(null)
    setShowActionDropdown(null)
    showSuccessMessage("Successfully deleted!")
  }

  const handleEditClick = (survey: Survey) => {
    setEditingSurvey(survey)
    setFormData({
      name: survey.name,
      displayName: survey.displayName,
      description: survey.description,
      finishRedirect: survey.finishRedirect,
      status: survey.status,
      startAt: survey.startAt,
      endAt: survey.endAt,
    })
    setShowCreateForm(true)
    setShowActionDropdown(null)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      finishRedirect: "",
      status: "Draft",
      startAt: "",
      endAt: "",
    })
    setFormErrors({})
  }

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const toggleColumn = (id: string) => {
    setColumns(columns.map((col) => (col.id === id ? { ...col, visible: !col.visible } : col)))
  }

  const visibleColumns = columns.filter((col) => col.visible)

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleRespondersClick = (surveyId: string) => {
    router.push(`/surveys/responders/${surveyId}`)
  }

  // Empty state when no surveys exist
  if (surveys.length === 0 && !showCreateForm) {
    return (
      <div className="flex flex-col gap-4">
        {successMessage && (
          <div className="rounded-md bg-green-100 border border-green-400 text-green-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <h1 className="flex items-center text-xl font-semibold">
            <ClipboardList className="mr-2 h-5 w-5" /> Surveys
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="default"
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create new</span>
            <span className="sm:hidden">New</span>
          </Button>

          <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        <div className="rounded-md border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Survey</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Display name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Responders count</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Date added</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Last updated</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Options</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 text-sm" colSpan={8}>
                    <div className="flex items-center justify-center py-8 text-muted-foreground">No results found.</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <button className="rounded-md p-1 hover:bg-muted">
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="rounded-md p-1 hover:bg-muted">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <select className="rounded-md border border-input bg-background px-2 py-1 text-sm">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    )
  }

  // Create/Edit form view
  if (showCreateForm) {
    return (
      <div className="flex flex-col gap-4">
        {successMessage && (
          <div className="rounded-md bg-green-100 border border-green-400 text-green-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{editingSurvey ? "Edit survey" : "Create new survey"}</h1>
          <Button
            variant="default"
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => {
              setShowCreateForm(false)
              setEditingSurvey(null)
              resetForm()
            }}
          >
            Cancel
          </Button>
        </div>

        <div className="rounded-md border border-border bg-card p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Survey name, i.e: Customer satisfaction survey."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Display name</label>
                <Input
                  placeholder="Display name"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className={formErrors.displayName ? "border-red-500" : ""}
                />
                {formErrors.displayName && <p className="text-sm text-red-500">{formErrors.displayName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Survey description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`min-h-[120px] ${formErrors.description ? "border-red-500" : ""}`}
              />
              {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Finish redirect</label>
              <Input
                placeholder="i.e: https://www.google.com"
                value={formData.finishRedirect}
                onChange={(e) => setFormData({ ...formData, finishRedirect: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Draft" | "Active" | "Inactive") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className={formErrors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.status && <p className="text-sm text-red-500">{formErrors.status}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start at</label>
                <Input
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End at</label>
                <Input
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={editingSurvey ? handleEditSurvey : handleCreateSurvey}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Survey list view
  return (
    <div className="flex flex-col gap-4">
      {successMessage && (
        <div className="rounded-md bg-green-100 border border-green-400 text-green-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <h1 className="flex items-center text-xl font-semibold">
          <ClipboardList className="mr-2 h-5 w-5" /> Surveys
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <DropdownMenu open={showColumnsDropdown} onOpenChange={setShowColumnsDropdown}>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Toggle columns</span>
              <span className="sm:hidden">Toggle</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-white border border-gray-200 shadow-lg rounded-md p-0">
            <div className="p-3">
              <div className="space-y-2">
                {columns.map((column) => (
                  <div key={column.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={column.id}
                      checked={column.visible}
                      onCheckedChange={() => toggleColumn(column.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={column.id} className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                      {column.label}
                    </label>
                  </div>
                ))}
              </div>
              <Button
                className="mt-3 w-full bg-blue-500 text-white hover:bg-blue-600 rounded-md py-2 text-sm font-medium"
                onClick={() => setShowColumnsDropdown(false)}
              >
                Save changes
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="default"
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create new</span>
          <span className="sm:hidden">New</span>
        </Button>

        <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <div className="rounded-md border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {visibleColumns.map((column) => (
                  <th key={column.id} className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Options</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((survey) => (
                <tr
                  key={survey.id}
                  className="border-b border-border hover:bg-muted/20 cursor-pointer"
                  onClick={() => handleRespondersClick(survey.id)}
                >
                  {visibleColumns.map((column) => (
                    <td key={column.id} className="px-4 py-3 text-sm">
                      {column.id === "survey" && (
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{survey.id}</span>
                      )}
                      {column.id === "name" && (
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{survey.name}</span>
                      )}
                      {column.id === "displayName" && (
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{survey.displayName}</span>
                      )}
                      {column.id === "respondersCount" && (
                        <button
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => handleRespondersClick(survey.id)}
                        >
                          {survey.respondersCount}
                        </button>
                      )}
                      {column.id === "status" && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            survey.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : survey.status === "Draft"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {survey.status}
                        </span>
                      )}
                      {column.id === "dateAdded" && survey.dateAdded}
                      {column.id === "lastUpdated" && survey.lastUpdated}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu
                      open={showActionDropdown === survey.id}
                      onOpenChange={(open) => setShowActionDropdown(open ? survey.id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowActionDropdown(showActionDropdown === survey.id ? null : survey.id)
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40 bg-white border border-gray-200 shadow-lg rounded-md p-1"
                      >
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            className="flex w-full items-center justify-start gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopySurvey(survey)
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            className="flex w-full items-center justify-start gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditClick(survey)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            className="flex w-full items-center justify-start gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowDeleteModal(survey.id)
                              setShowActionDropdown(null)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <button className="rounded-md p-1 hover:bg-muted">
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="rounded-md p-1 hover:bg-muted">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <select className="rounded-md border border-input bg-background px-2 py-1 text-sm">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <X className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Confirm survey removal</h2>
            </div>

            <div className="rounded-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4">
              <p className="font-medium">⚠ This action will remove 0 responders and 0 custom fields.</p>
              <p>Are you still sure you want to remove this survey? There is no coming back after you do it!</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(null)}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteSurvey(showDeleteModal)}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                🗑 I understand, delete it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
