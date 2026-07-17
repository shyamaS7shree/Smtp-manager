"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Target,
  PlusCircle,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/components/ui/use-toast";
import SidebarNav from "@/components/sidebar-nav";
import Header from "@/components/common/header";
import { apiUrl, token } from "@/components/common/http";

interface Subscriber {
  id: string;
  uniqueId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: "confirmed" | "unconfirmed" | "unsubscribed" | "bounced";
  dateAdded: string;
  lastActivity?: string;
  location?: string;
  source?: string;
  ipAddress?: string;
}

interface Segment {
  id: string;
  name: string;
  email: string;
  dateAdded: string;
  lastUpdated: string;
  subscriberCount: number;
  operator_match?: string;
  field_id?: string;
  operator_id?: string;
  value?: string;
  action?: string;
  campaign_id?: string;
  time_comparison_operator?: string;
  time_value?: string;
  time_unit?: string;
  conditions?: any[];
  campaign_conditions?: any[];
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

export default function ListSegmentsPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params?.id as string;
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const { toast } = useToast();
  
  // Dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState<string | null>(null);
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  const [segmentToCopy, setSegmentToCopy] = useState<Segment | null>(null);

  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Name", visible: true },
    { id: "dateAdded", label: "Date added", visible: true },
    { id: "lastUpdated", label: "Last updated", visible: true },
  ]);

  const formatDate = (value: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleString([], {
      year: "2-digit",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadSegmentsFromSubscribers = () => {
    try {
      const savedSubscribers = localStorage.getItem(`subscribers_${listId}`);
      const subscribersData: Subscriber[] = savedSubscribers
        ? JSON.parse(savedSubscribers)
        : [];
      const segmentsData: Segment[] = subscribersData.map((subscriber) => ({
        id: subscriber.id,
        name: `${subscriber.email} @ ${formatDate(subscriber.dateAdded)}`,
        email: subscriber.email,
        dateAdded: formatDate(subscriber.dateAdded),
        lastUpdated: formatDate(subscriber.dateAdded),
        subscriberCount: 1,
      }));
      setSegments(segmentsData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading segments:", error);
      setLoading(false);
    }
  };

  const fetchAllSegment = async () => {
    try {
      const res = await fetch(
        `/api/get-all-segments?list_uid=${encodeURIComponent(listId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.data?.records) {
        const apiSegments = data.data.records.map((record: any) => {
          const savedTime = localStorage.getItem(
            `segment_time_${listId}_${record.name}`
          );
          return {
            id: record.uid || record.segment_uid || String(record.id || ""),
            name: record.name,
            email: record.email || "",
            dateAdded: savedTime || formatDate(record.created_at || new Date().toISOString()),
            lastUpdated: savedTime || formatDate(record.updated_at || new Date().toISOString()),
            subscriberCount: record.subscriber_count || 0,
            operator_match: record.operator_match || "any",
            field_id: record.field_id || "",
            operator_id: record.operator_id || "",
            value: record.value || "",
            action: record.action || "",
            campaign_id: record.campaign_id || "",
            time_comparison_operator: record.time_comparison_operator || "",
            time_value: record.time_value || "",
            time_unit: record.time_unit || "",
            conditions: record.conditions || [],
            campaign_conditions: record.campaign_conditions || [],
          };
        });
        setSegments(apiSegments);
      } else {
        setSegments([]);
      }
    } catch (error) {
      console.error("Error fetching from API:", error);
      loadSegmentsFromSubscribers();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSegment();
  }, [listId]);

  useEffect(() => {
    const handleFocus = () => fetchAllSegment();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [listId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchAllSegment();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [listId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) {
        setShowColumnsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchAllSegment();
  };

  const handleCreateNew = () => {
    router.push(`/lists/${listId}/segment/new`);
  };

  const toggleColumn = (id: string) => {
    setColumns(
      columns.map((col) =>
        col.id === id ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const saveColumnChanges = () => {
    setShowColumnsDropdown(false);
  };

  const visibleColumns = columns.filter((col) => col.visible);

  const handleEdit = (segment: Segment) => {
    router.push(`/lists/${listId}/segment/new?segmentId=${segment.id}`);
  };

  const initiateDelete = (segmentId: string) => {
    setSegmentToDelete(segmentId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!segmentToDelete) return;
    setDeleteConfirmOpen(false);
    try {
      const res = await fetch(`/api/delete-segment`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          list_uid: listId,
          segment_uid: segmentToDelete,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        toast({ title: "Error", description: data?.message || "Failed to delete segment", variant: "destructive" });
        return;
      }

      await fetchAllSegment();
      toast({ title: "Success", description: "Segment deleted successfully!" });
    } catch (error) {
      console.error("Error deleting segment:", error);
      toast({ title: "Error", description: "Error deleting segment. Please try again.", variant: "destructive" });
    }
  };

  const initiateCopy = (segment: Segment) => {
    setSegmentToCopy(segment);
    setCopyConfirmOpen(true);
  };

  const confirmCopy = async () => {
    if (!segmentToCopy) return;
    setCopyConfirmOpen(false);
    try {
      const res = await fetch(
        `/api/copy-one-segment?segment_uid=${encodeURIComponent(segmentToCopy.id)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Error", description: data?.message || "Failed to copy segment", variant: "destructive" });
        return;
      }

      toast({ title: "Success", description: "Segment copied successfully!" });
      await fetchAllSegment();
    } catch (error) {
      console.error("Copy segment error:", error);
      toast({ title: "Error", description: "Error copying segment. Please try again.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="hidden lg:block"><SidebarNav /></div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-7xl">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block"><SidebarNav /></div>
      <div className="wraper w-full flex-1">
        <Header />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/lists/${listId}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Overview
                    </Link>
                  </div>
                </div>

                <div className="mb-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 dark:text-gray-300 text-gray-700" />
                    <h1 className="text-xl font-semibold dark:text-gray-100 text-gray-900">
                      List segments
                    </h1>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="dropdown-container relative">
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
                        onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                      >
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Toggle columns
                      </Button>
                      {showColumnsDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-black rounded-md shadow-lg border z-50">
                          <div className="p-3">
                            {columns.map((column) => (
                              <div key={column.id} className="flex items-center space-x-2 py-2">
                                <Checkbox
                                  id={column.id}
                                  checked={column.visible}
                                  onCheckedChange={() => toggleColumn(column.id)}
                                />
                                <label
                                  htmlFor={column.id}
                                  className="text-sm font-medium dark:text-gray-200 text-gray-700"
                                >
                                  {column.label}
                                </label>
                              </div>
                            ))}
                            <Button
                              className="mt-3 w-full bg-blue-500 text-white hover:bg-blue-600"
                              onClick={saveColumnChanges}
                            >
                              Save changes
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleCreateNew}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create new
                    </Button>
                    <Button
                      onClick={handleRefresh}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="mb-4 text-sm dark:text-gray-400 text-gray-600">
                  Displaying 1-{segments.length} of {segments.length} result
                  {segments.length !== 1 ? "s" : ""}.
                </div>

                <div className="rounded-lg border border-gray-200 shadow-sm">
                  <div className="block lg:hidden">
                    {segments.length === 0 ? (
                      <div className="p-8 text-center dark:bg-gray-800 dark:text-gray-400 text-gray-500">
                        No segments found.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {segments.map((segment, index) => (
                          <div key={`${segment.id}-${index}`} className="p-4 space-y-3">
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span>
                              <div className="mt-1">
                                <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                                  {segment.name}
                                </span>
                              </div>
                            </div>
                            {visibleColumns.find((col) => col.id === "dateAdded") && (
                              <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</span>
                                <div className="mt-1 text-sm text-gray-700">{segment.dateAdded}</div>
                              </div>
                            )}
                            {visibleColumns.find((col) => col.id === "lastUpdated") && (
                              <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</span>
                                <div className="mt-1 text-sm text-gray-700">{segment.lastUpdated}</div>
                              </div>
                            )}
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</span>
                              <div className="mt-2 flex items-center gap-2">
                                    <button
                                      onClick={() => handleEdit(segment)}
                                      className="p-1 hover:bg-gray-100 rounded text-blue-500 transition-colors"
                                      title="Edit"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => initiateCopy(segment)}
                                      className="p-1 hover:bg-gray-100 rounded text-blue-500 transition-colors"
                                      title="Copy"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => initiateDelete(segment.id)}
                                      className="p-1 hover:bg-gray-100 rounded text-red-500 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:bg-gray-900 bg-gray-50">
                          {visibleColumns.map((column) => (
                            <th key={column.id} className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300 text-gray-700">
                              {column.label}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-left text-sm font-medium dark:text-gray-300 text-gray-700">
                            Options
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {segments.length === 0 ? (
                          <tr>
                            <td colSpan={visibleColumns.length + 1} className="px-4 py-8 text-center dark:bg-gray-800 dark:text-gray-400 text-gray-500">
                              No segments found.
                            </td>
                          </tr>
                        ) : (
                          segments.map((segment, index) => (
                            <tr key={`${segment.id}-${index}`} className="border-b border-gray-200 hover:bg-gray-50">
                              {visibleColumns.map((column) => (
                                <td key={column.id} className="px-4 py-3 text-sm text-gray-700">
                                  {column.id === "name" && (
                                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                                      {segment.name}
                                    </span>
                                  )}
                                  {column.id === "dateAdded" && segment.dateAdded}
                                  {column.id === "lastUpdated" && segment.lastUpdated}
                                </td>
                              ))}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(segment)} className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Edit">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => initiateCopy(segment)} className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Copy">
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => initiateDelete(segment.id)} className="h-8 w-8 text-red-600 hover:bg-red-50" title="Delete">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 px-4 py-3 gap-4">
                    <div className="flex items-center gap-2">
                      <button className="rounded-md p-1 hover:bg-gray-100" disabled>
                        <ChevronLeft className="h-5 w-5 text-gray-400" />
                      </button>
                      <button className="rounded-md p-1 hover:bg-gray-100" disabled>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                    <select className="rounded-md border border-gray-300 px-2 py-1 text-sm w-full sm:w-auto">
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the segment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Copy Confirmation Dialog */}
      <AlertDialog open={copyConfirmOpen} onOpenChange={setCopyConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copy Segment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to duplicate this segment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCopy}>Copy Segment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}