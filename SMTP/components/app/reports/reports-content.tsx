'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart2, 
  Mail, 
  Users, 
  MousePointerClick, 
  AlertTriangle,
  Download,
  Calendar as CalendarIcon,
  FileText,
  FileText as FileTextIcon,
  Server,
  LayoutTemplate,
  List as ListIcon
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export default function ReportsContent() {
  const [timeRange, setTimeRange] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    sent: 0,
    opens: 0,
    clicks: 0,
    bounces: 0
  })
  const [allActivityLogs, setAllActivityLogs] = useState<any[]>([])

  useEffect(() => {
    fetchAllData()
  }, [timeRange])

  const fetchAllData = async () => {
    try {
      setIsLoading(true)
      const session = JSON.parse(localStorage.getItem('userSession') || '{}')
      const token = session.token

      let startDate = new Date()
      const endDate = new Date()
      if (timeRange === '7d') startDate.setDate(startDate.getDate() - 7)
      if (timeRange === '30d') startDate.setDate(startDate.getDate() - 30)
      if (timeRange === '90d') startDate.setDate(startDate.getDate() - 90)

      let statsUrl = `${BACKEND_URL}/api/dashboard/stats`
      if (timeRange !== 'all') {
        statsUrl += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      }

      // We do "Get All" calls for EVERYTHING the user has built
      const headers = { Authorization: `Bearer ${token}` }
      
      const [
        statsRes,
        campaignsRes,
        listsRes,
        templatesRes,
        deliveryServersRes,
        bounceServersRes
      ] = await Promise.all([
        fetch(statsUrl, { headers }),
        fetch(`${BACKEND_URL}/api/get-all-campaigns?per_page=100`, { headers }),
        fetch(`${BACKEND_URL}/api/get-all-lists?per_page=100`, { headers }),
        fetch(`${BACKEND_URL}/api/get-all-templates?per_page=100`, { headers }),
        fetch(`${BACKEND_URL}/api/delivery-servers`, { headers }),
        fetch(`${BACKEND_URL}/api/bounce-servers`, { headers })
      ])

      const statsData = await statsRes.json()
      const campaignsData = await campaignsRes.json()
      const listsData = await listsRes.json()
      const templatesData = await templatesRes.json()
      const deliveryServersData = await deliveryServersRes.json()
      const bounceServersData = await bounceServersRes.json()

      if (statsData.status === 'success') {
        setStats(statsData.data.deliveryStats)
      }

      // Combine ALL data into a single master activity log
      let combinedLogs: any[] = []

      if (campaignsData.status === 'success' && campaignsData.data.records) {
        campaignsData.data.records.forEach((c: any) => {
          combinedLogs.push({ 
            type: 'Campaign', 
            name: c.name, 
            date: c.date_added || c.created_at, 
            details: `Sent: ${c.stats?.processed_subscribers || 0}, Opens: ${c.stats?.opens_count || 0}`,
            action: 'Processed'
          })
        })
      }
      
      if (listsData.status === 'success' && listsData.data.records) {
        listsData.data.records.forEach((l: any) => {
          const isUpdated = new Date(l.last_updated).getTime() > new Date(l.date_added).getTime() + 1000;
          combinedLogs.push({ 
            type: 'List', 
            name: l.general?.name, 
            date: isUpdated ? l.last_updated : l.date_added, 
            details: `Subscribers: ${l.stats?.subscribers?.total || 0}`,
            action: isUpdated ? 'Updated' : 'Created'
          })
        })
      }

      if (templatesData.status === 'success' && templatesData.data.records) {
        templatesData.data.records.forEach((t: any) => {
          const isUpdated = new Date(t.last_updated).getTime() > new Date(t.date_added).getTime() + 1000;
          combinedLogs.push({ 
            type: 'Template', 
            name: t.name, 
            date: isUpdated ? t.last_updated : t.date_added, 
            details: `Category: ${t.category_name || 'General'}`,
            action: isUpdated ? 'Updated' : 'Created'
          })
        })
      }

      if (deliveryServersData.status === 'success' && deliveryServersData.data) {
        deliveryServersData.data.forEach((s: any) => {
          combinedLogs.push({ 
            type: 'Delivery Server', 
            name: s.name, 
            date: s.created_at, 
            details: `Type: ${s.type || 'SMTP'}`,
            action: 'Configured'
          })
        })
      }

      if (bounceServersData.status === 'success' && bounceServersData.data) {
        bounceServersData.data.forEach((s: any) => {
          combinedLogs.push({ 
            type: 'Bounce Server', 
            name: s.hostname || s.host, 
            date: s.created_at, 
            details: `Protocol: ${s.protocol || 'IMAP'}`,
            action: 'Configured'
          })
        })
      }

      // Sort by date (newest first)
      combinedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      // Filter by timeRange
      if (timeRange !== 'all') {
        combinedLogs = combinedLogs.filter(log => new Date(log.date) >= startDate && new Date(log.date) <= endDate)
      }

      setAllActivityLogs(combinedLogs)
    } catch (error: any) {
      console.error("DEBUG FETCH ERROR:", error)
      toast.error(`Error: ${error.message}`)
      setAllActivityLogs([{ type: 'Error', name: error.name, date: new Date().toISOString(), details: error.message, action: 'Error' }])
    } finally {
      setIsLoading(false)
    }
  }

  const downloadMasterCSV = () => {
    // Top header information required by user
    const dateStr = new Date().toLocaleString()
    const websiteName = "SMTP Manager Pro"
    
    let csvContent = `Website Name: ${websiteName}\n`
    csvContent += `Report Generated On: ${dateStr}\n`
    csvContent += `Generated By: System Administrator\n\n`
    
    // CSV Column Headers
    csvContent += "Date & Time,Activity Type,Item Name,Details/Stats\n"

    // CSV Rows
    allActivityLogs.forEach(log => {
      const date = new Date(log.date).toLocaleString().replace(/,/g, '') // remove commas for CSV
      const type = log.type
      const name = `"${log.name}"` // wrap in quotes in case of commas
      const details = `"${log.details}"`
      
      csvContent += `${date},${type},${name},${details}\n`
    })

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `Master_Report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("Report downloaded successfully!")
  }

  const downloadMasterPDF = () => {
    const doc = new jsPDF()
    const websiteName = "SMTP Manager Pro"
    const dateStr = new Date().toLocaleString()

    doc.setFontSize(16)
    doc.text(`Master Activity Log - ${websiteName}`, 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Report Generated On: ${dateStr}`, 14, 28)
    doc.text(`Generated By: System Administrator`, 14, 34)

    const tableColumn = ["Date & Time", "Activity Type", "Item Name", "Action", "Details/Stats"]
    const tableRows: any[] = []

    allActivityLogs.forEach(log => {
      const date = new Date(log.date).toLocaleString()
      tableRows.push([
        date,
        log.type,
        log.name,
        log.action,
        log.details
      ])
    })

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] }, // slate-900
    })

    doc.save(`Master_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success("PDF Report downloaded successfully!")
  }

  // Calculate percentages (capped at 100%)
  const calcRate = (part: number, total: number) => {
    if (total === 0) return 0;
    const rate = (part / total) * 100;
    return rate > 100 ? 100 : rate.toFixed(1);
  }

  const openRate = calcRate(stats.opens, stats.sent)
  const clickRate = calcRate(stats.clicks, stats.sent)
  const bounceRate = calcRate(stats.bounces, stats.sent)

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'Created': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Created</span>
      case 'Updated': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Updated</span>
      case 'Processed': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">Processed</span>
      case 'Configured': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">Configured</span>
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">{action}</span>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Campaign': return <Mail className="h-4 w-4 text-indigo-500" />
      case 'List': return <Users className="h-4 w-4 text-emerald-500" />
      case 'Template': return <LayoutTemplate className="h-4 w-4 text-orange-500" />
      case 'Delivery Server': return <Server className="h-4 w-4 text-blue-500" />
      case 'Bounce Server': return <Server className="h-4 w-4 text-rose-500" />
      default: return <FileText className="h-4 w-4 text-slate-500" />
    }
  }

  return (
    <div className="flex-1 space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-xl shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Master Report</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Complete audit log of everything performed on the website.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-1 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors cursor-pointer"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <Button onClick={downloadMasterPDF} variant="outline" className="h-10 gap-2 text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm">
            <FileTextIcon className="h-4 w-4" />
            PDF
          </Button>
          <Button onClick={downloadMasterCSV} className="h-10 gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md">
            <Download className="h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="text-slate-500 font-medium">Running all API calls to fetch complete records...</p>
        </div>
      ) : (
        <>
          {/* Core Facts Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Total Sent</h3>
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.sent.toLocaleString()}</p>
              <div className="mt-2 text-xs font-medium text-slate-500">
                Overall platform deliveries
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Total Opens</h3>
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.opens.toLocaleString()}</p>
              <div className="mt-2 text-xs font-medium text-slate-500">
                {openRate}% Open Rate
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Total Clicks</h3>
                <MousePointerClick className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.clicks.toLocaleString()}</p>
              <div className="mt-2 text-xs font-medium text-slate-500">
                {clickRate}% Click Rate
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-600">Total Bounces</h3>
                <AlertTriangle className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.bounces.toLocaleString()}</p>
              <div className="mt-2 text-xs font-medium text-slate-500">
                {bounceRate}% Bounce Rate
              </div>
            </div>
          </div>

          {/* Master Activity Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-slate-700" />
                  Master Activity Log
                </h3>
                <p className="text-sm text-slate-500 mt-1">Every action performed by the user across the website</p>
              </div>
              <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                Total Records: {allActivityLogs.length}
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-[600px] w-full block">
              <table className="w-full min-w-[700px] text-left text-sm text-slate-600 relative">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs">Date & Time</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs">Activity Type</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs">Item Name</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs text-center">Action</th>
                    <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {allActivityLogs.length > 0 ? (
                    allActivityLogs.map((log, idx) => {
                      const dateObj = new Date(log.date);
                      const isValidDate = !isNaN(dateObj.getTime());
                      return (
                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                          <td className="px-8 py-6 whitespace-nowrap text-slate-500 font-medium">
                            {isValidDate ? dateObj.toLocaleString(undefined, { 
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            }) : 'Just now'}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="flex items-center gap-3 font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm w-fit">
                              {getTypeIcon(log.type)}
                              {log.type}
                            </span>
                          </td>
                          <td className="px-8 py-6 font-bold text-slate-900 text-base">
                            {log.name}
                          </td>
                          <td className="px-8 py-6 text-center">
                            {getActionBadge(log.action)}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className="text-slate-600 bg-slate-50 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 shadow-sm inline-block group-hover:bg-white transition-colors">
                              {log.details}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No activity found on the website for this period.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
