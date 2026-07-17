"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, RefreshCw, Download, SlidersHorizontal, FileText } from "lucide-react";
import { Table, TableHead, TableHeader, TableRow } from "./ui/table";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Column {
  id: string;
  label: string;
}

interface Row {
  name: string;
  templates: number;
  dateAdded: string;
  lastUpdated: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const columnsList: Column[] = [
  { id: "name", label: "Name" },
  { id: "templates", label: "Templates" },
  { id: "dateAdded", label: "Date added" },
  { id: "lastUpdated", label: "Last updated" },
];

// ─── Helper: current date/time string তৈরি করে ─────────────────────────────
const formatNow = (): string => {
  const now = new Date();
  return `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}, ${now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function EmailTempCatagoryComponent() {
  // ── Table rows state (শুরুতে empty, save করলে এখানে যোগ হবে) ──
  const [rows, setRows] = useState<Row[]>([]);

  // ── Column visibility ──
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columnsList.map((col) => col.id)
  );
  const [tempColumns, setTempColumns] = useState<string[]>(visibleColumns);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastValidColumns, setLastValidColumns] = useState<string[]>(visibleColumns);

  // ── UI view toggle ──
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ── Create form input value ──
  const [categoryName, setCategoryName] = useState("");

  // ── Dropdown outside-click ref ──
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // ─── Column toggle logic ──────────────────────────────────────────────────
  const toggleColumn = (id: string) => {
    setTempColumns((prev) =>
      prev.includes(id) ? prev.filter((col) => col !== id) : [...prev, id]
    );
  };

  const saveColumnChanges = () => {
    if (tempColumns.length === 0) {
      alert("At least one column must remain visible. Restoring previous selection.");
      setTempColumns(lastValidColumns);
      setVisibleColumns(lastValidColumns);
      return;
    }
    setVisibleColumns(tempColumns);
    setLastValidColumns(tempColumns);
    setDropdownOpen(false);
  };

  // ─── Action handlers ──────────────────────────────────────────────────────
  const handleCreate = () => setShowCreateForm(true);
  const handleExport = () => alert("Export clicked!");
  const handleRefresh = () => alert("Refresh clicked!");

  // ─── Save category (form submit) ──────────────────────────────────────────
  // এই function টা:
  //   1. নতুন Row তৈরি করে
  //   2. rows state-এ যোগ করে  →  table-এ দেখাবে
  //   3. showCreateForm = false  →  "View categories" UI আবার দেখাবে
  //   4. input clear করে
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (categoryName.trim() === "") return; // খালি থাকলে কিছু করবে না

    const now = formatNow();

    const newCategory: Row = {
      name: categoryName.trim(),
      templates: 0,
      dateAdded: now,
      lastUpdated: now,
    };

    setRows((prev) => [...prev, newCategory]); // ← table-এ নতুন row যোগ
    setShowCreateForm(false);                  // ← form বন্ধ, view page দেখাবে
    setCategoryName("");                       // ← input clear
  };

  // ─── Outside-click → dropdown বন্ধ করুন ──────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Create Form (showCreateForm === true হলে এটা দেখায়)
  // ═══════════════════════════════════════════════════════════════════════════
  if (showCreateForm) {
    return (
      <div className="bg-white dark:bg-gray-950 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mt-8 mb-12">
            <h1 className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-gray-800 dark:text-gray-200">Create new category</span>
            </h1>
          </div>

          {/* Form Container */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 p-8">
            {/* ← onSubmit = handleSaveCategory */}
            <form onSubmit={handleSaveCategory} className="space-y-8">
              <div>
                <label
                  htmlFor="categoryName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="categoryName"
                  type="text"
                  placeholder="Name"
                  value={categoryName}                          // ← controlled input
                  onChange={(e) => setCategoryName(e.target.value)} // ← state update
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="flex justify-between pt-4">
                {/* Cancel → form বন্ধ করে, view page-এ ফিরে যায় */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCategoryName(""); // cancel করলেও input clear
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 rounded-lg 
                    shadow-sm hover:bg-gray-50 dark:hover:bg-red-600 dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                >
                  Cancel
                </button>

                {/* Save → handleSaveCategory চলবে (form submit) */}
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — View Categories (showCreateForm === false)
  //          Save করার পর এই UI দেখায় এবং নতুন category table-এ থাকবে
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 mt-4">
          <h1 className="text-lg font-semibold flex items-center space-x-2">
            <span className="bg-blue-600 w-1.5 h-6 rounded"></span>
            <span className="text-gray-800 dark:text-gray-200">View categories</span>
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative w-full sm:w-auto mt-3 sm:mt-0">
            {/* Toggle Columns — শুধু rows থাকলে দেখাবে */}
            {rows.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Toggle columns
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-50 dark:bg-gray-950 border rounded-xl shadow-lg z-20 p-3 max-w-full sm:max-w-xs">
                    <div className="flex flex-col space-y-2">
                      {columnsList.map((col) => (
                        <label
                          key={col.id}
                          className="flex items-center space-x-2 text-sm dark:text-gray-200 text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={tempColumns.includes(col.id)}
                            onChange={() => toggleColumn(col.id)}
                            className="rounded text-blue-500 focus:ring-0"
                          />
                          <span>{col.label}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={saveColumnChanges}
                      className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium"
                    >
                      Save changes
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Create / Export / Refresh buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleCreate}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 justify-center"
              >
                <Plus size={18} /> Create new
              </button>
              {rows.length > 0 && (
                <button
                  onClick={handleExport}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 justify-center"
                >
                  <Download size={18} /> Export
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 justify-center"
              >
                <RefreshCw size={18} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ── Empty State OR Table ─────────────────────────────────────────── */}
        {rows.length === 0 ? (
          /* Empty State — কোনো category নেই তখন */
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 py-20 px-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Create your first template category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              You can categorize the email templates so that it will be easier to group and find them.
            </p>
          </div>
        ) : (
          /* Table — rows থাকলে এই table দেখায় */
          <>
            <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-950">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-100 dark:bg-gray-900 border-b">
                  <TableRow>
                    {visibleColumns.includes("name") && (
                      <TableHead className="py-3 px-6">Name</TableHead>
                    )}
                    {visibleColumns.includes("templates") && (
                      <TableHead className="py-3 px-6 hidden sm:table-cell">Templates</TableHead>
                    )}
                    {visibleColumns.includes("dateAdded") && (
                      <TableHead className="py-3 px-6 hidden sm:table-cell">Date added</TableHead>
                    )}
                    {visibleColumns.includes("lastUpdated") && (
                      <TableHead className="py-3 px-6 hidden sm:table-cell">Last updated</TableHead>
                    )}
                    <TableHead className="py-3 px-6">Options</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
                    >
                      {visibleColumns.includes("name") && (
                        <td className="py-3 px-6 text-gray-800 dark:text-gray-400">{row.name}</td>
                      )}
                      {visibleColumns.includes("templates") && (
                        <td className="py-3 px-6 text-gray-800 dark:text-gray-400 hidden sm:table-cell">
                          {row.templates}
                        </td>
                      )}
                      {visibleColumns.includes("dateAdded") && (
                        <td className="py-3 px-6 text-gray-800 dark:text-gray-400 hidden sm:table-cell">
                          {row.dateAdded}
                        </td>
                      )}
                      {visibleColumns.includes("lastUpdated") && (
                        <td className="py-3 px-6 text-gray-800 dark:text-gray-400 hidden sm:table-cell">
                          {row.lastUpdated}
                        </td>
                      )}
                      <td className="py-3 px-6">
                        <button className="bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 px-3 py-1 rounded-lg">
                          ⚙️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Footer — result count */}
            <div className="flex justify-end items-center mt-4 text-sm text-gray-500">
              Displaying 1-{rows.length} of {rows.length} result{rows.length !== 1 ? "s" : ""}.
            </div>
          </>
        )}
      </div>
    </div>
  );
}