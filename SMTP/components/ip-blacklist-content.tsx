"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Ban, PlusCircle, Upload, RefreshCw, X, ChevronLeft, ChevronRight, Download, SlidersHorizontal, Trash, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface IpBlacklistItem {
  id: string
  ipAddress: string
  dateAdded: string
}

export default function IpBlacklistContent() {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showError, setShowError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchIp, setSearchIp] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [removeAllDialogOpen, setRemoveAllDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<IpBlacklistItem | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState({
    ipAddress: true,
    dateAdded: true,
  })
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)


  // Start with empty array - no dummy data
  const [ipBlacklistItems, setIpBlacklistItems] = useState<IpBlacklistItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ipBlacklistItems')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ipBlacklistItems', JSON.stringify(ipBlacklistItems))
    }
  }, [ipBlacklistItems])
  // Add this useEffect after your existing useEffects:
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

  // Filter items based on search
  const filteredItems = ipBlacklistItems.filter((item) => {
    const matchesIp = item.ipAddress.toLowerCase().includes(searchIp.toLowerCase())
    return matchesIp
  })


  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ipBlacklistItems')
      if (saved) {
        try {
          setIpBlacklistItems(JSON.parse(saved))
        } catch (error) {
          console.error('Error parsing saved data:', error)
          setIpBlacklistItems([])
        }
      } else {
        setIpBlacklistItems([])
      }
    }
  }
  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId)
    setDeleteDialogOpen(true)
  }
  const handleToggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setIpBlacklistItems((prev) => prev.filter((item) => item.id !== itemToDelete))
      setItemToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleRemoveAll = () => {
    setIpBlacklistItems([])
    setRemoveAllDialogOpen(false)
  }

  const handleUpdateClick = (item: IpBlacklistItem) => {
    setEditingItem(item)
  }

  const handleUpdateSubmit = (updatedItem: IpBlacklistItem) => {
    setIpBlacklistItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    setEditingItem(null)
  }

  const handleExport = () => {
    const csvContent =
      "IP Address,Date Added\n" + ipBlacklistItems.map((item) => `${item.ipAddress},${item.dateAdded}`).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ip-blacklist.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    setImportDialogOpen(true)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleImportFile = () => {
    if (selectedFile) {
      // Placeholder for import functionality
      console.log("Importing file:", selectedFile.name)
      setImportDialogOpen(false)
      setSelectedFile(null)
    }
  }

  const toggleColumn = (column: string) => {
    const newHiddenColumns = new Set(hiddenColumns)
    if (newHiddenColumns.has(column)) {
      newHiddenColumns.delete(column)
    } else {
      newHiddenColumns.add(column)
    }
    setHiddenColumns(newHiddenColumns)
  }

  // Calculate pagination info
  const totalItems = filteredItems.length
  const startItem = totalItems > 0 ? 1 : 0
  const endItem = totalItems
  const resultText = totalItems === 1 ? "result" : "results"

  const handleEdit = (item: IpBlacklistItem) => {
    setEditingItem(item)
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
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

      {showCreateForm ? (
        <CreateIpBlacklistForm
          onCancel={() => setShowCreateForm(false)}
          onSubmit={(success, newItem) => {
            if (success && newItem) {
              setIpBlacklistItems((prev) => [...prev, newItem])
              setShowCreateForm(false)
              setShowSuccess(true)
              setTimeout(() => setShowSuccess(false), 330)
            } else {
              setShowError(true)
            }
          }}
        />
      ) : editingItem ? (
        <UpdateIpBlacklistForm
          item={editingItem}
          onCancel={() => setEditingItem(null)}
          onSubmit={(success, updatedItem) => {
            if (success && updatedItem) {
              handleUpdateSubmit(updatedItem)
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
              <Ban className="mr-2 h-5 w-5" /> IP blacklist
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {ipBlacklistItems.length > 0 && (
              <div className="relative columns-dropdown">
                <Button
                  variant="default"
                  className="bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Toggle columns</span>
                  <span className="sm:hidden">Columns</span>
                </Button>
                {showColumnsDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-48 sm:w-56 bg-white rounded-md shadow-lg border z-50">
                    <div className="p-3">
                      <div className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id="ipAddress"
                          checked={visibleColumns.ipAddress}
                          onChange={() => handleToggleColumn("ipAddress")}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="ipAddress" className="text-sm font-medium text-gray-700">
                          IP Address
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
                          Date Added
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
  )}
              <Button
                variant="default"
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => setShowCreateForm(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create new
              </Button>

              {ipBlacklistItems.length > 0 && (
                <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}

              <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>

              <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

          </div>

          {/* Results counter - only show when there are items */}
          {ipBlacklistItems.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Displaying {startItem}-{endItem} of {totalItems} {resultText}
            </div>
          )}

          <div className="rounded-md border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border dark:bg-gradient-to-r from-teal-600 to-purple-500 bg-gray-50">
                    {visibleColumns.ipAddress && (
                      <td className="px-4 py-2">
                        <Input
                          placeholder="Search IP address..."
                          value={searchIp}
                          onChange={(e) => setSearchIp(e.target.value)}
                          className="h-8 text-sm w-48"
                        />
                      </td>
                    )}
                    {visibleColumns.dateAdded && (
                      <td className="px-4 py-2">{/* Empty cell for Date column */}</td>
                    )}
                    <td className="px-4 py-2">{/* Empty cell for Options column */}</td>
                  </tr>

                  <tr className="border-b border-border bg-muted/50">
                    {visibleColumns.ipAddress && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">IP address</th>
                    )}
                    {visibleColumns.dateAdded && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Date added</th>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Options</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 text-sm" colSpan={Object.values(visibleColumns).filter(Boolean).length + 1}>
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                          {ipBlacklistItems.length === 0 ? "No results found." : "No matching results found."}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                        {visibleColumns.ipAddress && (
                          <td className="px-4 py-3 text-sm text-blue-600">{item.ipAddress}</td>
                        )}
                        {visibleColumns.dateAdded && (
                          <td className="px-4 py-3 text-sm text-muted-foreground">{item.dateAdded}</td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item)}
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                              title="Update"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
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

          {/* Import Dialog */}
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import from CSV file</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-500 text-white p-3 rounded-md text-sm">
                  <p className="font-medium">
                    Please note, the csv file must contain a header with at least the ip_address column.
                  </p>
                  <p className="mt-1">
                    If unsure about how to format your file, do an export first and see how the file looks.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  className="bg-blue-500 text-white hover:bg-blue-600"
                  onClick={handleImportFile}
                  disabled={!selectedFile}
                >
                  Import file
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the IP address from the blacklist.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Remove All Confirmation Dialog */}
          <AlertDialog open={removeAllDialogOpen} onOpenChange={setRemoveAllDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove all IP addresses?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all IP addresses from the blacklist.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setRemoveAllDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveAll} className="bg-red-600 hover:bg-red-700 text-white">
                  Remove All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}

function CreateIpBlacklistForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void
  onSubmit: (success: boolean, newItem?: IpBlacklistItem) => void
}) {
  const [ipAddress, setIpAddress] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ipAddress) {
      onSubmit(false)
      return
    }

    const now = new Date()
    const dateString =
      now.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      }) +
      ", " +
      now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })

    const newItem: IpBlacklistItem = {
      id: Date.now().toString(),
      ipAddress,
      dateAdded: dateString,
    }

    onSubmit(true, newItem)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center text-xl font-semibold">
          <Ban className="mr-2 h-5 w-5" /> Add a new IP to blacklist
        </h1>
        <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            IP address <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="IP address"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  )
}

function UpdateIpBlacklistForm({
  item,
  onCancel,
  onSubmit,
}: {
  item: IpBlacklistItem
  onCancel: () => void
  onSubmit: (success: boolean, updatedItem?: IpBlacklistItem) => void
}) {
  const [ipAddress, setIpAddress] = useState(item.ipAddress)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ipAddress) {
      onSubmit(false)
      return
    }

    const updatedItem: IpBlacklistItem = {
      ...item,
      ipAddress,
    }

    onSubmit(true, updatedItem)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center text-xl font-semibold">
          <Ban className="mr-2 h-5 w-5" /> Update IP in blacklist
        </h1>
        <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            IP address <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="IP address"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
            Update changes
          </Button>
        </div>
      </form>
    </div>
  )
}
