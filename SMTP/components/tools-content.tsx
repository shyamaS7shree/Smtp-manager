"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { FileText, Users, X, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import { useToast } from "@/components/ui/use-toast"
import { token } from "@/components/common/http"

interface ListOption {
  uid: string
  name: string
}

export default function ToolsContent() {
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [lists, setLists] = useState<ListOption[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await fetch(`/api/get-all-lists?pageNumber=1&perPage=100&token=${token()}`)
        const data = await res.json()
        const records = data?.data?.records || data?.data?.data?.records || [];
        
        if (records && records.length > 0) {
          setLists(records.map((r: any) => ({ 
            uid: r?.general?.list_uid || r?.general?.unique_id || String(r?.general?.id), 
            name: r?.general?.name || "Unnamed List" 
          })))
        }
      } catch (err) {
        console.error("Failed to load lists", err)
      }
    }
    fetchLists()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="flex items-center text-xl font-semibold">
          <FileText className="mr-2 h-5 w-5" /> Tools
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-border bg-card p-8 transition-colors hover:border-blue-200 hover:bg-blue-50"
          onClick={() => setShowSyncModal(true)}
        >
          <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-500">
            <Users className="h-8 w-8" />
          </div>
          <h2 className="mb-1 text-2xl font-bold text-blue-500">Sync</h2>
          <p className="text-center text-muted-foreground">Subscribers</p>
        </div>

        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-border bg-card p-8 transition-colors hover:border-blue-200 hover:bg-blue-50"
          onClick={() => setShowSplitModal(true)}
        >
          <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-500">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="mb-1 text-2xl font-bold text-blue-500">Split</h2>
          <p className="text-center text-muted-foreground">List</p>
        </div>
      </div>

      {/* Sync Modal */}
      {showSyncModal && (
        <DraggableModal title="Sync lists" onClose={() => setShowSyncModal(false)}>
          <SyncModalContent lists={lists} onClose={() => setShowSyncModal(false)} toast={toast} />
        </DraggableModal>
      )}

      {/* Split Modal */}
      {showSplitModal && (
        <DraggableModal title="Split list" onClose={() => setShowSplitModal(false)}>
          <SplitModalContent lists={lists} onClose={() => setShowSplitModal(false)} toast={toast} />
        </DraggableModal>
      )}
    </div>
  )
}

function DraggableModal({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode
  title: string
  onClose: () => void
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  // Center the modal on initial render
  useEffect(() => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect()
      const x = Math.max(0, (window.innerWidth - rect.width) / 2)
      const y = Math.max(0, (window.innerHeight - rect.height) / 4)
      setPosition({ x, y })
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && modalRef.current) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Keep the modal within the viewport
      const maxX = window.innerWidth - modalRef.current.offsetWidth
      const maxY = window.innerHeight - modalRef.current.offsetHeight

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="absolute max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-background shadow-lg"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "auto",
        }}
      >
        <div
          className="flex cursor-grab items-center justify-between border-b border-border bg-muted/50 p-4"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[calc(90vh-4rem)] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}

