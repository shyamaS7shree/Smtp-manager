"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Settings,
  Pencil,
  Trash2,
  FileText,
  LayoutGrid,
  List,
  Eye,
  Search,
  Sparkles,
  Calendar,
  Tag,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { token } from "@/components/common/http";

export type TemplateRecord = {
  template_uid: string;
  name: string;
  screenshot?: string | null;
  category?: string | { name?: string } | null;
  category_name?: string;
  is_active?: string | boolean;
  date_added?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_updated?: string | null;
  content?: string;
  plain_text?: string;
  meta?: { content?: string; plain_text?: string };
};

type ApiPayload = {
  count: number;
  total_pages: number;
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  records: TemplateRecord[];
};

// Helper: Extract clean category string
function getCategoryName(tpl: TemplateRecord): string {
  if (!tpl) return "general";
  if (typeof tpl.category === "object" && tpl.category !== null) {
    return tpl.category.name || "general";
  }
  if (typeof tpl.category === "string" && tpl.category.trim() !== "") {
    return tpl.category.trim();
  }
  if (tpl.category_name && tpl.category_name.trim() !== "") {
    return tpl.category_name.trim();
  }
  return "general";
}

// Helper: Get badge styling for categories
function getCategoryStyle(categoryRaw: string) {
  const c = categoryRaw.toLowerCase();
  if (c.includes("market") || c.includes("promo")) {
    return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
  }
  if (c.includes("news") || c.includes("update")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (c.includes("transac") || c.includes("order") || c.includes("system")) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
  }
  return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
}

