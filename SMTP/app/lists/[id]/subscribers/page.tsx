"use client";
import { useState, useEffect } from "react";
import type React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Users,
  PlusCircle,
  RefreshCw,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import SidebarNav from "@/components/sidebar-nav";
import Header from "@/components/common/header";

// ─── Type Definitions ────────────────────────────────────────────────────────

interface ListData {
  id: string;
  name: string;
  displayName: string;
  subscribersCount: number;
}

interface Subscriber {
  id: string;
  uniqueId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: "confirmed" | "unconfirmed" | "unsubscribed" | "bounced";
  dateAdded: string;
  ipAddress?: string;
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface Campaign {
  uid: string;
  name: string;
  subject: string;
  status: string;
}

// ─── Empty State Component ────────────────────────────────────────────────────
const EmptyState = ({ onCreateNew }: { onCreateNew: () => void }) => {
  return (
    <div className="rounded-md border border-border p-9 sm:p-16 dark:bg-gray-800">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-gray-200 p-4">
          <Users className="h-12 w-12 text-gray-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">
          Create Your First Subscriber
        </h2>
        <p className="max-w-md text-muted-foreground">
          You can create a new subscriber for your list.
        </p>
      </div>
    </div>
  );
};



// ─── Filters Panel Component ──────────────────────────────────────────────────
const FiltersPanel = ({
  isOpen,
  onClose,
  onApplyFilters,
  onResetFilters,
  listId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  onResetFilters: () => void;
  listId: string;
}) => {
  const [subscriberFilter, setSubscriberFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [timeValue, setTimeValue] = useState("2");
  const [timeUnit, setTimeUnit] = useState("days");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  useEffect(() => {
    if (isOpen && campaigns.length === 0) {
      fetchCampaigns();
    }
  }, [isOpen]);

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const token = session?.token || "";

      console.log("🔑 Token being sent:", token); // check token exists

      const res = await fetch(
        `/api/get-all-campaigns?page_number=1&per_page=100&token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      const data = await res.json();
      console.log("📋 Campaigns API response:", data); // see full response

      if (res.ok && data.success) {
        const records =
          data?.data?.data?.records ||
          data?.data?.records ||
          data?.records ||
          data?.data ||
          [];

        const mapped: Campaign[] = Array.isArray(records)
          ? records.map((c: any) => ({
              uid: c?.campaign_uid || c?.uid || c?.id || "",
              name:
                c?.name || c?.subject || c?.campaign_uid || "Unnamed Campaign",
              subject: c?.subject || "",
              status: c?.status || "",
            }))
          : [];

        setCampaigns(mapped);
      } else {
        console.warn("❌ Failed to load campaigns:", data);
      }
    } catch (error) {
      console.error("💥 Error fetching campaigns:", error);
    } finally {
      setLoadingCampaigns(false);
    }
  };
  const handleSetFilters = () => {
    onApplyFilters({
      subscriber: subscriberFilter,
      campaign: campaignFilter,
      timeValue,
      timeUnit,
    });
  };

  const handleResetFilters = () => {
    setSubscriberFilter("");
    setCampaignFilter("");
    setTimeValue("2");
    setTimeUnit("days");
    onResetFilters();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="text-sm font-medium text-gray-700">
            Campaigns filters
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSetFilters}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
          >
            Set filters
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm"
          >
            Reset filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-xs text-gray-600 font-medium">
            Show only subscribers that:
          </label>
          <Select value={subscriberFilter} onValueChange={setSubscriberFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opened">Did open</SelectItem>
              <SelectItem value="clicked">Did click</SelectItem>
              <SelectItem value="not-opened">Did not open</SelectItem>
              <SelectItem value="not-clicked">Did not click</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-gray-600 font-medium">
            This campaign:
          </label>
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="h-9">
              {loadingCampaigns ? (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Loading campaigns...
                </span>
              ) : (
                <SelectValue placeholder="Select campaign..." />
              )}
            </SelectTrigger>
            <SelectContent>
              {campaigns.length === 0 && !loadingCampaigns && (
                <SelectItem value="none" disabled>
                  No campaigns found
                </SelectItem>
              )}
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.uid} value={campaign.uid}>
                  {campaign.name}
                  {campaign.subject && campaign.subject !== campaign.name && (
                    <span className="text-gray-400 text-xs ml-1">
                      — {campaign.subject}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-gray-600 font-medium">
            In the last:
          </label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="h-9 w-20"
              min="1"
            />
            <Select value={timeUnit} onValueChange={setTimeUnit}>
              <SelectTrigger className="h-9 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="years">Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Subscriber Modal Component ─────────────────────────────────────────
const EditSubscriberModal = ({
  subscriber,
  onSave,
  onCancel,
}: {
  subscriber: Subscriber | null;
  onSave: (updatedSubscriber: Subscriber) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Subscriber | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (subscriber) setFormData({ ...subscriber });
  }, [subscriber]);

  if (!subscriber || !formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Subscriber
          </h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <Input
              value={formData.firstName || ""}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <Input
              value={formData.lastName || ""}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as Subscriber["status"],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirmation Modal Component ──────────────────────────────────────
const DeleteConfirmationModal = ({
  subscriber,
  onConfirm,
  onCancel,
}: {
  subscriber: Subscriber | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!subscriber) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-600">
            Delete Subscriber
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Are you sure you want to delete this subscriber?
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
            <p className="font-medium dark:text-white">{subscriber.email}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subscriber.firstName} {subscriber.lastName}
            </p>
          </div>
          <p className="text-sm text-red-600 mt-2">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Delete Subscriber
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Profile View Modal Component ──────────────────────────────────────────
const ProfileViewModal = ({
  subscriber,
  onClose,
}: {
  subscriber: Subscriber | null;
  onClose: () => void;
}) => {
  if (!subscriber) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-blue-500">👤</span> Subscriber Profile
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-sm border-b pb-3">
            <span className="font-medium text-gray-500">Email:</span>
            <span className="col-span-2 font-medium break-all">{subscriber.email}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm border-b pb-3">
            <span className="font-medium text-gray-500">Name:</span>
            <span className="col-span-2 text-gray-800 dark:text-gray-200">
              {subscriber.firstName || "N/A"} {subscriber.lastName || ""}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm border-b pb-3">
            <span className="font-medium text-gray-500 items-center flex">Status:</span>
            <span className="col-span-2">
              <Badge variant="outline" className="capitalize">
                {subscriber.status}
              </Badge>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm border-b pb-3">
            <span className="font-medium text-gray-500">Date Added:</span>
            <span className="col-span-2 text-gray-800 dark:text-gray-200">
              {new Date(subscriber.dateAdded).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <span className="font-medium text-gray-500 items-center flex">Unique ID:</span>
            <span className="col-span-2 font-mono bg-gray-50 dark:bg-gray-800 border px-2 py-1 rounded text-xs truncate">
              {subscriber.uniqueId}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4 rounded-b-lg flex justify-end">
          <Button onClick={onClose} className="bg-blue-500 hover:bg-blue-600 text-white px-6">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Subscribers Table Component ──────────────────────────────────────────────
const SubscribersTable = ({
  subscribers,
  selectedSubscribers,
  onSelectSubscriber,
  onSelectAll,
  onUpdateSubscriber,
  onDeleteSubscriber,
  onDeleteByEmail,
  columns,
  searchFilters,
  onSearchFilterChange,
  onSearchByEmail,
  onSearchByStatus,
}: {
  subscribers: Subscriber[];
  selectedSubscribers: string[];
  onSelectSubscriber: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateSubscriber: (updatedSubscriber: Subscriber) => void;
  onDeleteSubscriber: (subscriberId: string) => void;
  onDeleteByEmail: (email: string) => void;
  columns: Column[];
  searchFilters: Record<string, string>;
  onSearchFilterChange: (column: string, value: string) => void;
  onSearchByEmail: (email: string) => void;
  onSearchByStatus: (status: string) => void;
}) => {
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(
    null,
  );
  const [deletingSubscriber, setDeletingSubscriber] =
    useState<Subscriber | null>(null);
  const [viewingSubscriber, setViewingSubscriber] = useState<Subscriber | null>(null);

  const getStatusBadge = (status: Subscriber["status"]) => {
    const variants = {
      confirmed: "bg-green-100 text-green-800",
      unconfirmed: "bg-yellow-100 text-yellow-800",
      unsubscribed: "bg-red-100 text-red-800",
      bounced: "bg-gray-100 text-gray-800",
    };
    // ✅ Ensure status is a string and has a fallback
    const statusStr = String(status || "unconfirmed").toLowerCase();
    return (
      <Badge
        className={
          variants[statusStr as Subscriber["status"]] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {statusStr.charAt(0).toUpperCase() + statusStr.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleEditSubscriber = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber);
  };

  const handleSaveEdit = (updatedSubscriber: Subscriber) => {
    onUpdateSubscriber(updatedSubscriber);
    setEditingSubscriber(null);
  };

  const handleDeleteClick = (subscriber: Subscriber) => {
    setDeletingSubscriber(subscriber);
  };

  const handleConfirmDelete = () => {
    if (deletingSubscriber) {
      if (deletingSubscriber.email) {
        onDeleteByEmail(deletingSubscriber.email);
      } else {
        onDeleteSubscriber(deletingSubscriber.id);
      }
      setDeletingSubscriber(null);
    }
  };

  const handleViewProfile = (subscriber: Subscriber) => {
    setViewingSubscriber(subscriber);
  };

  const handleSendEmail = (subscriber: Subscriber) => {
    const subject = encodeURIComponent("Newsletter Update");
    const body = encodeURIComponent(
      `Dear ${subscriber.firstName || "Subscriber"},\n\nThank you for subscribing to our newsletter!\n\nBest regards,\nThe Team`,
    );
    window.location.href = `mailto:${subscriber.email}?subject=${subject}&body=${body}`;
  };

  const handleExportSubscriber = (subscriber: Subscriber) => {
    const headers = ["Email", "First Name", "Last Name", "Status", "Date Added", "Unique ID"];
    const row = [
      subscriber.email,
      subscriber.firstName || "",
      subscriber.lastName || "",
      subscriber.status,
      subscriber.dateAdded,
      subscriber.uniqueId
    ];
    const csvContent = headers.join(",") + "\n" + row.join(",");
    const dataUri =
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute(
      "download",
      `subscriber_${subscriber.uniqueId}.csv`,
    );
    linkElement.click();
  };

  const handleBlacklistSubscriber = (subscriberId: string) => {
    alert(`Blacklist subscriber functionality - Implementation needed`);
  };

  const handleBlacklistIP = (ipAddress: string | undefined) => {
    if (ipAddress)
      alert(`Blacklist IP ${ipAddress} functionality - Implementation needed`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        !target.closest('[id^="action-row-"]') &&
        !target.closest('button[title="Options"]')
      ) {
        document.querySelectorAll('[id^="action-row-"]').forEach((el) => {
          el.classList.add("hidden");
        });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleColumns = columns.filter((col) => col.visible);

  return (
    <>
      <div className="rounded-lg border border-gray-200">
        {/* ─── Search Bar Row ─────────────────────────────────────────── */}
        <div className="border-b border-gray-200 p-3">
          <div className="flex gap-3 items-center">
            <div className="w-12"></div>

            {/* Search by Unique ID */}
            {visibleColumns.some((c) => c.id === "uniqueId") && (
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Search unique id..."
                  value={searchFilters["uniqueId"] || ""}
                  onChange={(e) =>
                    onSearchFilterChange("uniqueId", e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>
            )}

            {/* Search by Email — only API, no local filter */}
            {visibleColumns.some((c) => c.id === "email") && (
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Search by email..."
                  value={searchFilters["email"] || ""}
                  onChange={(e) => {
                    // ✅ Only update the input display value, API handles the actual search
                    onSearchFilterChange("email", e.target.value);
                    onSearchByEmail(e.target.value);
                  }}
                  className="h-8 text-xs"
                />
              </div>
            )}

            {/* Search by Status — backend API call */}
            {visibleColumns.some((c) => c.id === "status") && (
              <div className="flex-1 min-w-0">
                <Select
                  value={searchFilters["status"] || "all"}
                  onValueChange={(value) => {
                    onSearchFilterChange(
                      "status",
                      value === "all" ? "" : value,
                    );
                    onSearchByStatus(value);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Search by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Search by First Name */}
            {visibleColumns.some((c) => c.id === "firstName") && (
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Search first name..."
                  value={searchFilters["firstName"] || ""}
                  onChange={(e) =>
                    onSearchFilterChange("firstName", e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>
            )}

            {/* Search by Last Name */}
            {visibleColumns.some((c) => c.id === "lastName") && (
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Search last name..."
                  value={searchFilters["lastName"] || ""}
                  onChange={(e) =>
                    onSearchFilterChange("lastName", e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>
            )}

            <div className="w-20"></div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedSubscribers.length === subscribers.length &&
                    subscribers.length > 0
                  }
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              {visibleColumns.map((column) => (
                <TableHead key={column.id} className="text-left">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-20 text-left">Options</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id} className="relative">
                <TableCell>
                  <Checkbox
                    checked={selectedSubscribers.includes(subscriber.id)}
                    onCheckedChange={() => onSelectSubscriber(subscriber.id)}
                  />
                </TableCell>
                {visibleColumns.map((column) => (
                  <TableCell key={column.id}>
                    {column.id === "uniqueId" && (
                      <span className="font-mono text-sm">
                        {subscriber.uniqueId}
                      </span>
                    )}
                    {column.id === "dateAdded" &&
                      formatDate(subscriber.dateAdded)}
                    {column.id === "status" &&
                      getStatusBadge(subscriber.status)}
                    {column.id === "email" && (
                      <span className="font-medium">{subscriber.email}</span>
                    )}
                    {column.id === "firstName" && (subscriber.firstName || "-")}
                    {column.id === "lastName" && (subscriber.lastName || "-")}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const actionRow = document.getElementById(
                          `action-row-${subscriber.id}`,
                        );
                        if (actionRow) actionRow.classList.toggle("hidden");
                      }}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                      title="Options"
                    >
                      <span className="text-sm">⚙️</span>
                    </button>

                    <div
                      id={`action-row-${subscriber.id}`}
                      className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 z-50 hidden"
                    >
                      <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-lg p-1 shadow-lg">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(subscriber);
                            document
                              .getElementById(`action-row-${subscriber.id}`)
                              ?.classList.add("hidden");
                          }}
                          className="w-7 h-7 bg-gray-500 hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
                          title="Profile Info"
                        >
                          <span className="text-white text-xs">👤</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendEmail(subscriber);
                            document
                              .getElementById(`action-row-${subscriber.id}`)
                              ?.classList.add("hidden");
                          }}
                          className="w-7 h-7 bg-green-500 hover:bg-green-600 rounded flex items-center justify-center transition-colors"
                          title="Send Mail"
                        >
                          <span className="text-white text-xs">📧</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSubscriber(subscriber);
                            document
                              .getElementById(`action-row-${subscriber.id}`)
                              ?.classList.add("hidden");
                          }}
                          className="w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <span className="text-white text-xs">✏️</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportSubscriber(subscriber);
                            document
                              .getElementById(`action-row-${subscriber.id}`)
                              ?.classList.add("hidden");
                          }}
                          className="w-7 h-7 bg-purple-500 hover:bg-purple-600 rounded flex items-center justify-center transition-colors"
                          title="Export Info"
                        >
                          <span className="text-white text-xs">📤</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(subscriber);
                            document
                              .getElementById(`action-row-${subscriber.id}`)
                              ?.classList.add("hidden");
                          }}
                          className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center transition-colors"
                          title="Delete"
                        >
                          <span className="text-white text-xs">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditSubscriberModal
        subscriber={editingSubscriber}
        onSave={handleSaveEdit}
        onCancel={() => setEditingSubscriber(null)}
      />
      <DeleteConfirmationModal
        subscriber={deletingSubscriber}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingSubscriber(null)}
      />
      <ProfileViewModal
        subscriber={viewingSubscriber}
        onClose={() => setViewingSubscriber(null)}
      />
    </>
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function ListSubscribersPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params?.id as string;

  const [listData, setListData] = useState<ListData | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>(
    {},
  );
  const [appliedFilters, setAppliedFilters] = useState<any>(null);

  const [columns, setColumns] = useState<Column[]>([
    { id: "uniqueId", label: "Unique ID", visible: true },
    { id: "dateAdded", label: "Date added", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "email", label: "Email", visible: true },
    { id: "firstName", label: "First name", visible: true },
    { id: "lastName", label: "Last name", visible: true },
  ]);

  useEffect(() => {
    if (listId) loadData();
  }, [listId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) setShowColumnsDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("refresh") === "true") {
      window.history.replaceState({}, "", `/lists/${listId}/subscribers`);
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const userToken = session?.token || "";
      setListData({
        id: listId,
        name: listId,
        displayName: listId,
        subscribersCount: 0,
      });
      await loadSubscribers(userToken);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscribers = async (userToken?: string) => {
    try {
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const token = userToken || session?.token || "";
      const url = `/api/get-all-subscribers?list_uid=${listId}&page_number=1&per_page=100`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || (data.status !== "success" && !data.success)) {
        console.warn("API failed:", data);
        setSubscribers([]);
        return;
      }

      const subRecords = data?.data?.data?.records || data?.data?.records || [];
      console.log("🔍 First record raw:", subRecords[0]);

      const mapped: Subscriber[] = subRecords.map((r: any) => ({
        id: String(r?.subscriber_uid || r?.id || Date.now()),
        uniqueId: r?.subscriber_uid || r?.uid || "",
        email: r?.EMAIL || r?.email || "",
        firstName: r?.FNAME || r?.first_name || r?.firstName || "",
        lastName: r?.LNAME || r?.last_name || r?.lastName || "",
        status: r?.status || "unconfirmed",
        dateAdded: r?.date_added || r?.created_at || new Date().toISOString(),
        ipAddress: r?.ip_address || r?.ipAddress || "",
      }));

      setSubscribers(mapped);
      setListData((prev) =>
        prev ? { ...prev, subscribersCount: mapped.length } : prev,
      );
    } catch (error) {
      console.error("Error loading subscribers:", error);
      setSubscribers([]);
    }
  };

  // ─── Search by Email ────────────────────────────────────────────────────────
  const handleSearchByEmail = async (emailValue: string) => {
    // Keep the email filter value for the input field while API search is running
    setSearchFilters((prev) => ({ ...prev, email: emailValue }));

    if (!emailValue.trim()) {
      await loadSubscribers();
      return;
    }

    try {
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const token = session?.token || "";

      const res = await fetch(
        `/api/search-by-email?list_uid=${listId}&email=${encodeURIComponent(emailValue)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await res.json();

      if (!res.ok || (data?.status !== "success" && !data?.success)) {
        console.warn("Email search failed:", data);
        setSubscribers([]);
        return;
      }

      const records =
        data?.data?.data?.records ||
        data?.data?.records ||
        (data?.data?.data ? [data.data.data] : []) ||
        (data?.data ? [data.data] : []);

      const mapped: Subscriber[] = records.map((r: any) => ({
        id: String(r?.subscriber_uid || r?.id || Date.now()),
        uniqueId: r?.subscriber_uid || r?.uid || "",
        email: r?.EMAIL || r?.email || "",
        firstName: r?.FNAME || r?.first_name || r?.firstName || "",
        lastName: r?.LNAME || r?.last_name || r?.lastName || "",
        status: r?.status || "unconfirmed",
        dateAdded: r?.date_added || r?.created_at || new Date().toISOString(),
        ipAddress: r?.ip_address || r?.ipAddress || "",
      }));

      setSubscribers(mapped);
    } catch (error) {
      console.error("Error searching by email:", error);
    }
  };

  // ─── Search by Status ───────────────────────────────────────────────────────
  const handleSearchByStatus = async (statusValue: string) => {
    // ✅ "all" or empty = reload everything, do NOT clear subscribers first
    if (!statusValue.trim() || statusValue === "all") {
      setSearchFilters((prev) => ({ ...prev, status: "" }));
      await loadSubscribers();
      return;
    }

    try {
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const token = session?.token || "";

      const res = await fetch(
        `/api/search-by-status?list_uid=${listId}&status=${encodeURIComponent(statusValue)}&page_number=1&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await res.json();

      if (!res.ok || (data?.status !== "success" && !data?.success)) {
        console.warn("Status search failed:", data);
        // ✅ Don't wipe list on failure — keep showing current data
        return;
      }

      const records =
        data?.data?.data?.records ||
        data?.data?.records ||
        (data?.data?.data ? [data.data.data] : []) ||
        (data?.data ? [data.data] : []);

      const mapped: Subscriber[] = records.map((r: any) => ({
        id: String(r?.subscriber_uid || r?.id || Date.now()),
        uniqueId: r?.subscriber_uid || r?.uid || "",
        email: r?.EMAIL || r?.email || "",
        firstName: r?.FNAME || r?.first_name || r?.firstName || "",
        lastName: r?.LNAME || r?.last_name || r?.lastName || "",
        status: r?.status || "unconfirmed",
        dateAdded: r?.date_added || r?.created_at || new Date().toISOString(),
        ipAddress: r?.ip_address || r?.ipAddress || "",
      }));

      setSubscribers(mapped);
    } catch (error) {
      console.error("Error searching by status:", error);
    }
  };

  const handleUpdateSubscriber = async (updatedSubscriber: Subscriber) => {
    try {
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const res = await fetch(
        `/api/update-a-subscriber?list_uid=${listId}&subscriber_uid=${updatedSubscriber.uniqueId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session?.token || ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: updatedSubscriber.firstName,
            last_name: updatedSubscriber.lastName,
            email: updatedSubscriber.email,
            status: updatedSubscriber.status
          }),
        },
      );

      if (res.ok) {
        setSubscribers((prev) =>
          prev.map((s) =>
            s.id === updatedSubscriber.id ? updatedSubscriber : s,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating subscriber:", error);
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    try {
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const subscriber = subscribers.find(
        (s: Subscriber) => s.id === subscriberId,
      );

      const res = await fetch(
        `/api/delete-one-subscriber?list_uid=${listId}&subscriber_uid=${subscriber?.uniqueId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.token || ""}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        console.error("Non-JSON response from API route");
        alert("Server error. Please try again.");
        return;
      }

      const data = await res.json();

      if (res.ok && data?.success !== false) {
        setSubscribers((prev: Subscriber[]) =>
          prev.filter((s: Subscriber) => s.id !== subscriberId),
        );
        setSelectedSubscribers((prev: string[]) =>
          prev.filter((id: string) => id !== subscriberId),
        );
      } else {
        console.error("Delete failed:", data);
        alert(data?.message || "Failed to delete subscriber.");
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      alert("An error occurred while deleting the subscriber.");
    }
  };
  const handleDeleteByEmail = async (email: string) => {
    try {
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");

      const res = await fetch(`/api/delete-by-email?list_uid=${listId}&email=${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.token || ""}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        console.error("Non-JSON response from API route");
        alert("Server error. Please try again.");
        return;
      }

      const data = await res.json();

      if (res.ok && data?.success !== false) {
        setSubscribers((prev: Subscriber[]) =>
          prev.filter((s: Subscriber) => s.email !== email),
        );
        setSelectedSubscribers((prev: string[]) =>
          prev.filter(
            (id: string) =>
              !subscribers.find((s) => s.email === email && s.id === id),
          ),
        );
      } else {
        console.error("Delete by email failed:", data);
        alert(data?.message || "Failed to delete subscriber.");
      }
    } catch (error) {
      console.error("Error deleting by email:", error);
      alert("An error occurred while deleting the subscriber.");
    }
  };
  const handleCreateNew = () => {
    router.push(`/lists/${listId}/subscribers/new`);
  };

  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  const handleSelectSubscriber = (subscriberId: string) => {
    setSelectedSubscribers((prev) =>
      prev.includes(subscriberId)
        ? prev.filter((id) => id !== subscriberId)
        : [...prev, subscriberId],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedSubscribers(checked ? subscribers.map((s) => s.id) : []);
  };

  const toggleColumn = (id: string) => {
    setColumns(
      columns.map((col) =>
        col.id === id ? { ...col, visible: !col.visible } : col,
      ),
    );
  };

  const saveColumnChanges = () => {
    setShowColumnsDropdown(false);
  };

  const handleSearchFilterChange = (column: string, value: string) => {
    setSearchFilters((prev) => ({ ...prev, [column]: value }));
  };

  const handleBulkAction = async (action: string) => {
    if (selectedSubscribers.length === 0) {
      alert("Please select subscribers first");
      return;
    }

    const selectedSubs = subscribers.filter((sub) =>
      selectedSubscribers.includes(sub.id),
    );

    if (action === "delete") {
      if (
        !confirm(
          `Are you sure you want to delete ${selectedSubscribers.length} subscribers?`,
        )
      )
        return;
    }

    if (action === "blacklist") {
      if (
        !confirm(
          `Are you sure you want to blacklist ${selectedSubscribers.length} subscribers?`,
        )
      )
        return;
    }

    try {
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const token = session?.token || "";

      // Map action to API endpoint
      const endpointMap: Record<string, string> = {
        subscribe: "/api/get-confirmed-subscribers",
        unsubscribe: "/api/get-unsubscribed-subscribers",
        unconfirm: "/api/get-unconfirmed-subscribers",
        blacklist: "/api/get-blacklisted-subscribers",
      };

      // Status map for optimistic UI update
      const statusMap: Record<string, Subscriber["status"]> = {
        subscribe: "confirmed",
        unsubscribe: "unsubscribed",
        unconfirm: "unconfirmed",
        blacklist: "unsubscribed",
      };

      if (action === "delete") {
        // Delete each selected subscriber one by one
        const deletePromises = selectedSubs.map((sub) =>
          fetch(`/api/delete-one-subscriber`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              list_uid: listId,
              subscriber_uid: sub.uniqueId,
            }),
          }),
        );

        await Promise.all(deletePromises);

        setSubscribers((prev) =>
          prev.filter((sub) => !selectedSubscribers.includes(sub.id)),
        );
        setSelectedSubscribers([]);
        alert(`${selectedSubs.length} subscribers deleted`);
        return;
      }

      // For subscribe / unsubscribe / unconfirm / blacklist
      // Call update API for each selected subscriber
      const updatePromises = selectedSubs.map((sub) =>
        fetch(`/api/update-a-subscriber`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            list_uid: listId,
            subscriber_uid: sub.uniqueId,
            status: statusMap[action],
            email: sub.email,
            first_name: sub.firstName || sub.lastName || "Subscriber",
            last_name: sub.lastName || sub.firstName || "User",
          }),
        }),
      );

      const results = await Promise.all(updatePromises);
      const allOk = results.every((r) => r.ok);

      if (allOk) {
        // Update UI status optimistically
        setSubscribers((prev) =>
          prev.map((sub) =>
            selectedSubscribers.includes(sub.id)
              ? { ...sub, status: statusMap[action] }
              : sub,
          ),
        );
        setSelectedSubscribers([]);
        alert(
          `${selectedSubs.length} subscribers updated to ${statusMap[action]}`,
        );
      } else {
        alert("Some updates failed. Please try again.");
      }
    } catch (err) {
      console.error("Bulk action error:", err);
      alert("An error occurred. Please try again.");
    }
  };



  const handleApplyFilters = async (filters: any) => {
    setAppliedFilters(filters);

    if (!filters.campaign || !filters.subscriber) {
      alert("Please select both a subscriber action and a campaign.");
      return;
    }

    try {
      const session = JSON.parse(localStorage.getItem("userSession") || "{}");
      const token = session?.token || "";

      const res = await fetch(
        `/api/campaigns/get-campaign-stats?campaign_uid=${filters.campaign}&token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await res.json();
      console.log("📊 Campaign stats:", data);

      if (!res.ok || data.status === "error") {
        alert("Failed to load campaign stats.");
        return;
      }

      const statsData = data?.data?.data || data?.data || {};

      let filteredEmails: string[] = [];

      if (filters.subscriber === "opened") {
        filteredEmails = (statsData?.opens?.subscribers || []).map(
          (s: any) => s?.EMAIL || s?.email || "",
        );
      } else if (filters.subscriber === "clicked") {
        filteredEmails = (statsData?.clicks?.subscribers || []).map(
          (s: any) => s?.EMAIL || s?.email || "",
        );
      } else if (filters.subscriber === "not-opened") {
        const openedEmails = new Set(
          (statsData?.opens?.subscribers || []).map(
            (s: any) => s?.EMAIL || s?.email || "",
          ),
        );
        filteredEmails = subscribers
          .filter((s) => !openedEmails.has(s.email))
          .map((s) => s.email);
      } else if (filters.subscriber === "not-clicked") {
        const clickedEmails = new Set(
          (statsData?.clicks?.subscribers || []).map(
            (s: any) => s?.EMAIL || s?.email || "",
          ),
        );
        filteredEmails = subscribers
          .filter((s) => !clickedEmails.has(s.email))
          .map((s) => s.email);
      }

      const emailSet = new Set(filteredEmails.filter(Boolean));
      const filtered = subscribers.filter((s) => emailSet.has(s.email));
      setSubscribers(filtered);
    } catch (err) {
      console.error("Error applying campaign filter:", err);
      alert("An error occurred while applying filters.");
    }
  };

  const handleResetFilters = () => {
    setAppliedFilters(null);
    setSearchFilters({});
    loadSubscribers();
  };

  const filteredSubscribers = subscribers.filter((subscriber) => {
    for (const [column, filterValue] of Object.entries(searchFilters)) {
      if (!filterValue) continue;
      // ✅ Skip email and status — handled by backend API
      if (column === "email" || column === "status") continue;
      let fieldValue = "";
      switch (column) {
        case "uniqueId":
          fieldValue = subscriber.uniqueId.toLowerCase();
          break;
        case "ipAddress":
          fieldValue = (subscriber.ipAddress || "").toLowerCase();
          break;
        case "firstName":
          fieldValue = (subscriber.firstName || "").toLowerCase();
          break;
        default:
          continue;
      }
      if (!fieldValue.includes(filterValue.toLowerCase())) return false;
    }
    if (appliedFilters?.subscriber) {
      if (
        appliedFilters.subscriber === "bounced" &&
        subscriber.status !== "bounced"
      )
        return false;
      if (
        appliedFilters.subscriber === "unsubscribed" &&
        subscriber.status !== "unsubscribed"
      )
        return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
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

  if (!listData) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-7xl">
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  List not found
                </h2>
                <p className="text-gray-600 mb-4">
                  The list you're looking for doesn't exist.
                </p>
                <Link
                  href="/lists"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Lists
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block">
        <SidebarNav />
      </div>
      <div className="wraper w-full">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
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

                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 dark:text-gray-200 text-gray-700" />
                    <h1 className="text-2xl font-semibold dark:text-gray-100 text-gray-900">
                      List subscribers
                    </h1>
                  </div>
                  <div className="flex gap-2 relative">
                    {subscribers.length > 0 && (
                      <>
                        <div className="dropdown-container relative">
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600"
                            onClick={() =>
                              setShowColumnsDropdown(!showColumnsDropdown)
                            }
                          >
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Toggle columns
                          </Button>
                          {showColumnsDropdown && (
                            <div className="absolute left-0 top-full mt-2 w-56 rounded-md shadow-lg border z-50 bg-white dark:bg-gray-900">
                              <div className="p-3">
                                {columns.map((column) => (
                                  <div
                                    key={column.id}
                                    className="flex items-center space-x-2 py-2"
                                  >
                                    <Checkbox
                                      id={column.id}
                                      checked={column.visible}
                                      onCheckedChange={() =>
                                        toggleColumn(column.id)
                                      }
                                    />
                                    <label
                                      htmlFor={column.id}
                                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                      </>
                    )}
                    <Button
                      onClick={handleCreateNew}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create new
                    </Button>
                    <Button
                      onClick={handleRefresh}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </Button>
                    {subscribers.length > 0 && (
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {showFiltersPanel ? "Hide Filters" : "Filters"}
                      </Button>
                    )}
                  </div>
                </div>

                <FiltersPanel
                  isOpen={showFiltersPanel}
                  onClose={() => setShowFiltersPanel(false)}
                  onApplyFilters={handleApplyFilters}
                  onResetFilters={handleResetFilters}
                  listId={listId}
                />

                {subscribers.length === 0 ? (
                  <EmptyState onCreateNew={handleCreateNew} />
                ) : (
                  <div className="space-y-6">
                    {selectedSubscribers.length > 0 && (
                      <div className="flex items-center justify-between">
                        <Select onValueChange={handleBulkAction}>
                          <SelectTrigger className="w-48 h-8">
                            <SelectValue placeholder="With selected:" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="subscribe">Subscribe</SelectItem>
                            <SelectItem value="unsubscribe">
                              Unsubscribe
                            </SelectItem>
                            <SelectItem value="unconfirm">Unconfirm</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                            <SelectItem value="blacklist">Blacklist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <SubscribersTable
                      subscribers={filteredSubscribers}
                      selectedSubscribers={selectedSubscribers}
                      onSelectSubscriber={handleSelectSubscriber}
                      onSelectAll={handleSelectAll}
                      onUpdateSubscriber={handleUpdateSubscriber}
                      onDeleteSubscriber={handleDeleteSubscriber}
                      onDeleteByEmail={handleDeleteByEmail}
                      columns={columns}
                      searchFilters={searchFilters}
                      onSearchFilterChange={handleSearchFilterChange}
                      onSearchByEmail={handleSearchByEmail}
                      onSearchByStatus={handleSearchByStatus}
                    />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {filteredSubscribers.length} of{" "}
                        {subscribers.length} subscribers
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">1</span>
                        <Button variant="outline" size="sm" disabled>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
