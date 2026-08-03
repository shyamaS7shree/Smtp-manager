'use client'

import React, { useState, useEffect } from 'react'
import { PlusCircle, Search, Server, Settings, CheckCircle2, XCircle, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export default function DeliveryServersContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [servers, setServers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '', type: 'SMTP', hostname: '', username: '', password: '', port: 587, hourly_quota: 10000, status: 'active'
  })

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}')
      const token = session.token
      const res = await fetch(`${BACKEND_URL}/api/delivery-servers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'success') {
        setServers(data.data)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load servers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}')
      const token = session.token
      const res = await fetch(`${BACKEND_URL}/api/delivery-servers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.status === 'success') {
        toast.success("Delivery server added!")
        setIsDialogOpen(false)
        fetchServers()
      } else {
        toast.error(data.message || "Failed to add server")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error creating server")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this server?")) return
    try {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}')
      const token = session.token
      const res = await fetch(`${BACKEND_URL}/api/delivery-servers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'success') {
        toast.success("Server deleted")
        fetchServers()
      }
    } catch (error) {
      toast.error("Error deleting server")
    }
  }

  const filteredServers = servers.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.hostname?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Server className="h-6 w-6 text-orange-500" />
            Delivery Servers
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage your SMTP and API sending servers for delivering campaigns.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create new server
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Delivery Server</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateServer} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Main Mailgun Server" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="SMTP" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hostname</Label>
                  <Input required value={formData.hostname} onChange={e => setFormData({...formData, hostname: e.target.value})} placeholder="smtp.mailgun.org" />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input type="number" required value={formData.port} onChange={e => setFormData({...formData, port: Number(e.target.value)})} placeholder="587" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hourly Quota</Label>
                  <Input type="number" value={formData.hourly_quota} onChange={e => setFormData({...formData, hourly_quota: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 mt-4">Save Server</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search delivery servers..." 
              className="pl-9 bg-white border-slate-200 focus-visible:ring-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Server Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Hostname / Port</th>
                <th className="px-6 py-4 font-semibold">Username</th>
                <th className="px-6 py-4 font-semibold">Hourly Quota</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading servers...</td></tr>
              ) : filteredServers.length > 0 ? (
                filteredServers.map((server) => (
                  <tr key={server.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{server.name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {server.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {server.hostname}:{server.port}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{server.username}</td>
                    <td className="px-6 py-4 text-slate-600">{server.hourly_quota?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-center">
                      {server.status === 'active' ? (
                        <div className="flex items-center justify-center text-green-600 gap-1.5 bg-green-50 px-2.5 py-1 rounded-full w-fit mx-auto">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs font-medium capitalize">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-slate-500 gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full w-fit mx-auto">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs font-medium capitalize">Inactive</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer text-slate-700">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(server.id)} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                    <Server className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-medium">No delivery servers found</p>
                    <p className="text-xs mt-1 text-slate-400">Add a delivery server to start sending emails.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
