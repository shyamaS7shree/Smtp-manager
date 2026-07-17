"use client"
import React, { useState, useEffect } from "react"
import { Ban, PlusCircle, RefreshCw, X, Eye, Edit, Trash2, Download, ChevronDown, SlidersHorizontal } from "lucide-react"
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

interface SuppressionList {
  id: string
  list: string
  name: string
  dateAdded: string
  lastUpdated: string
}

type SortField = "list" | "name" | "dateAdded" | "lastUpdated"
type SortDirection = "asc" | "desc"

export default function SuppressionListsContent() {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showError, setShowError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [suppressionLists, setSuppressionLists] = useState<SuppressionList[]>([])
  const [listSearch, setListSearch] = useState("")
  const [nameSearch, setNameSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<SuppressionList | null>(null)
  const [sortField, setSortField] = useState<SortField>("dateAdded")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [visibleColumns, setVisibleColumns] = useState({
    list: true,
    name: true,
    dateAdded: true,
    lastUpdated: true,
  })
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)

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

  const handleToggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('suppressionLists')
    if (savedData) {
      try {
        setSuppressionLists(JSON.parse(savedData))
      } catch (error) {
        console.error('Error parsing saved data:', error)
        setSuppressionLists([])
      }
    }
  }, [])

  // Save data to localStorage whenever suppressionLists changes
 // Save data to localStorage whenever suppressionLists changes
