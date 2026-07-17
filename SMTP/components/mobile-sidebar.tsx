"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import SidebarNav from "./sidebar-nav"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="min-h-[44px] min-w-[44px] border border-gray-200 bg-white shadow-sm hover:bg-gray-50 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[min(20rem,calc(100vw-2rem))] overflow-y-auto border-r border-gray-200 bg-white p-0 sm:w-96"
        aria-label="Mobile navigation"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8 hover:bg-gray-100"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <SidebarNav isMobile={true} onClose={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar
