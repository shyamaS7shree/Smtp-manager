"use client"

import { useState } from "react"
import { ClipboardList, Plus, RefreshCw, Download, ChevronLeft, ChevronRight, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface SurveyRespondersContentProps {
  surveyId: string
}

export default function SurveyRespondersContent({ surveyId }: SurveyRespondersContentProps) {
  const router = useRouter()
  const [showExportModal, setShowExportModal] = useState(false)
  const [showExportProgress, setShowExportProgress] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleExport = () => {
    setShowExportModal(true)
  }

  const handleCSVExport = () => {
    setShowExportModal(false)
    setShowExportProgress(true)

    // Simulate export process
    setTimeout(() => {
      setShowExportProgress(false)
      showSuccessMessage("Export completed successfully!")
    }, 3000)
  }

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  if (showExportProgress) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-md bg-blue-500 text-white p-4">
          <p className="font-medium">📊 CSV export progress</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>The export process will start shortly.</p>
            <p>
              While the export is running it is recommended you leave this page as it is and wait for the export to
              finish.
            </p>
            <p>
              The exporter runs in batches of 500 responders per file with a pause of 1 seconds between the batches,
              therefore the export process might take a while depending on your survey size and number of responders to
              export.
            </p>
            <p>This is a tedious process, so sit tight and wait for it to finish.</p>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📊 CSV export progress</h2>
            <Button
              variant="default"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setShowExportProgress(false)}
            >
              🔙 Back to export options
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            From a total of 0 responders, so far 0 have been processed, 0 successfully and 0 with errors. 0% completed.
          </p>

          <div className="space-y-2">
            <div className="rounded-md bg-blue-500 text-white px-4 py-2">Your survey has no responders to export!</div>
            <div className="rounded-md bg-red-500 text-white px-4 py-2">Your survey has no responders to export!</div>
          </div>
        </div>
      </div>
    )
  }

  if (showExportModal) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center text-xl font-semibold">📊 Export responders</h1>
          <div className="flex gap-2">
            <Button
              variant="default"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setShowExportModal(false)}
            >
              🔄 Cancel
            </Button>
            <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleRefresh}>
              🔄 Refresh
            </Button>
            <Button
              variant="default"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setShowExportModal(false)}
            >
              🔙 Back
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-lg bg-blue-100 p-4">
              <div className="text-4xl text-blue-500">📊</div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-blue-500">CSV</h2>
            <p className="text-muted-foreground mb-4">File</p>
            <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleCSVExport}>
              Export as CSV
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {successMessage && (
        <div className="rounded-md bg-green-100 border border-green-400 text-green-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <h1 className="flex items-center text-xl font-semibold">
          <ClipboardList className="mr-2 h-5 w-5" /> Survey responders
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create new</span>
          <span className="sm:hidden">New</span>
        </Button>

        <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">Found 0 responders.</div>

      <div className="rounded-md border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Options</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Unique ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Date added</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Ip address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Subscriber</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-sm" colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground mb-2">Sorry, but there are no responders to show right now.</p>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="Choose">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Choose">Choose</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </td>
              </tr>
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
    </div>
  )
}