// Helper: Format Date
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const cleanStr = String(dateStr).replace(" ", "T");
    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) return String(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

export default function EmailTemplatesComponent() {
  const router = useRouter();

  const [records, setRecords] = useState<TemplateRecord[]>([]);
  const [meta, setMeta] = useState<{
    count: number;
    total_pages: number;
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [perPage, setPerPage] = useState(12);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRecord | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  const goToEdit = (uid: string) => {
    router.push(`/email-templates/templates/edit/${uid}`);
  };

  const createNew = () => router.push("/email-templates/templates/add");

  const fetchTemplates = async (pageNumber = page, pageSize = perPage) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = new URL("/api/get-all-templates", window.location.origin);
      apiUrl.searchParams.set("page_number", String(pageNumber));
      apiUrl.searchParams.set("per_page", String(pageSize));

      const res = await fetch(apiUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
        cache: "no-store",
      });

      const text = await res.text();
      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }

      if (!res.ok) {
        throw new Error(json?.message || `Server error ${res.status}`);
      }

      const payload: ApiPayload = json?.data ?? json;
      const fetchedRecords = Array.isArray(payload?.records) ? payload.records : [];
      setRecords(fetchedRecords);
      setMeta({
        count: Number(payload?.count ?? fetchedRecords.length),
        total_pages: Number(payload?.total_pages ?? 1),
        current_page: Number(payload?.current_page ?? pageNumber),
        next_page: payload?.next_page ?? null,
        prev_page: payload?.prev_page ?? null,
      });
      setPage(Number(payload?.current_page ?? pageNumber));
    } catch (e: any) {
      setError(e?.message || "Failed to load templates");
      setRecords([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;
    const ok = window.confirm("Are you sure you want to delete this template?");
    if (!ok) return;

    setLoading(true);
    setError(null);
    try {
      const apiUrl = new URL("/api/template/delete-template", window.location.origin);
      apiUrl.searchParams.set("template_uid", id);

      const res = await fetch(apiUrl.toString(), {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message || `Server error ${res.status}`);
      }

      await fetchTemplates(page, perPage);
    } catch (e: any) {
      setError(e?.message || "Failed to delete template");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(1, perPage);
  }, []);

  const onRefresh = () => fetchTemplates(page, perPage);

  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    records.forEach((r) => {
      cats.add(getCategoryName(r));
    });
    return Array.from(cats);
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const cat = getCategoryName(r);
      if (selectedCategory !== "all" && cat.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      const s = q.trim().toLowerCase();
      if (!s) return true;
      return (
        r.name?.toLowerCase().includes(s) ||
        r.template_uid?.toLowerCase().includes(s) ||
        cat.toLowerCase().includes(s)
      );
    });
  }, [records, q, selectedCategory]);

  const handleCopyUid = (uid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Email Templates</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage, design, and organize your system email templates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 mr-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Table View"
              >
                <List size={16} />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="outline"
              className="h-9 px-3 text-slate-700 hover:bg-slate-50 border-slate-200 flex items-center gap-1.5"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-blue-600" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              onClick={createNew}
              className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Create Template</span>
            </Button>
          </div>
        </div>

        {/* Filter and Search Section */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search templates by name, category, or UID..."
                className="w-full h-10 pl-9 pr-4 text-sm bg-slate-50/50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Results count indicator */}
            <div className="text-xs text-slate-500 font-medium text-right">
              Showing <span className="text-slate-900 font-semibold">{filtered.length}</span> of{" "}
              <span className="text-slate-900 font-semibold">{meta?.count || records.length}</span> templates
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
              <Tag size={13} /> Categories:
            </span>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white shadow-sm font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              All ({records.length})
            </button>
            {categoriesList.map((cat) => {
              const count = records.filter((r) => getCategoryName(r).toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-blue-600 text-white shadow-sm font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="ghost" onClick={onRefresh} className="text-red-700 hover:bg-red-100">
              Try Again
            </Button>
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          /* Loading Skeletons */
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <Skeleton className="h-40 w-full rounded-lg bg-slate-100" />
                  <Skeleton className="h-4 w-3/4 bg-slate-100" />
                  <Skeleton className="h-3 w-1/2 bg-slate-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-slate-100 rounded-lg" />
              ))}
            </div>
          )
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText size={24} />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No templates found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {q || selectedCategory !== "all"
                ? "No email templates match your current filter or search criteria."
                : "Get started by creating your first email template."}
            </p>
            {(q || selectedCategory !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQ("");
                  setSelectedCategory("all");
                }}
                className="mt-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((tpl) => {
              const catName = getCategoryName(tpl);
              const catStyle = getCategoryStyle(catName);
              const createdDate = formatDate(tpl.created_at || tpl.date_added);
              const updatedDate = formatDate(tpl.updated_at || tpl.last_updated || tpl.created_at || tpl.date_added);
              const htmlContent = tpl.content || tpl.meta?.content || "";

              return (
                <div
                  key={tpl.template_uid}
                  className="group bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col overflow-hidden"
                >
                  {/* Thumbnail / HTML Preview Frame */}
                  <div className="relative h-44 bg-slate-100 border-b border-slate-100 overflow-hidden flex items-center justify-center group-hover:bg-slate-50">
                    {tpl.screenshot && tpl.screenshot !== "EMPTY" ? (
                      <img
                        src={tpl.screenshot}
                        alt={tpl.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : htmlContent ? (
                      <div className="w-full h-full p-2 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity overflow-hidden scale-75 origin-top">
                        <div
                          className="w-full h-full bg-white rounded shadow-xs p-3 text-[10px] overflow-hidden leading-snug"
                          dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-400">
                        <FileText size={32} strokeWidth={1.5} />
                        <span className="text-[11px] font-medium text-slate-400">No Preview</span>
                      </div>
                    )}

                    {/* Category Badge overlay */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border uppercase ${catStyle}`}>
                        {catName}
                      </span>
                    </div>

                    {/* Quick action overlay on hover */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(tpl);
                        }}
                        className="p-2 bg-white text-slate-800 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition-colors"
                        title="Live Preview"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToEdit(tpl.template_uid);
                        }}
                        className="p-2 bg-white text-slate-800 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition-colors"
                        title="Edit Template"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(tpl.template_uid, e)}
                        className="p-2 bg-white text-slate-800 rounded-lg shadow-sm hover:bg-red-600 hover:text-white transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3
                        onClick={() => goToEdit(tpl.template_uid)}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-1 transition-colors"
                        title={tpl.name}
                      >
                        {tpl.name}
                      </h3>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        <span>Added: {createdDate}</span>
                      </div>
                      <div>
                        <span>Updated: {updatedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-16">Preview</th>
                    <th className="py-3 px-4">Template Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date Added</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((tpl) => {
                    const catName = getCategoryName(tpl);
                    const catStyle = getCategoryStyle(catName);
                    const createdDate = formatDate(tpl.created_at || tpl.date_added);
                    const updatedDate = formatDate(tpl.updated_at || tpl.last_updated || tpl.created_at || tpl.date_added);

                    return (
                      <tr
                        key={tpl.template_uid}
                        onClick={() => goToEdit(tpl.template_uid)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        {/* Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                            {tpl.screenshot && tpl.screenshot !== "EMPTY" ? (
                              <img src={tpl.screenshot} alt={tpl.name} className="w-full h-full object-cover" />
                            ) : (
                              <FileText size={18} className="text-slate-400" />
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                            {tpl.name}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${catStyle}`}>
                            {catName}
                          </span>
                        </td>

                        {/* Date Added */}
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {createdDate}
                        </td>

                        {/* Last Updated */}
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {updatedDate}
                        </td>

                        {/* Options */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setPreviewTemplate(tpl)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Preview"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => goToEdit(tpl.template_uid)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(tpl.template_uid, e)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination controls */}
        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm text-xs text-slate-600">
            <div>
              Page <span className="font-semibold text-slate-900">{meta.current_page}</span> of{" "}
              <span className="font-semibold text-slate-900">{meta.total_pages}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={meta.current_page <= 1}
                onClick={() => fetchTemplates(meta.current_page - 1, perPage)}
                className="h-8 px-2.5"
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={meta.current_page >= meta.total_pages}
                onClick={() => fetchTemplates(meta.current_page + 1, perPage)}
                className="h-8 px-2.5"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Live Email Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{previewTemplate.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="capitalize font-semibold text-blue-600">
                      {getCategoryName(previewTemplate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Desktop/Mobile toggle */}
                <div className="flex items-center bg-slate-200/70 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      previewDevice === "desktop" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      previewDevice === "mobile" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600"
                    }`}
                  >
                    Mobile
                  </button>
                </div>

                <Button
                  onClick={() => goToEdit(previewTemplate.template_uid)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Pencil size={14} className="mr-1" /> Edit
                </Button>

                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body / HTML Frame */}
            <div className="p-6 bg-slate-100 overflow-y-auto flex-1 flex justify-center">
              <div
                className={`bg-white rounded-xl shadow-lg border border-slate-200 transition-all duration-300 ${
                  previewDevice === "mobile" ? "w-[375px] min-h-[600px]" : "w-full min-h-[500px]"
                }`}
              >
                {previewTemplate.content || previewTemplate.meta?.content ? (
                  <iframe
                    srcDoc={previewTemplate.content || previewTemplate.meta?.content}
                    title="Email Preview"
                    className="w-full h-full min-h-[500px] rounded-xl border-none"
                  />
                ) : (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <FileText size={40} className="mx-auto text-slate-300" />
                    <p className="text-sm font-medium">No HTML content available for this template.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