useEffect(() => {
  if (suppressionLists.length > 0) {
    localStorage.setItem('suppressionLists', JSON.stringify(suppressionLists))
  } else {
    // Clear localStorage when no items exist
    localStorage.removeItem('suppressionLists')
  }
}, [suppressionLists])

  const handleRefresh = () => {
    // Instead of router.refresh(), just reload data from localStorage
    const savedData = localStorage.getItem('suppressionLists')
    if (savedData) {
      try {
        setSuppressionLists(JSON.parse(savedData))
      } catch (error) {
        console.error('Error parsing saved data:', error)
        setSuppressionLists([])
      }
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      setSuppressionLists((prev) => prev.filter((item) => item.id !== itemToDelete))
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handleView = (item: SuppressionList) => {
    // View functionality - could open a modal or navigate to detail page
    console.log("Viewing:", item)
  }

  const handleEdit = (item: SuppressionList) => {
    setEditingItem(item)
    setShowCreateForm(true)
  }

  const filteredLists = suppressionLists.filter((item) => {
    const matchesList = item.list.toLowerCase().includes(listSearch.toLowerCase())
    const matchesName = item.name.toLowerCase().includes(nameSearch.toLowerCase())
    return matchesList && matchesName
  })

  // Sort the filtered lists
  const sortedLists = [...filteredLists].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  if (showCreateForm) {
    return (
      <CreateSuppressionListForm
        editingItem={editingItem}
        onCancel={() => {
          setShowCreateForm(false)
          setEditingItem(null)
        }}
        onSubmit={(success, data) => {
          if (success && data) {
            if (editingItem) {
              // Update existing item
              setSuppressionLists((prev) =>
                prev.map((item) => (item.id === editingItem.id ? { ...data, id: editingItem.id } : item)),
              )
            } else {
              // Add new item
              const newItem: SuppressionList = {
                ...data,
                id: Date.now().toString(),
              }
              setSuppressionLists((prev) => [...prev, newItem])
            }
            setShowCreateForm(false)
            setEditingItem(null)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 330)
          } else {
            setShowError(true)
          }
        }}
      />
    )
  }

  // Show empty state when no suppression lists exist
  if (suppressionLists.length === 0) {
    return (
      <div className="flex flex-col gap-4">
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

        <div className="flex items-center justify-between">
          <h1 className="flex items-center text-xl font-semibold">
            <Ban className="mr-2 h-5 w-5" /> Suppression lists
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setShowCreateForm(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create new</span>
              <span className="sm:hidden">New</span>
            </Button>

            <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-border p-4 sm:p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-gray-200 p-4">
              <Ban className="h-12 w-12 text-gray-500" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Manage your suppression lists</h2>
            <p className="max-w-md text-muted-foreground">
              Create your own suppression lists where you can import email addresses that will never receive emails from
              you. You will be able to select these lists to be used in various places, such as when sending a campaign.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show table view when suppression lists exist
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

      <div className="flex items-center justify-between">
        <h1 className="flex items-center text-xl font-semibold">
          <Ban className="mr-2 h-5 w-5" /> Suppression lists
        </h1>
        <div className="flex items-center gap-2">
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
                      id="list"
                      checked={visibleColumns.list}
                      onChange={() => handleToggleColumn("list")}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="list" className="text-sm font-medium text-gray-700">
                      List
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      id="name"
                      checked={visibleColumns.name}
                      onChange={() => handleToggleColumn("name")}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Name
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
                  <div className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      id="lastUpdated"
                      checked={visibleColumns.lastUpdated}
                      onChange={() => handleToggleColumn("lastUpdated")}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="lastUpdated" className="text-sm font-medium text-gray-700">
                      Last updated
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
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => setShowCreateForm(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create new</span>
            <span className="sm:hidden">New</span>
          </Button>

          <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Displaying {sortedLists.length > 0 ? "1" : "0"}-{sortedLists.length} of {sortedLists.length} result
        {sortedLists.length !== 1 ? "s" : ""}
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              {visibleColumns.list && (
                <th className="p-2 text-left border-b">
                  <Input
                    type="text"
                    placeholder="Search list..."
                    value={listSearch}
                    onChange={(e) => setListSearch(e.target.value)}
                    className="h-8 text-xs"
                  />
                </th>
              )}
              {visibleColumns.name && (
                <th className="p-2 text-left border-b">
                  <Input
                    type="text"
                    placeholder="Search name..."
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    className="h-8 text-xs"
                  />
                </th>
              )}
              {visibleColumns.dateAdded && (
                <th className="p-2 text-left border-b"></th>
              )}
              {visibleColumns.lastUpdated && (
                <th className="p-2 text-left border-b"></th>
              )}
              <th className="p-2 text-left border-b"></th>
            </tr>
            <tr className="bg-muted/50">
              {visibleColumns.list && (
                <th className="p-3 text-left text-sm font-normal border-b">
                  List
                </th>
              )}
              {visibleColumns.name && (
                <th className="p-3 text-left text-sm font-normal border-b">
                  Name
                </th>
              )}
              {visibleColumns.dateAdded && (
                <th className="p-3 text-left text-sm font-normal border-b">
                  Date added
                </th>
              )}
              {visibleColumns.lastUpdated && (
                <th className="p-3 text-left text-sm font-normal border-b">
                  Last updated
                </th>
              )}
              <th className="p-3 text-left text-sm font-normal border-b">Options</th>
            </tr>
          </thead>
          <tbody>
            {sortedLists.length > 0 ? (
              sortedLists.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/30">
                  {visibleColumns.list && (
                    <td className="p-3 text-blue-600 text-sm">
                      {item.list}
                    </td>
                  )}
                  {visibleColumns.name && (
                    <td className="p-3 text-blue-600 text-sm">
                      {item.name}
                    </td>
                  )}
                  {visibleColumns.dateAdded && (
                    <td className="p-3 text-sm">{item.dateAdded}</td>
                  )}
                  {visibleColumns.lastUpdated && (
                    <td className="p-3 text-sm">{item.lastUpdated}</td>
                  )}
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(item)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
            ) : (
              <tr>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="p-8 text-center text-muted-foreground">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <select className="h-8 rounded border px-2 text-sm">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the suppression list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CreateSuppressionListForm({
  editingItem,
  onCancel,
  onSubmit,
}: {
  editingItem?: SuppressionList | null
  onCancel: () => void
  onSubmit: (success: boolean, data?: Omit<SuppressionList, "id">) => void
}) {
  const [name, setName] = useState(editingItem?.name || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      onSubmit(false)
      return
    }

    const currentDate = new Date().toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    const data = {
      list: `web${Date.now().toString().slice(-8)}`,
      name: name.trim(),
      dateAdded: editingItem?.dateAdded || currentDate,
      lastUpdated: currentDate,
    }

    onSubmit(true, data)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center text-xl font-semibold">
          <Ban className="mr-2 h-5 w-5" /> {editingItem ? "Update" : "Create new"}
        </h1>
        <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
            {editingItem ? "Update changes" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}