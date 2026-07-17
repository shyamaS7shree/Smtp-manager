"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { FileText, Users, X, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function ToolsContent() {
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [showSplitModal, setShowSplitModal] = useState(false)

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
          <SyncModalContent onClose={() => setShowSyncModal(false)} />
        </DraggableModal>
      )}

      {/* Split Modal */}
      {showSplitModal && (
        <DraggableModal title="Split list" onClose={() => setShowSplitModal(false)}>
          <SplitModalContent onClose={() => setShowSplitModal(false)} />
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

function SyncModalContent({ onClose }: { onClose: () => void }) {
  const [primaryList, setPrimaryList] = useState("Test")
  const [secondaryList, setSecondaryList] = useState("Test")
  const [missingAction, setMissingAction] = useState("Do nothing")
  const [duplicateAction, setDuplicateAction] = useState("Do nothing")
  const [distinctAction, setDistinctAction] = useState("Do nothing")

  const handleSync = () => {
    // Handle sync logic here
    onClose()
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
              <SelectItem value="Test">Test</SelectItem>
              <SelectItem value="Test1">Test1</SelectItem>
              <SelectItem value="Test2">Test2</SelectItem>
              <SelectItem value="Test3">Test3</SelectItem>
              <SelectItem value="Test4">Test4</SelectItem>
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
              <SelectItem value="Test">Test</SelectItem>
              <SelectItem value="Test1">Test1</SelectItem>
              <SelectItem value="Test2">Test2</SelectItem>
              <SelectItem value="Test3">Test3</SelectItem>
              <SelectItem value="Test4">Test4</SelectItem>
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
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleSync}>
          Sync
        </Button>
      </div>
    </>
  )
}

function SplitModalContent({ onClose }: { onClose: () => void }) {
  const [list, setList] = useState("Test")
  const [numSublists, setNumSublists] = useState("2")
  const [subscribersToMove, setSubscribersToMove] = useState("500")

  const handleSplit = () => {
    // Handle split logic here
    onClose()
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md bg-blue-500 p-3 text-sm text-white">
          This tool allows you to split a big list into multiple smaller ones. Please note that subscribers from the
          selected list will be moved into new lists, not copied
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
              <SelectItem value="Test">Test</SelectItem>
              <SelectItem value="Test1">Test1</SelectItem>
              <SelectItem value="Test2">Test2</SelectItem>
              <SelectItem value="Test3">Test3</SelectItem>
              <SelectItem value="Test4">Test4</SelectItem>
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
            className="w-full border-input bg-background"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            How many subscribers to move at once <span className="text-red-500">*</span>
          </label>
          <Select value={subscribersToMove} onValueChange={setSubscribersToMove}>
            <SelectTrigger className="w-full border-input bg-background">
              <SelectValue placeholder="Select number" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
              <SelectItem value="300">300</SelectItem>
              <SelectItem value="400">400</SelectItem>
              <SelectItem value="500">500</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleSplit}>
          Split
        </Button>
      </div>
    </>
  )
}
