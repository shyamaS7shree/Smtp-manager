"use client"

import { useState } from "react"
import { AlertTriangle, SlidersHorizontal, Check, RotateCcw, Download, Upload, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AbuseReportsContent() {
  const [activeTab, setActiveTab] = useState("All Abuse Reports")
  const [showToggleColumns, setShowToggleColumns] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    ID: true,
    Campaign: true,
    List: true,
    Subscriber: true,
    Reason: true,
    Log: true,
    "Date added": true,
    Status: true,
    "Report type": true,
    "IP address": true,
    "User agent": true,
    Actions: true,
  })

  const columns = [
    "ID",
    "Campaign",
    "List", 
    "Subscriber",
    "Reason",
    "Log",
    "Date added",
    "Status",
    "Report type",
    "IP address",
    "User agent",
    "Actions",
  ]

  const handleColumnToggle = (column: string, checked: boolean) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: checked,
    }))
  }

  const handleSaveChanges = () => {
    setShowToggleColumns(false)
    // Save logic here
  }

  function setShowColumnsDropdown(arg0: boolean): void {
    throw new Error("Function not implemented.")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Abuse Reports</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu open={showToggleColumns} onOpenChange={setShowToggleColumns}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => setShowColumnsDropdown(!setShowColumnsDropdown)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Toggle columns</span>
                <span className="sm:hidden">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
              <div className="p-2 space-y-2">
                {columns.map((column) => (
                  <div key={column} className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer ${
                        visibleColumns[column] ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`}
                      onClick={() => handleColumnToggle(column, !visibleColumns[column])}
                    >
                      {visibleColumns[column] && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <label
                      className="text-sm cursor-pointer flex-1"
                      onClick={() => handleColumnToggle(column, !visibleColumns[column])}
                    >
                      {column}
                    </label>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <Button onClick={handleSaveChanges} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Save changes
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create new</span>
            <span className="sm:hidden">Create</span>
          </Button>
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Upload className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Import from share code</span>
            <span className="lg:hidden">Import</span>
          </Button>
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
            <RotateCcw className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns
                  .filter((col) => visibleColumns[col])
                  .map((column) => (
                    <TableHead key={column} className="whitespace-nowrap">
                      {column}
                    </TableHead>
                  ))}
              </TableRow>
              <TableRow>
                {columns
                  .filter((col) => visibleColumns[col])
                  .map((column) => (
                    <TableHead key={`filter-${column}`} className="p-2">
                      {column === "Status" || column === "Reason" || column === "Report type" ? (
                        <Select>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input className="h-8" placeholder="" />
                      )}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={columns.filter((col) => visibleColumns[col]).length}
                  className="text-center py-8 text-gray-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Page 1 of 1</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