function SyncModalContent({ lists, onClose, toast }: { lists: ListOption[], onClose: () => void, toast: any }) {
  const [primaryList, setPrimaryList] = useState("")
  const [secondaryList, setSecondaryList] = useState("")
  const [missingAction, setMissingAction] = useState("Do nothing")
  const [duplicateAction, setDuplicateAction] = useState("Do nothing")
  const [distinctAction, setDistinctAction] = useState("Do nothing")
  const [loading, setLoading] = useState(false)

  const handleSync = async () => {
    if (!primaryList || !secondaryList) {
      toast({ title: "Error", description: "Please select both lists.", variant: "destructive" })
      return
    }
    if (primaryList === secondaryList) {
      toast({ title: "Error", description: "Primary and secondary lists must be different.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/tools/sync-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          primary_list_uid: primaryList,
          secondary_list_uid: secondaryList,
          missing_action: missingAction,
          duplicate_action: duplicateAction,
          distinct_action: distinctAction,
        }),
      })

      const data = await res.json()
      if (data.status === "success") {
        toast({ title: "Success", description: data.message })
        onClose()
      } else {
        toast({ title: "Error", description: data.message || "Failed to sync lists", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Primary list <span className="text-red-500">*</span>
          </label>
          <Select value={primaryList} onValueChange={setPrimaryList}>
            <SelectTrigger className="w-full border-input bg-background">
              <SelectValue placeholder="Select list" />
            </SelectTrigger>
            <SelectContent>
              {lists.map(l => (
                <SelectItem key={`p-${l.uid}`} value={l.uid}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Secondary list <span className="text-red-500">*</span>
          </label>
          <Select value={secondaryList} onValueChange={setSecondaryList}>
            <SelectTrigger className="w-full border-input bg-background">
              <SelectValue placeholder="Select list" />
            </SelectTrigger>
            <SelectContent>
              {lists.map(l => (
                <SelectItem key={`s-${l.uid}`} value={l.uid}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Action on missing subscribers</label>
          <Select value={missingAction} onValueChange={setMissingAction}>
            <SelectTrigger className="w-full border-input bg-background">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Do nothing">Do nothing</SelectItem>
              <SelectItem value="Create subscriber in secondary list">Create subscriber in secondary list</SelectItem>
            </SelectContent>
          </Select>
          <div className="rounded-md bg-blue-500 p-3 text-sm text-white">
            What actions to take when a subscriber is found in the primary list but not in the secondary list
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Action on duplicate subscribers</label>
          <Select value={duplicateAction} onValueChange={setDuplicateAction}>
            <SelectTrigger className="w-full border-input bg-background">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Do nothing">Do nothing</SelectItem>
              <SelectItem value="Delete subscriber from secondary list">
                Delete subscriber from secondary list
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="rounded-md bg-blue-500 p-3 text-sm text-white">
            What actions to take when same subscriber is found in both lists
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Action when distinct subscriber status</label>
          <Select value={distinctAction} onValueChange={setDistinctAction}>
            <SelectTrigger className="w-full border-input bg-background">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Do nothing">Do nothing</SelectItem>
              <SelectItem value="Update subscriber in primary list">Update subscriber in primary list</SelectItem>
              <SelectItem value="Update subscriber in secondary list">Update subscriber in secondary list</SelectItem>
              <SelectItem value="Delete subscriber from secondary list">
                Delete subscriber from secondary list
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="rounded-md bg-blue-500 p-3 text-sm text-white">
            What actions to take when same subscriber from primary list has a distinct status in the secondary list
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Close
        </Button>
        <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleSync} disabled={loading}>
          {loading ? "Syncing..." : "Sync"}
        </Button>
      </div>
    </>
  )
}

function SplitModalContent({ lists, onClose, toast }: { lists: ListOption[], onClose: () => void, toast: any }) {
  const [list, setList] = useState("")
  const [numSublists, setNumSublists] = useState("2")
  const [loading, setLoading] = useState(false)

  const handleSplit = async () => {
    if (!list) {
      toast({ title: "Error", description: "Please select a list.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/tools/split-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          list_uid: list,
          split_count: numSublists
        }),
      })

      const data = await res.json()
      if (data.status === "success") {
        toast({ title: "Success", description: data.message })
        onClose()
      } else {
        toast({ title: "Error", description: data.message || "Failed to split list", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md bg-blue-500 p-3 text-sm text-white">
          This tool allows you to split a big list into multiple smaller ones. Please note that subscribers from the
          selected list will be copied into new lists.
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            List <span className="text-red-500">*</span>
          </label>
          <Select value={list} onValueChange={setList}>
            <SelectTrigger className="w-full border-input bg-background">
              <SelectValue placeholder="Select list" />
            </SelectTrigger>
            <SelectContent>
              {lists.map(l => (
                <SelectItem key={`split-${l.uid}`} value={l.uid}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Number of sublists <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={numSublists}
            onChange={(e) => setNumSublists(e.target.value)}
            min="2"
            max="100"
            className="w-full border-input bg-background"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Close
        </Button>
        <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleSplit} disabled={loading}>
          {loading ? "Splitting..." : "Split"}
        </Button>
      </div>
    </>
  )
}
