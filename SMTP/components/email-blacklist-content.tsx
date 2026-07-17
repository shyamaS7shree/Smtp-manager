"use client"

import React, { useState, useEffect } from "react"
import { Ban, PlusCircle, Upload, RefreshCw, X, Download, Trash2, ChevronLeft, ChevronRight, Edit, SlidersHorizontal } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface BlacklistEntry {
  id: string
  email: string
  reason: string
  dateAdded: string
}

const loadBlacklistFromStorage = (): BlacklistEntry[] => {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem("blacklistData")
  return saved ? JSON.parse(saved) : []
}

const saveBlacklistToStorage = (data: BlacklistEntry[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("blacklistData", JSON.stringify(data))
}

export default function EmailBlacklistContent() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [searchEmail, setSearchEmail] = useState("")
  const [searchReason, setSearchReason] = useState("")
  const [searchDate, setSearchDate] = useState("")
  const [editingItem, setEditingItem] = useState<BlacklistEntry | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<BlacklistEntry | null>(null)
  const [visibleColumns, setVisibleColumns] = useState({
    email: true,
    reason: true,
    dateAdded: true,
  })
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)

  // Load persisted data
  const [blacklistData, setBlacklistData] = useState<BlacklistEntry[]>(() => {
    const storedData = loadBlacklistFromStorage()
    return storedData
  })
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Load and sort data on mount
  useEffect(() => {
    const storedData = loadBlacklistFromStorage()
    const sortedData = storedData.sort(
      (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    )
    setBlacklistData(sortedData)
    setIsInitialLoad(false)
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (!isInitialLoad && typeof window !== "undefined") {
      saveBlacklistToStorage(blacklistData)
    }
  }, [blacklistData, isInitialLoad])

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target || !(event.target as Element).closest(".columns-dropdown")) {
        setShowColumnsDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  // Auto-hide success alert after 0.33 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 330) // 330 milliseconds = 0.33 seconds

      return () => clearTimeout(timer)
    }
  }, [showSuccess])


  const handleRefresh = () => {
    window.location.reload()
  }

  const handleToggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  const handleRemoveItem = (id: string) => {
    setBlacklistData(prev => prev.filter(item => item.id !== id))
  }

  const handleEditItem = (item: BlacklistEntry) => {
    setEditingItem(item)
    setShowCreateForm(true)
  }

  const handleExportCSV = () => {
    const headers = ['Email', 'Reason', 'Date Added']
    const csvContent = [
      headers.join(','),
      ...blacklistData.map(item => [
        `"${item.email}"`,
        `"${item.reason}"`,
        `"${item.dateAdded}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'email-blacklist.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportCSV = () => {
    if (!importFile) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',')

      const newEntries: BlacklistEntry[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length >= 2 && values[0].trim()) {
          newEntries.push({
            id: Date.now().toString() + i,
            email: values[0].replace(/"/g, '').trim(),
            reason: values[1] ? values[1].replace(/"/g, '').trim() : 'Imported',
            dateAdded: new Date().toLocaleString(),
          })
        }
      }

      setBlacklistData(prev => [...prev, ...newEntries])
      setShowImportModal(false)
      setImportFile(null)
      setShowSuccess(true)
    }
    reader.readAsText(importFile)
  }

  const filteredData = blacklistData.filter((item) => {
    return (
      item.email.toLowerCase().includes(searchEmail.toLowerCase()) &&
      item.reason.toLowerCase().includes(searchReason.toLowerCase()) &&
      item.dateAdded.toLowerCase().includes(searchDate.toLowerCase())
    )
  })

  // Empty state when no data
  if (blacklistData.length === 0 && !showCreateForm) {
    return (
      <div className="flex flex-col gap-6">
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import from CSV file</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-500 text-white p-3 rounded text-sm">
                Please note, the csv file must contain a header with at least the email column.
                If unsure about how to format your file, do an export first and see how the file
                looks.
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">File</label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowImportModal(false)}>
                  Close
                </Button>
                <Button
                  className="bg-blue-500 text-white hover:bg-blue-600"
                  onClick={handleImportCSV}
                  disabled={!importFile}
                >
                  Import file
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className="flex items-center justify-between">
          <h1 className="flex items-center text-xl font-semibold">
            <Ban className="mr-2 h-5 w-5" /> Blacklist
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setShowCreateForm(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create new
            </Button>
            <Button
              variant="default"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-border p-4 sm:p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-gray-200 p-4">
              <Ban className="h-12 w-12 text-gray-500" />
            </div>
            <h2 className="mb-2 text-xl font-semibold"> Manage your email blacklist</h2>
            <p className="max-w-md text-muted-foreground">
              Create your own email blacklist to include subscribers that will never receive emails
              from you and that will never be added to your email lists.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {showSuccess && (
        <Alert className="bg-green-500 text-white border-green-500">
          <AlertDescription className="flex items-center justify-between">
            <span>→ Your form has been successfully saved!</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSuccess(false)}
              className="h-5 w-5 rounded-full p-0 text-white hover:bg-green-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {showError && (
        <Alert variant="destructive" className="bg-red-500 text-white">
          <AlertDescription className="flex items-center justify-between">
            <span>→ Your form has a few errors, please fix them and try again!</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowError(false)}
              className="h-5 w-5 rounded-full p-0 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmItem} onOpenChange={() => setDeleteConfirmItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the email address{" "}
              <span className="font-medium text-gray-900">{deleteConfirmItem?.email}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirmItem(null)}>
                Cancel
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                  if (deleteConfirmItem) {
                    handleRemoveItem(deleteConfirmItem.id)
                    setDeleteConfirmItem(null)
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import from CSV file</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-500 text-white p-3 rounded text-sm">
              Please note, the csv file must contain a header with at least the email column.
              If unsure about how to format your file, do an export first and see how the file
              looks.
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">File</label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Close
              </Button>
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={handleImportCSV}
                disabled={!importFile}
              >
                Import file
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {showCreateForm ? (
        <CreateEmailBlacklistForm
          editingItem={editingItem}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingItem(null)
          }}
          onSubmit={(success, data) => {
            if (success && data) {
              if (editingItem) {
                // Update existing item
                setBlacklistData((prev) =>
                  prev.map((item) =>
                    item.id === editingItem.id
                      ? { ...item, email: data.email, reason: data.reason || "No reason provided" }
                      : item
                  )
                )
              } else {
                // Add new item
                setBlacklistData((prev) => [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    email: data.email,
                    reason: data.reason || "No reason provided",
                    dateAdded: new Date().toLocaleString(),
                  },
                ])
              }
              setShowCreateForm(false)
              setEditingItem(null)
              setShowSuccess(true)
            } else {
              setShowError(true)
            }
          }}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="flex items-center text-xl font-semibold">
              <Ban className="mr-2 h-5 w-5" /> Blacklist
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative columns-dropdown">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 rounded text-sm flex items-center gap-2 font-medium transition-colors"
                  onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Toggle columns
                </Button>
                {showColumnsDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-48 sm:w-56 bg-white rounded-md shadow-lg border z-50">
                    <div className="p-3">
                      <div className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id="email"
                          checked={visibleColumns.email}
                          onChange={() => handleToggleColumn("email")}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id="reason"
                          checked={visibleColumns.reason}
                          onChange={() => handleToggleColumn("reason")}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="reason" className="text-sm font-medium text-gray-700">
                          Reason
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id="dateAdded"
                          checked={visibleColumns.dateAdded}
                          onChange={() => handleToggleColumn("dateAdded")}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="dateAdded" className="text-sm font-medium text-gray-700">
                          Date added
                        </label>
                      </div>
                      <button
                        className="mt-3 w-full bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 rounded text-sm font-medium"
                        onClick={() => setShowColumnsDropdown(false)}
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="default"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 rounded text-sm flex items-center gap-2 font-medium transition-colors"
                onClick={() => setShowCreateForm(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Create new
              </Button>

              <Button
                variant="default"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 rounded text-sm flex items-center gap-2 font-medium transition-colors"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button
                variant="default"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 rounded text-sm flex items-center gap-2 font-medium transition-colors"
                onClick={() => setShowImportModal(true)}
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>

              <Button
                variant="default"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 rounded text-sm flex items-center gap-2 font-medium transition-colors"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            Displaying {filteredData.length} of {blacklistData.length} result{blacklistData.length !== 1 ? 's' : ''}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Search Filters Row */}
            <div className="border-b border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {visibleColumns.email && (
                  <div>
                    <Input
                      placeholder="Search email..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="h-8 text-sm border-gray-300 w-32"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {visibleColumns.email && (
                      <th className="px-4 py-3 text-left font-medium text-gray-700">
                        Email
                      </th>
                    )}
                    {visibleColumns.reason && (
                      <th className="px-4 py-3 text-left font-medium text-gray-700">
                        Reason
                      </th>
                    )}
                    {visibleColumns.dateAdded && (
                      <th className="px-4 py-3 text-left font-medium text-gray-700">
                        Date added
                      </th>
                    )}
                    <th className="w-24 px-4 py-3 text-center font-medium text-gray-700">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      {visibleColumns.email && (
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.email}
                        </td>
                      )}
                      {visibleColumns.reason && (
                        <td className="px-4 py-3 text-gray-600">
                          {item.reason}
                        </td>
                      )}
                      {visibleColumns.dateAdded && (
                        <td className="px-4 py-3 text-gray-600">
                          {item.dateAdded}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => handleEditItem(item)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setDeleteConfirmItem(item)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 px-2">1</span>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function CreateEmailBlacklistForm({
  editingItem,
  onCancel,
  onSubmit,
}: {
  editingItem?: BlacklistEntry | null
  onCancel: () => void
  onSubmit: (success: boolean, data?: { email: string; reason: string }) => void
}) {
  const [email, setEmail] = useState(editingItem?.email || "")
  const [reason, setReason] = useState(editingItem?.reason || "")

  const handleSubmit = () => {
    if (!email) {
      onSubmit(false)
      return
    }
    onSubmit(true, { email, reason })
  }

  return (
    <div className="bg-white dark:bg-black rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center text-xl font-semibold dark:text-white text-gray-900">
          <Ban className="mr-2 h-5 w-5 dark:text-white" />
          {editingItem ? 'Edit email address in blacklist' : 'Add a new email address to blacklist'}
        </h2>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-white text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-gray-300"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium dark:text-white text-gray-700">Reason</label>
          <Textarea
            placeholder="Enter reason for blacklisting (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[120px] w-full border-gray-300"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleSubmit}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}