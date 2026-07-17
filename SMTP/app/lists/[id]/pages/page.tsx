"use client"

import Header from "@/components/common/header"
import SidebarNav from "@/components/sidebar-nav"
import React, { useState } from "react"

export default function SubscribeForm() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ name, email })
    alert("Form submitted successfully!")
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Sidebar (fixed, full height, no scroll) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed top-0 left-0 h-screen overflow-hidden">
        <SidebarNav />
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />

        <main className="flex-1 w-full py-10 flex justify-center overflow-y-auto">
          <div className="w-full max-w-[90%] bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Subscribe Form
              </h1>
              <button className="bg-blue-600 text-white text-sm px-5 py-2 rounded-md hover:bg-blue-700 transition">
                Preview it now!
              </button>
            </div>

            {/* URL Section */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your subscribe form URL:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://demo-csi.way2smtp.com/index.php/lists/lx743qr8zj14c/subscribe"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900"
                />
                <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                  Quick links
                </button>
              </div>
            </div>

            {/* Editor Section */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="border-b bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Content
              </div>

              <div className="p-6 space-y-6">
                <div className="text-gray-800 dark:text-gray-100 font-bold text-lg">
                  [LIST_NAME]
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 text-sm p-4 rounded-md border border-blue-100 dark:border-blue-800">
                  <p>We’re happy you decided to subscribe to our email list.</p>
                  <p>Please take a few seconds to fill in the list details to subscribe.</p>
                  <p>You’ll receive an email to confirm your subscription.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-600 text-white text-sm px-5 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    [SUBMIT_BUTTON]
                  </button>
                </form>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Available tags:
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "[LIST_NAME]",
                  "[LIST_DISPLAY_NAME]",
                  "[LIST_INTERNAL_NAME]",
                  "[LIST_UID]",
                  "[LIST_FIELDS]",
                  "[SUBMIT_BUTTON]",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Save button */}
            <div className="mt-8 flex justify-end">
              <button className="bg-blue-600 text-white text-sm px-5 py-2 rounded-md hover:bg-blue-700 transition">
                Save changes
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
