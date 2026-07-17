"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, FileArchive, RefreshCw, RotateCcw, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { token } from "./common/http";
interface EmailList {
  id?: string
  uniqueId?: string
  uid?: string
  name?: string
  displayName?: string
  subscribersCount?: number
  optIn?: string
  optOut?: string
  dateAdded?: string
  lastUpdated?: string
  archived?: boolean
  general?: {
    list_uid?: string
    display_name?: string
    name?: string
    date_added?: string
    last_updated?: string
    opt_in?: string
    opt_out?: string
    [key: string]: any
  }
  stats?: {
    subscribers?: {
      total?: number
    }
    [key: string]: any
  }
  [key: string]: any
}

const formatDateTime = (dateStr: any) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleString("en-US", { year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch (e) {
    return String(dateStr);
  }
};

export default function ArchivedListsTable() {
  const [archivedLists, setArchivedLists] = useState<EmailList[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const columns = [
    { id: "uniqueId", label: "Unique ID" },
    { id: "name", label: "Name" },
    { id: "displayName", label: "Display name" },
    { id: "subscribersCount", label: "Subscribers count" },
    { id: "optIn", label: "Opt in" },
    { id: "optOut", label: "Opt out" },
    { id: "dateAdded", label: "Date added" },
    { id: "lastUpdated", label: "Last updated" },
    { id: "options", label: "Options" },
  ]

  const { toast } = useToast()
  
  const [unarchiveConfirmOpen, setUnarchiveConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [listToManage, setListToManage] = useState<string | null>(null)

  const loadArchivedLists = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/get-archived-lists`, {
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json"
        }
      })
      const data = await res.json()
      if (res.ok && data?.data?.records) {
        setArchivedLists(data.data.records)
      } else {
        setArchivedLists([])
      }
    } catch (error) {
      console.error("Error loading archived lists:", error)
      setArchivedLists([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadArchivedLists()
  }, [])

  const handleRefresh = async () => {
    await loadArchivedLists()
  }

  const handleRestoreList = (listId: string) => {
    setListToManage(listId)
    setUnarchiveConfirmOpen(true)
  }

  const confirmRestoreList = async () => {
    if (!listToManage) return
    setUnarchiveConfirmOpen(false)
    try {
      const res = await fetch(`/api/unarchive-list?list_uid=${listToManage}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
      })
      if (res.ok) {
        toast({ title: "Success", description: "List restored successfully" })
        loadArchivedLists()
      } else {
        toast({ title: "Error", description: "Failed to restore list", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Error restoring list", variant: "destructive" })
    }
  }

  const handleDeleteList = (listId: string) => {
    setListToManage(listId)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteList = async () => {
    if (!listToManage) return
    setDeleteConfirmOpen(false)
    try {
      const res = await fetch(`/api/delete-list?list_uid=${listToManage}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
      })
      if (res.ok) {
        toast({ title: "Success", description: "List permanently deleted" })
        loadArchivedLists()
      } else {
        toast({ title: "Error", description: "Failed to delete list", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Error deleting list", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="flex items-center text-xl font-semibold">
            <FileArchive className="mr-2 h-5 w-5" /> Archived lists
          </h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading archived lists...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="flex items-center text-xl font-semibold">
          <FileArchive className="mr-2 h-5 w-5" /> Archived lists ({archivedLists.length})
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button 
          className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 rounded-md flex items-center gap-2 font-medium transition-colors text-sm"
        >
          <Link href="/lists" className="flex items-center gap-2">
            All lists
          </Link>
        </button>

        <button 
          onClick={handleRefresh}
          className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 rounded-md flex items-center gap-2 font-medium transition-colors text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="rounded-md border border-gray-200 dark:bg-black bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:bg-slate-800">
                {columns.map((column) => (
                  <th key={column.id} className="px-4 py-3 text-left text-sm font-medium dark:text-white text-gray-700">
                    {column.label}
                    
                  </th> 
                ))}
              </tr>
            </thead>
            <tbody>
              {archivedLists.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center dark:text-yellow-300 text-gray-500">
                    No archived lists found.
                  </td>
                </tr>
              ) : (
                archivedLists.map((list, index) => (
                  <tr key={list.general?.list_uid || list.uid || list.uniqueId || list.id || index} className="border-b border-gray-200 hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.id} className="px-4 py-3 text-sm text-gray-700">
                        {column.id === "options" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRestoreList((list.general?.list_uid || list.uid || list.uniqueId) as string)}
                              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded flex items-center justify-center transition-colors"
                              title="Restore"
                            >
                              <RotateCcw className="h-4 w-4 text-white" />
                            </button>
                            <button
                              onClick={() => handleDeleteList((list.general?.list_uid || list.uid || list.uniqueId) as string)}
                              className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center transition-colors"
                              title="Delete Permanently"
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        ) : column.id === 'subscribersCount' ? (
                          <span>{(list.stats && list.stats.subscribers?.total) || 0}</span>
                        ) : column.id === 'name' || column.id === 'uniqueId' || column.id === 'displayName' ? (
                          <span className="font-medium text-blue-600">
                            {(list.general && list.general[column.id === 'uniqueId' ? 'list_uid' : column.id === 'displayName' ? 'display_name' : column.id]) || list[column.id as keyof EmailList]}
                          </span>
                        ) : column.id === 'dateAdded' || column.id === 'lastUpdated' ? (
                          <span>{formatDateTime((list as any)[column.id === 'dateAdded' ? 'date_added' : 'last_updated'] || (list.general && list.general[column.id === 'dateAdded' ? 'date_added' : 'last_updated']) || list[column.id as keyof EmailList])}</span>
                        ) : (
                          <span>{(list.general && list.general[column.id === 'optIn' ? 'opt_in' : column.id === 'optOut' ? 'opt_out' : column.id]) || list[column.id as keyof EmailList]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Restore Confirmation Dialog */}
      <AlertDialog open={unarchiveConfirmOpen} onOpenChange={setUnarchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this list?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will unarchive the list and move it back to your active lists.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestoreList} className="bg-blue-500 hover:bg-blue-600">Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete list permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the list and remove all its subscribers from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteList} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>)
}
