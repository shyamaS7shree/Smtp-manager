"use client"

import React, { useState, useEffect } from "react"
import { Ban, PlusCircle, Upload, RefreshCw, X, Download, Trash2, ChevronLeft, ChevronRight, Edit, SlidersHorizontal } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { token } from "@/components/common/http"
import { useToast } from "@/components/ui/use-toast"

interface BlacklistEntry {
  uid: string
  email: string
  reason: string
  dateAdded: string
}

export default function EmailBlacklistContent() {
  const { toast } = useToast()
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
  const [showRemoveAllConfirm, setShowRemoveAllConfirm] = useState(false)
  
  const [visibleColumns, setVisibleColumns] = useState({
    email: true,
    reason: true,
    dateAdded: true,
  })
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)
  
  const [blacklistData, setBlacklistData] = useState<BlacklistEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)

  const fetchBlacklist = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/email-blacklist?token=${token()}`, { cache: 'no-store' })
      const json = await res.json()
      if (json.status === 'success' && json.data) {
        setBlacklistData(json.data)
      }
    } catch (err) {
      console.error("Failed to fetch blacklist:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load and sort data on mount
  useEffect(() => {
    fetchBlacklist()
  }, [])

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

  // Auto-hide success alert after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 3000) 
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  const handleRefresh = () => {
    fetchBlacklist()
  }

  const handleToggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  const handleRemoveItem = async (uid: string) => {
    try {
      const res = await fetch(`/api/email-blacklist/${uid}?token=${token()}`, { method: 'DELETE' })
      if (res.ok) {
        setBlacklistData(prev => prev.filter(item => item.uid !== uid))
        toast({ title: 'Success', description: 'Item removed successfully.' })
      } else {
        toast({ title: 'Error', description: 'Failed to remove item.', variant: 'destructive' })
      }
    } catch (err) {
      console.error("Failed to delete item", err)
      toast({ title: 'Error', description: 'Failed to remove item.', variant: 'destructive' })
    }
  }

  const handleRemoveAll = async () => {
    try {
      const res = await fetch(`/api/email-blacklist/all?token=${token()}`, { method: 'DELETE' })
      if (res.ok) {
        setBlacklistData([])
        setShowRemoveAllConfirm(false)
        toast({ title: 'Success', description: 'All items removed successfully.' })
      } else {
        toast({ title: 'Error', description: 'Failed to clear list.', variant: 'destructive' })
      }
    } catch (err) {
      console.error("Failed to clear blacklist", err)
      toast({ title: 'Error', description: 'Failed to clear list.', variant: 'destructive' })
    }
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
        `"${item.reason || ''}"`,
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

  const handleImportCSV = async () => {
    if (!importFile) return
    setIsImporting(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      
      const newEntries = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length >= 1 && values[0].trim()) {
          newEntries.push({
            email: values[0].replace(/"/g, '').trim(),
            reason: values[1] ? values[1].replace(/"/g, '').trim() : 'Imported',
          })
        }
      }

      try {
        const res = await fetch(`/api/email-blacklist/bulk?token=${token()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: newEntries })
        });
        
        if (res.ok) {
          setShowImportModal(false)
          setImportFile(null)
          toast({ title: 'Success', description: 'Emails imported successfully.' })
          fetchBlacklist()
        } else {
          toast({ title: 'Error', description: 'Failed to import emails.', variant: 'destructive' })
        }
      } catch(err) {
        toast({ title: 'Error', description: 'Failed to import emails.', variant: 'destructive' })
      } finally {
        setIsImporting(false)
      }
    }
    reader.readAsText(importFile)
  }

  const filteredData = blacklistData.filter((item) => {
    return (
      item.email.toLowerCase().includes(searchEmail.toLowerCase()) &&
      (item.reason || "").toLowerCase().includes(searchReason.toLowerCase()) &&
      (item.dateAdded || "").toLowerCase().includes(searchDate.toLowerCase())
    )
  })

  // Empty state when no data
  if (blacklistData.length === 0 && !showCreateForm) {
    return (
      <div className="flex flex-col gap-6">
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="sm:max-w-[500px] p-0 gap-0 border-0 overflow-hidden shadow-lg">
            <DialogHeader className="p-4 border-b bg-white">
              <DialogTitle className="text-lg font-normal text-gray-700">Import from CSV file</DialogTitle>
            </DialogHeader>
            <div className="p-5 space-y-5 bg-white">
              <div className="bg-[#00a8ff] text-white p-4 rounded text-[13px] leading-relaxed">
                Please note, the csv file must contain a header with at least the email column.<br />
                If unsure about how to format your file, do an export first and see how the file looks.
              </div>
              <div className="space-y-1">
                <label className="text-[13px] text-gray-600 block mb-1">File</label>
                <div className="flex w-full items-center justify-between rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus-within:ring-1 focus-within:ring-[#00a8ff]">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="w-full cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-gray-400 file:text-xs file:font-normal file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-[#f9fafb]">
              <Button variant="outline" className="text-gray-700 bg-white border-gray-200 hover:bg-gray-50 h-9 px-4 font-normal" onClick={() => setShowImportModal(false)}>
                Close
              </Button>
              <Button
                className="bg-[#00a8ff] hover:bg-[#0097e6] text-white shadow-none h-9 px-4 font-normal"
                onClick={handleImportCSV}
                disabled={!importFile || isImporting}
              >
                {isImporting ? "Importing..." : "Import file"}
              </Button>
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
            <span>→ Action completed successfully!</span>
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
            <span>→ There was an error completing your request.</span>
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
                    handleRemoveItem(deleteConfirmItem.uid)
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
      
      {/* Remove All Confirmation Modal */}
      <Dialog open={showRemoveAllConfirm} onOpenChange={setShowRemoveAllConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Remove All</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to remove all email addresses from your blacklist?
              This action cannot be undone and these emails may receive future campaigns.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRemoveAllConfirm(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={handleRemoveAll}
              >
                Remove all
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 border-0 overflow-hidden shadow-lg">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle className="text-lg font-normal text-gray-700">Import from CSV file</DialogTitle>
          </DialogHeader>
          <div className="p-5 space-y-5 bg-white">
            <div className="bg-[#00a8ff] text-white p-4 rounded text-[13px] leading-relaxed">
              Please note, the csv file must contain a header with at least the email column.<br />
              If unsure about how to format your file, do an export first and see how the file looks.
            </div>
            <div className="space-y-1">
              <label className="text-[13px] text-gray-600 block mb-1">File</label>
              <div className="flex w-full items-center justify-between rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus-within:ring-1 focus-within:ring-[#00a8ff]">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-gray-400 file:text-xs file:font-normal file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t bg-[#f9fafb]">
            <Button variant="outline" className="text-gray-700 bg-white border-gray-200 hover:bg-gray-50 h-9 px-4 font-normal" onClick={() => setShowImportModal(false)}>
              Close
            </Button>
            <Button
              className="bg-[#00a8ff] hover:bg-[#0097e6] text-white shadow-none h-9 px-4 font-normal"
              onClick={handleImportCSV}
              disabled={!importFile || isImporting}
            >
              {isImporting ? "Importing..." : "Import file"}
            </Button>
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
          onSuccess={() => {
            toast({ title: 'Success', description: editingItem ? 'Item updated successfully.' : 'Item added successfully.' })
            setShowCreateForm(false)
            setEditingItem(null)
            fetchBlacklist()
          }}
          onError={() => { toast({ title: 'Error', description: 'Failed to save item.', variant: 'destructive' }) }}
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
                variant="destructive"
                size="sm"
                className="bg-red-500 text-white hover:bg-red-600 px-3 py-2 rounded text-sm flex items-center gap-2 font-medium transition-colors"
                onClick={() => setShowRemoveAllConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
                Remove all
              </Button>

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
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Email
                      </th>
                    )}
                    {visibleColumns.reason && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Reason
                      </th>
                    )}
                    {visibleColumns.dateAdded && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Date added
                      </th>
                    )}
                    <th className="w-24 px-4 py-3 text-center text-sm font-medium text-gray-700">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={`skel-${i}`} className="border-b border-gray-100 animate-pulse">
                        {visibleColumns.email && <td className="px-4 py-3"><Skeleton className="h-4 w-36 bg-gray-200" /></td>}
                        {visibleColumns.reason && <td className="px-4 py-3"><Skeleton className="h-4 w-48 bg-gray-200" /></td>}
                        {visibleColumns.dateAdded && <td className="px-4 py-3"><Skeleton className="h-4 w-28 bg-gray-200" /></td>}
                        <td className="px-4 py-3 text-center"><Skeleton className="h-4 w-12 mx-auto bg-gray-200" /></td>
                      </tr>
                    ))
                  ) : (
                    filteredData.map((item, index) => (
                    <tr key={item.uid} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      {visibleColumns.email && (
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.email}
                        </td>
                      )}
                      {visibleColumns.reason && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.reason}
                        </td>
                      )}
                      {visibleColumns.dateAdded && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(item.dateAdded).toLocaleString()}
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
                  ))
                )}
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
  onSuccess,
  onError
}: {
  editingItem?: BlacklistEntry | null
  onCancel: () => void
  onSuccess: () => void
  onError: () => void
}) {
  const [email, setEmail] = useState(editingItem?.email || "")
  const [reason, setReason] = useState(editingItem?.reason || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!email) {
      onError()
      return
    }
    
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/email-blacklist?token=${token()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason })
      })
      
      if (res.ok) {
        onSuccess()
      } else {
        onError()
      }
    } catch (err) {
      onError()
    } finally {
      setIsSubmitting(false)
    }
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
          <Button 
            type="button" 
            className="bg-blue-500 text-white hover:bg-blue-600" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}