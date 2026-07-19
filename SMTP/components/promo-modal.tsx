"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Image from "next/image"

export default function PromoModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Show the modal after a short delay when the user lands on the dashboard
    const timer = setTimeout(() => {
      const hasSeenPromo = sessionStorage.getItem("hasSeenPromo")
      if (!hasSeenPromo) {
        setIsOpen(true)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem("hasSeenPromo", "true")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-[90vw] max-w-5xl animate-in zoom-in-95 duration-500">
        
        {/* Close Button - positioned outside top right */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-110 hover:bg-gray-100"
        >
          <X className="h-5 w-5 font-bold" strokeWidth={3} />
        </button>

        {/* Banner Image */}
        <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-transparent">
          <Image
            src="/banner image.png"
            alt="Promotional Banner"
            width={1920}
            height={1080}
            className="w-full max-h-[85vh] object-contain rounded-2xl"
            priority
          />
        </div>
      </div>
    </div>
  )
}
