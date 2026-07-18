"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowLeft,
  RefreshCw,
  Filter,
  Users,
  X,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Subscriber {
  id: string;
  uniqueId: string;
  email: string;
  firstName: string;
  lastName: string;
  age: string;
  status: string;
  dateAdded: string;
  ipAddress: string;
  listId: string;
  listName?: string;
}

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

// Edit Modal Component
function EditSubscriberModal({
  subscriber,
  isOpen,
  onClose,
  onSave,
}: {
  subscriber: Subscriber | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSubscriber: Subscriber) => void;
}) {
  const [formData, setFormData] = useState<Subscriber | null>(null);

  useEffect(() => {
    if (subscriber) {
      setFormData({ ...subscriber });
    }
  }, [subscriber]);

  if (!isOpen || !subscriber || !formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof Subscriber, value: string) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Subscriber
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter last name"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Confirmed">Confirmed</option>
              <option value="Unconfirmed">Unconfirmed</option>
              <option value="Unsubscribed">Unsubscribed</option>
              <option value="Bounced">Bounced</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="text"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter age"
            />
          </div>

          {/* IP Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IP Address
            </label>
            <input
              type="text"
              value={formData.ipAddress}
              onChange={(e) => handleInputChange("ipAddress", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter IP address"
            />
          </div>

          {/* List Name (Read Only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List
            </label>
            <input
              type="text"
              value={formData.listName || "Unknown List"}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          {/* Date Added (Read Only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Added
            </label>
            <input
              type="text"
              value={formData.dateAdded}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscribersTable() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [columns, setColumns] = useState<Column[]>([
    { id: "list", label: "List", visible: true },
    { id: "uniqueId", label: "Unique ID", visible: true },
    { id: "email", label: "Email", visible: true },
    { id: "firstName", label: "First Name", visible: true },
    { id: "lastName", label: "Last Name", visible: true },
    { id: "source", label: "Source", visible: true },
    { id: "ipAddress", label: "Ip address", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "dateAdded", label: "Date added", visible: true },
    { id: "lastUpdated", label: "Last updated", visible: true },
    { id: "action", label: "Action", visible: true },
  ]);

  const [filters, setFilters] = useState({
    list_uid: "",
    status: "",
    source: "",
    unique: "",
    action: "",
    email: "",
    unique_id: "",
    ip_address: "",
    date_added_start: "",
    date_added_end: "",
    campaigns_action: "",
    campaigns: "",
    in_the_last_days: "",
  });

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const [availableLists, setAvailableLists] = useState<any[]>([]);

  useEffect(() => {
    const cachedLists = localStorage.getItem("cachedLists");
    if (cachedLists) {
      const data = JSON.parse(cachedLists);
      if (data.lists) setAvailableLists(data.lists);
    }
  }, []);
const loadAllSubscribers = async (showLoading = true) => {
  try {
    if (showLoading) setLoading(true)
    const session = JSON.parse(localStorage.getItem("userSession") || "{}")
    const token = session?.token || ""

    const queryParams = new URLSearchParams({
      page_number: "1",
      per_page: "100"
    })
    
    const currentFilters = filtersRef.current;
    if (currentFilters.list_uid) queryParams.append("list_uid", currentFilters.list_uid);
    if (currentFilters.status) queryParams.append("status", currentFilters.status);
    if (currentFilters.source) queryParams.append("source", currentFilters.source);
    if (currentFilters.email) queryParams.append("email", currentFilters.email);
    if (currentFilters.unique_id) queryParams.append("subscriber_uid", currentFilters.unique_id);
    if (currentFilters.ip_address) queryParams.append("ip_address", currentFilters.ip_address);
    if (currentFilters.date_added_start) queryParams.append("date_added_start", currentFilters.date_added_start);
    if (currentFilters.date_added_end) queryParams.append("date_added_end", currentFilters.date_added_end);
    if (currentFilters.in_the_last_days) queryParams.append("in_the_last_days", currentFilters.in_the_last_days);

    const res = await fetch(
      `/api/get-global-subscribers?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    )
    const data = await res.json()
    const records = data?.data?.records || []

    const formattedSubscribers = records.map((r: any) => ({
      id: String(r?.subscriber_uid || r?.uid || Date.now()),
      uniqueId: r?.subscriber_uid || r?.uid || "",
      email: r?.email || "",
      firstName: r?.first_name || "",
      lastName: r?.last_name || "",
      status: r?.status || "unconfirmed",
      dateAdded: r?.date_added ? new Date(r.date_added).toLocaleDateString() : new Date().toLocaleDateString(),
      ipAddress: r?.ip_address || "127.0.0.1",
      listId: r?.list_uid || "",
      listName: r?.list_name || "",
      source: r?.source || "web"
    }))

    setSubscribers(formattedSubscribers)
  } catch (error) {
    console.error("Error:", error)
  } finally {
    setLoading(false)
  }
}

  // ACTUAL ACTION FUNCTIONS
  const handleEditSubscriber = (subscriber: Subscriber) => {
    console.log("Editing subscriber:", subscriber);
    setEditingSubscriber(subscriber);
    setIsEditModalOpen(true);
  };

  const handleSaveSubscriber = (updatedSubscriber: Subscriber) => {
    try {
      // Get current subscribers for this list
      const savedSubscribers = localStorage.getItem(
        `subscribers_${updatedSubscriber.listId}`,
      );
      if (savedSubscribers) {
        const subscribersData = JSON.parse(savedSubscribers);
        if (Array.isArray(subscribersData)) {
          // Find and update the subscriber
          const updatedSubscribersData = subscribersData.map((sub) => {
            if (
              sub.id === updatedSubscriber.id ||
              sub.email === updatedSubscriber.email
            ) {
              return {
                ...sub,
                email: updatedSubscriber.email,
                firstName: updatedSubscriber.firstName,
                lastName: updatedSubscriber.lastName,
                status: updatedSubscriber.status,
                age: updatedSubscriber.age,
                ipAddress: updatedSubscriber.ipAddress,
              };
            }
            return sub;
          });

          // Save back to localStorage
          localStorage.setItem(
            `subscribers_${updatedSubscriber.listId}`,
            JSON.stringify(updatedSubscribersData),
          );

          // Close modal and reload data
          setIsEditModalOpen(false);
          setEditingSubscriber(null);
          loadAllSubscribers();

          alert("Subscriber updated successfully!");
          console.log("Updated subscriber:", updatedSubscriber);
        }
      }
    } catch (error) {
      console.error("Failed to update subscriber:", error);
      alert("Failed to update subscriber");
    }
  };

  const handleCopySubscriber = async (subscriber: Subscriber) => {
    try {
      const subscriberText = `Email: ${subscriber.email}\nName: ${subscriber.firstName} ${subscriber.lastName}\nList: ${subscriber.listName}\nStatus: ${subscriber.status}`;
      await navigator.clipboard.writeText(subscriberText);
      alert("Subscriber details copied to clipboard!");
      console.log("Copied subscriber:", subscriber);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy subscriber details");
    }
  };

  const handleExportSubscriber = (subscriber: Subscriber) => {
    try {
      const csvContent = `Email,First Name,Last Name,Status,Date Added,List Name,IP Address\n${subscriber.email},${subscriber.firstName},${subscriber.lastName},${subscriber.status},${subscriber.dateAdded},${subscriber.listName},${subscriber.ipAddress}`;

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `subscriber_${subscriber.email.replace("@", "_")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Exported subscriber:", subscriber);
      alert("Subscriber exported successfully!");
    } catch (error) {
      console.error("Failed to export:", error);
      alert("Failed to export subscriber");
    }
  };

  const handleDeleteSubscriber = (subscriber: Subscriber) => {
    if (
      !window.confirm(`Are you sure you want to delete ${subscriber.email}?`)
    ) {
      return;
    }

    try {
      // Get current subscribers for this list
      const savedSubscribers = localStorage.getItem(
        `subscribers_${subscriber.listId}`,
      );
      if (savedSubscribers) {
        const subscribersData = JSON.parse(savedSubscribers);
        if (Array.isArray(subscribersData)) {
          // Filter out the subscriber to delete
          const updatedSubscribers = subscribersData.filter(
            (sub) => sub.id !== subscriber.id && sub.email !== subscriber.email,
          );

          // Save back to localStorage
          localStorage.setItem(
            `subscribers_${subscriber.listId}`,
            JSON.stringify(updatedSubscribers),
          );

          // Reload the data
          loadAllSubscribers();

          alert("Subscriber deleted successfully!");
          console.log("Deleted subscriber:", subscriber);
        }
      }
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
      alert("Failed to delete subscriber");
    }
  };

  const closeActionDropdown = (subscriberId: string, listId: string) => {
    const actionRow = document.getElementById(
      `action-row-${listId}-${subscriberId}`,
    );
    if (actionRow) {
      actionRow.classList.add("hidden");
    }
  };

  // Load subscribers on component mount
  useEffect(() => {
    loadAllSubscribers(true);
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllSubscribers(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Add focus/visibility listeners for real-time updates
  useEffect(() => {
    const handleFocus = () => {
      loadAllSubscribers(false);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAllSubscribers(false);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const toggleColumn = (id: string) => {
    setColumns(
      columns.map((col) => {
        if (col.id === id) {
          return { ...col, visible: !col.visible };
        }
        return col;
      }),
    );
  };

  const saveColumnChanges = () => {
    setShowColumnsDropdown(false);
  };

  const visibleColumns = columns.filter((col) => col.visible);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h1 className="text-xl font-semibold flex items-center gap-3">
              Subscribers from all your lists ({subscribers.length} total)
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
            </h1>
          </div>
        </div>
        <div className="mb-4 flex justify-end gap-2">
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Toggle columns
          </Button>

          <Button className="bg-blue-500 text-white hover:bg-blue-600" asChild>
            <Link href="/lists">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to lists
            </Link>
          </Button>

          <Button
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => loadAllSubscribers(true)}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {showColumnsDropdown && (
          <div className="absolute right-8 mt-1 w-56 bg-white rounded-md shadow-lg border z-50">
            <div className="p-3">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="flex items-center space-x-2 py-2"
                >
                  <Checkbox
                    id={column.id}
                    checked={column.visible}
                    onCheckedChange={() => toggleColumn(column.id)}
                  />
                  <label
                    htmlFor={column.id}
                    className="text-sm font-medium text-gray-700"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
              <button
                className="mt-3 w-full bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md font-medium"
                onClick={saveColumnChanges}
              >
                Save changes
              </button>
            </div>
          </div>
        )}

        {showFilters && (
          <SubscriberFilters 
            filters={filters} 
            setFilters={setFilters} 
            onSubmit={loadAllSubscribers} 
            lists={availableLists}
          />
        )}

        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {visibleColumns.map((column) => (
                    <th
                      key={column.id}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscribers.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-16 text-center"
                      colSpan={visibleColumns.length}
                    >
                      {loading ? (
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                          <span className="text-gray-600">Loading subscribers...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-4 rounded-full bg-gray-200 p-4">
                            <Users className="h-12 w-12 text-gray-500" />
                          </div>
                          <h2 className="mb-2 text-xl font-semibold">
                            No subscribers found
                          </h2>
                          <p className="max-w-md text-muted-foreground mb-6">
                            Try adjusting your filters or go back to view your lists.
                          </p>
                          <Link href="/lists">
                            <button className="bg-blue-500 text-white hover:bg-blue-600 px-6 py-2 rounded-md font-medium transition-colors">
                              Back to lists
                            </button>
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  subscribers.map((subscriber) => (
                    <tr
                      key={`${subscriber.listId}-${subscriber.id}`}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      {visibleColumns.map((column) => (
                        <td
                          key={column.id}
                          className="px-4 py-3 text-sm text-gray-900"
                        >
                          {column.id === "list" ? (
                            <Link
                              href={`/lists/${subscriber.listId}/subscribers`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {subscriber.listName}
                            </Link>
                          ) : column.id === "uniqueId" ? (
                            <span className="text-blue-600">
                              {subscriber.uniqueId}
                            </span>
                          ) : column.id === "email" ? (
                            <span className="text-blue-600">
                              {subscriber.email}
                            </span>
                          ) : column.id === "firstName" ? (
                            <span>{subscriber.firstName}</span>
                          ) : column.id === "lastName" ? (
                            <span>{subscriber.lastName}</span>
                          ) : column.id === "source" ? (
                            <span>Manual</span>
                          ) : column.id === "ipAddress" ? (
                            <span>{subscriber.ipAddress || "127.0.0.1"}</span>
                          ) : column.id === "status" ? (
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                subscriber.status?.toLowerCase() === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : subscriber.status?.toLowerCase() ===
                                      "unconfirmed"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : subscriber.status?.toLowerCase() ===
                                        "archived"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {subscriber.status?.charAt(0).toUpperCase() + subscriber.status?.slice(1).toLowerCase()} 
                            </span>
                          ) : column.id === "dateAdded" ? (
                            <span>{subscriber.dateAdded}</span>
                          ) : column.id === "lastUpdated" ? (
                            <span>{subscriber.dateAdded}</span>
                          ) : column.id === "action" ? (
                            <div className="relative">
                              <button
                                className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-800 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Close all other action rows first
                                  document
                                    .querySelectorAll('[id^="action-row-"]')
                                    .forEach((row) => {
                                      if (
                                        row.id !==
                                        `action-row-${subscriber.listId}-${subscriber.id}`
                                      ) {
                                        row.classList.add("hidden");
                                      }
                                    });
                                  // Toggle current action row
                                  const actionRow = document.getElementById(
                                    `action-row-${subscriber.listId}-${subscriber.id}`,
                                  );
                                  if (actionRow) {
                                    actionRow.classList.toggle("hidden");
                                  }
                                }}
                              >
                                <span className="text-sm">⚙️</span>
                              </button>
                              <div
                                id={`action-row-${subscriber.listId}-${subscriber.id}`}
                                className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 z-50 hidden"
                              >
                                {/* Horizontal action buttons row */}
                                <div className="flex items-center space-x-1">
                                  {/* EDIT BUTTON */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSubscriber(subscriber);
                                      closeActionDropdown(
                                        subscriber.id,
                                        subscriber.listId,
                                      );
                                    }}
                                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                                    title="Edit"
                                  >
                                    <span className="text-white text-xs">
                                      ✏️
                                    </span>
                                  </button>
                                  {/* COPY BUTTON */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopySubscriber(subscriber);
                                      closeActionDropdown(
                                        subscriber.id,
                                        subscriber.listId,
                                      );
                                    }}
                                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                                    title="Copy"
                                  >
                                    <span className="text-white text-xs">
                                      📋
                                    </span>
                                  </button>
                                  {/* EXPORT BUTTON */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExportSubscriber(subscriber);
                                      closeActionDropdown(
                                        subscriber.id,
                                        subscriber.listId,
                                      );
                                    }}
                                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                                    title="Export"
                                  >
                                    <span className="text-white text-xs">
                                      📤
                                    </span>
                                  </button>
                                  {/* VIEW IN LIST BUTTON */}
                                  <Link
                                    href={`/lists/${subscriber.listId}/subscribers`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      closeActionDropdown(
                                        subscriber.id,
                                        subscriber.listId,
                                      );
                                    }}
                                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                                    title="View in List"
                                  >
                                    <span className="text-white text-xs">
                                      👁️
                                    </span>
                                  </Link>
                                  {/* DELETE BUTTON */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSubscriber(subscriber);
                                      closeActionDropdown(
                                        subscriber.id,
                                        subscriber.listId,
                                      );
                                    }}
                                    className="w-8 h-8 bg-red-400 hover:bg-red-500 rounded flex items-center justify-center transition-colors"
                                    title="Delete"
                                  >
                                    <span className="text-white text-xs">
                                      🗑️
                                    </span>
                                  </button>
                                  {/* SETTINGS BUTTON */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      alert(
                                        `Settings for ${subscriber.email} - implement your settings modal here`,
                                      );
                                      closeActionDropdown(
                                        subscriber.id,
                                        subscriber.listId,
                                      );
                                    }}
                                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                                    title="Settings"
                                  >
                                    <span className="text-white text-xs">
                                      ⚙️
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <button className="rounded-md p-1 hover:bg-gray-100">
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </button>
              <button className="rounded-md p-1 hover:bg-gray-100">
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <select className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Edit Modal */}
        <EditSubscriberModal
          subscriber={editingSubscriber}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSubscriber(null);
          }}
          onSave={handleSaveSubscriber}
        />
      </div>
    </div>
  );
}

