"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Menu, ChevronDown, Trash2, Save, CheckCircle, AlertCircle, Info, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import SidebarNav from "@/components/sidebar-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { apiUrl, token } from "@/components/common/http"

// ---------- API FIELD TYPE ----------
interface ApiFieldType {
  identifier: string
  name: string
  description: string
}

// ---------- API DATA SHAPE ----------
interface ApiField {
  field_id: number
  label: string
  tag: string
  required: "yes" | "no"
  sort_order: number
  default_value: string | null
  help_text: string | null
  description: string | null
  type: {
    description: string
    identifier: string
    name: string
  }
}

// ---------- UI FIELD (EXTENDS API FIELD) ----------
interface Field extends ApiField {
  visibility: string
  errors: {
    label?: string
    tag?: string
    sort_order?: string
    required?: string
    visibility?: string
    api?: string
  }
  saved: boolean
  saving: boolean
  isNew?: boolean
}

export default function CustomFieldsPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params?.id as string
  const isMobile = useIsMobile()

  const [fields, setFields] = useState<Field[]>([])
  const [apiFieldTypes, setApiFieldTypes] = useState<ApiFieldType[]>([])
  const [fieldTypesLoading, setFieldTypesLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [fieldToDelete, setFieldToDelete] = useState<number | null>(null)
  const [globalSaving, setGlobalSaving] = useState(false)
  const [globalMessage, setGlobalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // ---------- FETCH FIELD TYPES FROM API ----------
  const fetchFieldTypes = async () => {
  setFieldTypesLoading(true)
  try {
    const res = await fetch(
      `/api/get-all-list-field-types?token=${token()}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
      }
    )

     if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    console.log("✅ Field types:", data)

    const records = data?.data?.records || data?.data?.data?.records || [] 
    console.log("✅ Records:", records)
    setApiFieldTypes(records)
  } catch (error) {
    console.error("❌ Error fetching field types:", error)
    setApiFieldTypes([])
  } finally {
    setFieldTypesLoading(false)
  }
}

  // ---------- LOAD CUSTOM FIELDS FROM API ----------
  const allCustomFields = async () => {
    if (!listId) return

    setLoading(true)
    const url = new URL("/api/get-all-fields", window.location.origin)
    url.searchParams.append("list_uid", listId)
    url.searchParams.append("token", token())

    try {
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      const jsonData = await res.json()

      if (!res.ok) {
        throw new Error(jsonData?.message || "Failed to fetch custom fields")
      }

      const apiRecords: ApiField[] = jsonData?.data?.data?.records || []
      console.log("Fetched custom fields:", apiRecords)

      const mappedFields: Field[] = apiRecords.map((f) => ({
        ...f,
        visibility: "Visible",
        errors: {},
        saved: true,
        saving: false,
        isNew: false,
      }))

      setFields(mappedFields)
    } catch (error: any) {
      console.error("Error fetching custom fields:", error)
      setGlobalMessage({ type: "error", text: error.message || "Failed to load custom fields" })
      setTimeout(() => setGlobalMessage(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    allCustomFields()
  }, [listId])

  // ---------- VALIDATION ----------
  const validateField = (field: Field) => {
    const errors: Field["errors"] = {}

    if (!field.label?.trim()) {
      errors.label = "Label is required"
    }
    if (!field.tag?.trim()) {
      errors.tag = "Tag is required"
    }
    if (!field.required) {
      errors.required = "Required field must be selected"
    }
    if (!field.visibility) {
      errors.visibility = "Visibility must be selected"
    }
    if (field.sort_order === null || field.sort_order === undefined) {
      errors.sort_order = "Sort order is required"
    } else if (isNaN(Number(field.sort_order))) {
      errors.sort_order = "Sort order must be a valid number"
    }

    return errors
  }

  // ---------- UPDATE FIELD HELPER ----------
  const updateField = (fieldId: number, fieldName: keyof Field, value: any) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.field_id === fieldId) {
          const updatedField: Field = {
            ...f,
            [fieldName]: value,
            saved: false,
          }
          if (updatedField.errors[fieldName as keyof Field["errors"]]) {
            const newErrors = { ...updatedField.errors }
            delete newErrors[fieldName as keyof Field["errors"]]
            updatedField.errors = newErrors
          }
          return updatedField
        }
        return f
      })
    )
  }

  // ---------- DELETE FIELD ----------
  const removeField = async (fieldId: number) => {
    const field = fields.find((f) => f.field_id === fieldId)
    if (!field) return

    if (field.isNew) {
      setFields((prev) => prev.filter((f) => f.field_id !== fieldId))
      setDeleteConfirmOpen(false)
      setFieldToDelete(null)
      showToast("success", "Field removed")
      return
    }

    try {
      setFields((prev) => prev.map((f) => (f.field_id === fieldId ? { ...f, saving: true } : f)))

      const url = new URL("/api/delete-list-field", window.location.origin)
      url.searchParams.append("list_uid", listId)
      url.searchParams.append("field_id", String(fieldId))
      url.searchParams.append("token", token())

      const res = await fetch(url.toString(), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete field")
      }

      setFields((prev) => prev.filter((f) => f.field_id !== fieldId))
      setDeleteConfirmOpen(false)
      setFieldToDelete(null)
      showToast("success", "Field deleted successfully")
    } catch (err: any) {
      console.error("Error deleting field:", err)
      setFields((prev) =>
        prev.map((f) =>
          f.field_id === fieldId
            ? { ...f, saving: false, errors: { ...f.errors, api: err.message || "Error deleting field" } }
            : f
        )
      )
      showToast("error", err.message || "Error deleting field")
    }
  }

  const handleDeleteClick = (fieldId: number) => {
    setFieldToDelete(fieldId)
    setDeleteConfirmOpen(true)
  }

  const cancelDelete = () => {
    setDeleteConfirmOpen(false)
    setFieldToDelete(null)
  }

  // ---------- SAVE ONE FIELD ----------
  const saveField = async (fieldId: number) => {
    const field = fields.find((f) => f.field_id === fieldId)
    if (!field) return

    const errors = validateField(field)
    if (Object.keys(errors).length > 0) {
      setFields((prev) => prev.map((f) => (f.field_id === fieldId ? { ...f, errors } : f)))
      return
    }

    setFields((prev) => prev.map((f) => (f.field_id === fieldId ? { ...f, saving: true, errors: {} } : f)))

    try {
      const isCreate = field.isNew

      const payload = {
        list_uid: listId,
        token: token(),
        ...(isCreate
          ? {
              type: field.type?.identifier || "text",
              label: field.label,
              tag: field.tag,
              required: field.required,
              visibility: field.visibility.toLowerCase(),
            }
          : {
              field_id: fieldId,
              label: field.label,
              tag: field.tag,
              required: field.required,
              visibility: field.visibility.toLowerCase(),
            }),
      }

      const endpoint = isCreate
        ? "/api/create-list-field"
        : "/api/update-list-field"

      const url = new URL(endpoint, window.location.origin)

      const res = await fetch(url.toString(), {
        method: isCreate ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || `Failed to ${isCreate ? "create" : "update"} field`)
      }

      if (isCreate) {
        await allCustomFields()
      } else {
        setFields((prev) => prev.map((f) => (f.field_id === fieldId ? { ...f, saved: true, saving: false } : f)))
      }

      showToast("success", `${field.label || "Field"} ${isCreate ? "created" : "updated"} successfully!`)
    } catch (err: any) {
      console.error("Error saving field:", err)
      setFields((prev) =>
        prev.map((f) =>
          f.field_id === fieldId
            ? { ...f, saving: false, errors: { api: err.message || "Error saving field" } }
            : f
        )
      )
      showToast("error", err.message || "Error saving field")
    }
  }

  // ---------- SAVE ALL ----------
  const saveAllFields = async () => {
    let hasErrors = false
    const validated = fields.map((field) => {
      const errors = validateField(field)
      if (Object.keys(errors).length > 0) {
        hasErrors = true
        return { ...field, errors }
      }
      return { ...field, errors: {} }
    })

    setFields(validated)

    if (hasErrors) {
      setGlobalMessage({ type: "error", text: "Please fix validation errors before saving all fields." })
      setTimeout(() => setGlobalMessage(null), 5000)
      return
    }

    setGlobalSaving(true)

    try {
      const unsavedFields = fields.filter((f) => !f.saved)
      for (const field of unsavedFields) {
        await saveField(field.field_id)
      }
      setGlobalMessage({ type: "success", text: `All ${unsavedFields.length} field(s) saved successfully!` })
      setTimeout(() => setGlobalMessage(null), 5000)
    } catch (err: any) {
      setGlobalMessage({ type: "error", text: err.message || "Error saving fields" })
      setTimeout(() => setGlobalMessage(null), 5000)
    } finally {
      setGlobalSaving(false)
    }
  }

  // ---------- TOAST HELPER ----------
  const showToast = (type: "success" | "error", message: string) => {
    const messageDiv = document.createElement("div")
    messageDiv.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
      type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
    } transition-all duration-300`
    messageDiv.textContent = message
    document.body.appendChild(messageDiv)
    setTimeout(() => messageDiv.remove(), 3000)
  }

  // ---------- ADD NEW FIELD ----------
  const addNewField = (fieldType: ApiFieldType) => {
    const newField: Field = {
      field_id: Date.now(),
      label: "",
      tag: "",
      required: "yes",
      sort_order: fields.length,
      help_text: null,
      default_value: null,
      description: null,
      type: {
        description: fieldType.description || fieldType.name,
        identifier: fieldType.identifier,
        name: fieldType.name,
      },
      visibility: "Visible",
      errors: {},
      saved: false,
      saving: false,
      isNew: true,
    }

    setFields((prev) => [...prev, newField])
    setDropdownOpen(false)
    showToast("success", `New ${fieldType.name} field added. Don't forget to save!`)
  }

  const handleBackToList = () => {
    router.push(`/lists/${listId}`)
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background relative">

        {/* Desktop Sidebar */}
        {!isMobile && <SidebarNav />}

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={cancelDelete}
          >
            <div
              className="w-80 bg-white dark:bg-red-950 rounded-xl shadow-2xl border border-gray-200 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-red-500 mb-2">Delete Field</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this field? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelDelete}
                    className="px-4 py-2 text-gray-700 dark:text-lime-400 dark:hover:bg-sky-700 hover:bg-gray-50 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => fieldToDelete && removeField(fieldToDelete)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Field Type Dropdown Modal */}
        {dropdownOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setDropdownOpen(false)}
          >
            <div
              className="w-72 max-h-96 bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/30 p-2 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 p-2 rounded-t-lg mb-2 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm">Add Field Type</h3>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="text-white hover:text-red-200 w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="space-y-1 max-h-80 overflow-y-auto">

                {/* Loading */}
                {fieldTypesLoading && (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-white text-xs">Loading field types...</p>
                  </div>
                )}

                {/* API Field Types */}
                {!fieldTypesLoading && apiFieldTypes.length > 0 &&
                  apiFieldTypes.map((fieldType, index) => (
                    <button
                      key={fieldType.identifier || index}
                      onClick={() => addNewField(fieldType)}
                      className="w-full text-left text-sm py-3 px-4 hover:bg-blue-500 active:bg-blue-600 cursor-pointer text-white font-medium rounded-lg transition-all duration-200 hover:scale-[1.01] hover:shadow-lg border border-transparent hover:border-blue-400"
                    >
                      {fieldType.name || fieldType.description}
                    </button>
                  ))
                }

                {/* Empty State */}
                {!fieldTypesLoading && apiFieldTypes.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-white text-xs">No field types available</p>
                    <button
                      onClick={fetchFieldTypes}
                      className="mt-2 text-blue-300 text-xs underline"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300 cursor-pointer" />
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <SidebarNav isMobile={true} />
                  </SheetContent>
                </Sheet>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:bg-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to List</span>
              </Button>

              {!isMobile && <div className="w-px h-4 bg-gray-300" />}
              <span className="text-sm font-medium dark:text-gray-100 text-gray-900">
                {loading
                  ? "Loading..."
                  : fields.length === 0
                  ? "List custom fields"
                  : `${fields.length} Custom field${fields.length !== 1 ? "s" : ""}`}
              </span>
            </div>

            {/* ✅ Add Field Button - fetches types on open */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDropdownOpen(true)
                fetchFieldTypes()
              }}
              className="flex items-center gap-2 dark:bg-gray-800 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
            >
              <span className="text-sm">Add Field</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">

              {/* Global Save Message + Button */}
              {fields.length > 0 && (
                <div className="mb-4 flex justify-between items-center">
                  {globalMessage && (
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        globalMessage.type === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {globalMessage.type === "success" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{globalMessage.text}</span>
                    </div>
                  )}
                  <Button
                    onClick={saveAllFields}
                    disabled={globalSaving || !fields.some((f) => !f.saved)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 flex items-center gap-2"
                  >
                    {globalSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving All...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save All Fields
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading custom fields...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && fields.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-medium dark:text-gray-100 text-gray-900 mb-2">No custom fields yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first custom field to get started</p>
                  <Button
                    onClick={() => {
                      setDropdownOpen(true)
                      fetchFieldTypes()
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Your First Field
                  </Button>
                </div>
              )}

              {/* Field List */}
              {!loading && fields.length > 0 && (
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div
                      key={field.field_id}
                      id={`field-${field.field_id}`}
                      className={`border rounded-lg shadow-sm transition-all duration-300 ${
                        field.saved
                          ? "border-green-200 bg-green-50/30 dark:bg-green-950/20"
                          : Object.keys(field.errors).length > 0
                          ? "border-red-200 bg-red-50/30 dark:bg-red-950/20"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {/* Field Header */}
                      <div
                        className={`px-4 py-2 rounded-t-lg flex items-center justify-between ${
                          field.saved
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : Object.keys(field.errors).length > 0
                            ? "bg-gradient-to-r from-red-500 to-red-600"
                            : "bg-gradient-to-r from-blue-500 to-blue-600"
                        } text-white`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📝</span>
                          <span className="text-sm font-medium">{field.type?.name || field.type?.description || "Custom field"}</span>
                          {field.isNew && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">New</span>
                          )}
                          {field.saved && <CheckCircle className="h-4 w-4 text-green-200" />}
                          {Object.keys(field.errors).length > 0 && <AlertCircle className="h-4 w-4 text-red-200" />}
                        </div>
                        <button
                          onClick={() => handleDeleteClick(field.field_id)}
                          className="text-white hover:text-red-200 text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Field Content */}
                      <div className="p-4 bg-white dark:bg-gray-900">
                        {/* First Row */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">

                          {/* Label */}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Label className="text-xs text-gray-600 dark:text-gray-300">
                                Label <span className="text-red-500">*</span>
                              </Label>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white p-2 rounded max-w-xs">
                                  <p className="text-xs">The display name for this field that subscribers will see</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(field.field_id, "label", e.target.value)}
                              placeholder="Enter label"
                              className={`text-xs h-7 transition-colors ${
                                field.errors.label
                                  ? "border-red-300 bg-red-50 dark:bg-red-950/50"
                                  : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                              }`}
                            />
                            {field.errors.label && (
                              <p className="text-xs text-red-600 mt-1">{field.errors.label}</p>
                            )}
                          </div>

                          {/* Tag */}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Label className="text-xs text-gray-600 dark:text-gray-300">
                                Tag <span className="text-red-500">*</span>
                              </Label>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white p-2 rounded max-w-xs">
                                  <p className="text-xs">The unique identifier used in email templates (e.g., [EMAIL])</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Input
                              value={field.tag}
                              onChange={(e) => updateField(field.field_id, "tag", e.target.value)}
                              placeholder="Enter tag"
                              className={`text-xs h-7 transition-colors ${
                                field.errors.tag
                                  ? "border-red-300 bg-red-50 dark:bg-red-950/50"
                                  : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                              }`}
                            />
                            {field.errors.tag && (
                              <p className="text-xs text-red-600 mt-1">{field.errors.tag}</p>
                            )}
                          </div>

                          {/* Required */}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Label className="text-xs text-gray-600 dark:text-gray-300">
                                Required <span className="text-red-500">*</span>
                              </Label>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white p-2 rounded max-w-xs">
                                  <p className="text-xs">Whether subscribers must fill this field to subscribe</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Select
                              value={field.required}
                              onValueChange={(value) => updateField(field.field_id, "required", value as "yes" | "no")}
                            >
                              <SelectTrigger
                                className={`text-xs h-7 transition-colors dark:bg-gray-700 ${
                                  field.errors.required
                                    ? "border-red-300 bg-red-50 dark:bg-red-950/50"
                                    : "bg-gray-50/80 border-gray-200 hover:border-blue-300"
                                }`}
                              >
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            {field.errors.required && (
                              <p className="text-xs text-red-600 mt-1">{field.errors.required}</p>
                            )}
                          </div>

                          {/* Visibility */}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Label className="text-xs text-gray-600 dark:text-gray-300">
                                Visibility <span className="text-red-500">*</span>
                              </Label>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white p-2 rounded max-w-xs">
                                  <p className="text-xs">
                                    Hidden fields are rendered in the form but hidden. None fields are not rendered at all.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Select
                              value={field.visibility}
                              onValueChange={(value) => updateField(field.field_id, "visibility", value)}
                            >
                              <SelectTrigger
                                className={`text-xs h-7 transition-colors dark:bg-gray-700 ${
                                  field.errors.visibility
                                    ? "border-red-300 bg-red-50 dark:bg-red-950/50"
                                    : "bg-gray-50/80 border-gray-200 hover:border-blue-300"
                                }`}
                              >
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Visible">Visible</SelectItem>
                                <SelectItem value="Hidden">Hidden</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                              </SelectContent>
                            </Select>
                            {field.errors.visibility && (
                              <p className="text-xs text-red-600 mt-1">{field.errors.visibility}</p>
                            )}
                          </div>

                          {/* Sort Order */}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Label className="text-xs text-gray-600 dark:text-gray-300">
                                Sort order <span className="text-red-500">*</span>
                              </Label>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white p-2 rounded max-w-xs">
                                  <p className="text-xs">Decide the order of the fields shown in the form</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Select
                              value={
                                field.sort_order === null || field.sort_order === undefined
                                  ? ""
                                  : String(field.sort_order)
                              }
                              onValueChange={(value) => updateField(field.field_id, "sort_order", Number(value))}
                            >
                              <SelectTrigger
                                className={`text-xs h-7 transition-colors dark:bg-gray-700 ${
                                  field.errors.sort_order
                                    ? "border-red-300 bg-red-50 dark:bg-red-950/50"
                                    : "border-gray-200 hover:border-blue-300 focus:border-blue-500"
                                }`}
                              >
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-48">
                                {Array.from({ length: 40 }, (_, i) => i - 20).map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {field.errors.sort_order && (
                              <p className="text-xs text-red-600 mt-1">{field.errors.sort_order}</p>
                            )}
                          </div>
                        </div>

                        {/* Second Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          {/* Help Text */}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Label className="text-xs text-gray-600 dark:text-gray-300">Help text</Label>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white p-2 rounded max-w-xs">
                                  <p className="text-xs">If you need to describe this field to your subscribers</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Input
                              value={field.help_text ?? ""}
                              onChange={(e) => updateField(field.field_id, "help_text", e.target.value)}
                              placeholder="Enter help text"
                              className="text-xs h-7 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
                            />
                          </div>

                          {/* Default Value */}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Label className="text-xs text-gray-600 dark:text-gray-300">Default value</Label>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white p-2 rounded max-w-xs">
                                  <p className="text-xs">Use dynamic tags like [DATETIME], [SUBSCRIBER_IP], etc.</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Input
                              value={field.default_value ?? ""}
                              onChange={(e) => updateField(field.field_id, "default_value", e.target.value)}
                              placeholder="Enter default value"
                              className="text-xs h-7 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mt-3">
                          <div className="flex items-center gap-1 mb-1">
                            <Label className="text-xs text-gray-600 dark:text-gray-300">Description</Label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 text-white p-2 rounded max-w-xs">
                                <p className="text-xs">Additional description for this field to show to your subscribers</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Textarea
                            value={field.description ?? ""}
                            onChange={(e) => updateField(field.field_id, "description", e.target.value)}
                            placeholder="Enter description"
                            className="text-xs h-16 resize-none border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        {/* API Error */}
                        {field.errors.api && (
                          <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/50 border border-red-200 rounded text-xs text-red-600">
                            {field.errors.api}
                          </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => saveField(field.field_id)}
                            disabled={field.saving || field.saved}
                            className={`px-4 py-1.5 text-xs flex items-center gap-2 ${
                              field.saved
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            } text-white`}
                          >
                            {field.saving ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                Saving...
                              </>
                            ) : field.saved ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Saved
                              </>
                            ) : (
                              <>
                                <Save className="h-3 w-3" />
                                {field.isNew ? "Create Field" : "Update Field"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}