function SubscriberFilters({ filters, setFilters, onSubmit, lists }: any) {
  const handleChange = (e: any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="mb-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center text-lg font-medium">
          <Filter className="mr-2 h-5 w-5 text-gray-700" /> Filters
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Lists</label>
          <select name="list_uid" value={filters.list_uid} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Select list</option>
            {lists?.map((list: any) => (
              <option key={list.id || list.uid} value={list.id || list.uid}>{list.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Statuses</label>
          <select name="status" value={filters.status} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Select statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="unconfirmed">Unconfirmed</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
            <option value="blacklisted">Blacklisted</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Sources</label>
          <select name="source" value={filters.source} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Select sources</option>
            <option value="web">Web form</option>
            <option value="api">API</option>
            <option value="import">Import</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Unique</label>
          <select name="unique" value={filters.unique} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Action</label>
          <select name="action" value={filters.action} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="view">View</option>
            <option value="export">Export</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={filters.email}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="name@domain.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Unique ID</label>
          <input
            type="text"
            name="unique_id"
            value={filters.unique_id}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="jm338w77e4eea"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ip Address</label>
          <input
            type="text"
            name="ip_address"
            value={filters.ip_address}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="123.123.123.100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date added start</label>
          <input
            type="date"
            name="date_added_start"
            value={filters.date_added_start}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date added end</label>
          <input
            type="date"
            name="date_added_end"
            value={filters.date_added_end}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Campaigns Action</label>
          <select name="campaigns_action" value={filters.campaigns_action} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Choose</option>
            <option value="sent">Sent</option>
            <option value="opened">Opened</option>
            <option value="clicked">Clicked</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Campaigns</label>
          <input
            type="text"
            name="campaigns"
            value={filters.campaigns}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Campaign name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">In the last</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="in_the_last_days"
              value={filters.in_the_last_days}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="30"
            />
            <span className="text-sm py-2 px-1 text-gray-500">Days</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button 
          onClick={() => {
            setFilters({
              list_uid: "", status: "", source: "", unique: "", action: "", email: "",
              unique_id: "", ip_address: "", date_added_start: "", date_added_end: "",
              campaigns_action: "", campaigns: "", in_the_last_days: "",
            });
            setTimeout(onSubmit, 10);
          }}
          className="text-sm px-4 py-2 text-gray-600 hover:text-gray-900 font-medium border border-transparent rounded hover:border-gray-200">
          Clear
        </button>
        <button onClick={onSubmit} className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md font-medium transition-colors shadow-sm">
          Submit
        </button>
      </div>
    </div>
  );
}
