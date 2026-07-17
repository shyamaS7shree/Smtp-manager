"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Type,
  Plus,
  RefreshCw,
  Settings,
  Pencil,
  Trash2,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { token } from "@/components/common/http";

type TemplateRecord = {
  template_uid: string;
  name: string;
  screenshot: string | null;
  created_at: string | null;  // ✅ added
  updated_at: string | null;  // ✅ added
};

type ApiPayload = {
  count: number;
  total_pages: number;
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  records: TemplateRecord[];
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ✅ Date formatter
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr.replace(" ", "T"));
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function EmailTemplatesComponent() {
  const router = useRouter();

  const [records, setRecords] = useState<TemplateRecord[]>([]);
  type MetaType = {
    count: number;
    total_pages: number;
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
  };

  const [meta, setMeta] = useState<MetaType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const goToEdit = (uid: string) => {
    router.push(`templates/edit/${uid}`);
  };

  const createNew = () => router.push("/email-templates/templates/add");

  const fetchTemplates = async (pageNumber = page, pageSize = perPage) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = new URL(
        "/api/get-all-templates",
        window.location.origin
      );
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
      setRecords(Array.isArray(payload?.records) ? payload.records : []);
      setMeta({
        count: Number(payload?.count ?? 0),
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

  const handelDelete = async ({ id }: { id: string }) => {
    if (!id) return;
    const ok = window.confirm("Are you sure you want to delete this template?");
    if (!ok) return;

    setLoading(true);
    setError(null);
    try {
      const apiUrl = new URL(
        "/api/template/delete-template",
        window.location.origin
      );
      apiUrl.searchParams.set("template_uid", id);

      const res = await fetch(apiUrl.toString(), {
        method: "DELETE",
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

      await fetchTemplates(page, perPage);
    } catch (e: any) {
      setError(e?.message || "Failed to delete template");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        !target?.closest("[id^='tpl-action-']") &&
        !target?.closest(".tpl-action-btn")
      ) {
        document
          .querySelectorAll("[id^='tpl-action-']")
          .forEach((el) => el.classList.add("hidden"));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTemplates(1, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => fetchTemplates(page, perPage);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return records;
    return records.filter(
      (r) =>
        r.name?.toLowerCase().includes(s) ||
        r.template_uid?.toLowerCase().includes(s)
    );
  }, [records, q]);

  const showingText = useMemo(() => {
    const total = meta?.count ?? filtered.length;
    const start = filtered.length ? (page - 1) * perPage + 1 : 0;
    const end = filtered.length ? start + filtered.length - 1 : 0;
    const safeEnd = Math.min(end, total);
    return `Displaying ${start}-${safeEnd} of ${total} results.`;
  }, [filtered.length, meta?.count, page, perPage]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-sm rounded-lg border border-gray-200">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Type className="text-blue-600" size={22} />
            <h1 className="text-xl font-semibold text-gray-900">Email templates</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 flex items-center gap-2">
              Toggle columns <ChevronDown size={16} />
            </Button>
            <Button
              onClick={createNew}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 flex items-center gap-2"
            >
              <Plus size={16} /> Create new
            </Button>
            <Button
              onClick={() => alert("Export handler")}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 flex items-center gap-2"
            >
              Export
            </Button>
            <Button
              onClick={onRefresh}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 flex items-center gap-2 disabled:opacity-60"
            >
              <RefreshCw size={16} /> Refresh
            </Button>
          </div>
        </div>

        {/* Status line */}
        <div className="px-6 py-4">
          {error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <div className="text-sm text-gray-600">
              {loading ? "Loading..." : showingText}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="px-6 pb-6">
          <div className="table-scroll rounded-lg border border-gray-200 bg-white">
            <div className="min-w-[840px]">

            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
              <div className="col-span-2">Screenshot</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Date added</div>
              <div className="col-span-2">Last updated</div>
              <div className="col-span-1 text-right">Options</div>
            </div>

            {/* Filter row */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 border-t border-gray-200 bg-white">
              <div className="col-span-2" />
              <div className="col-span-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name or UID"
                  className="w-full h-9 rounded border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <select
                  className="w-full h-9 rounded border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue=""
                  onChange={() => {}}
                >
                  <option value="">All</option>
                </select>
              </div>
              <div className="col-span-2" />
              <div className="col-span-2" />
              <div className="col-span-1" />
            </div>

            {/* Body */}
            <div className="border-t border-gray-200">
              {!loading && !error && filtered.length === 0 && (
                <div className="py-16 text-center text-gray-500">
                  No templates found.
                </div>
              )}

              {filtered.map((tpl) => (
                <div
                  key={tpl.template_uid}
                  onClick={() => goToEdit(tpl.template_uid)}
                  className="grid grid-cols-12 gap-3 px-4 py-6 border-b border-gray-100 items-center cursor-pointer hover:bg-blue-50 transition-colors duration-150"
                >
                  {/* Screenshot */}
                  <div className="col-span-2">
                    <div className="h-20 w-24 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {tpl.screenshot ? (
                        <img
                          src={tpl.screenshot}
                          alt={tpl.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <FileText size={26} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="col-span-3">
                    <div
                      className="text-sm text-gray-800 hover:text-blue-600 font-medium truncate max-w-full"
                      title={tpl.name}
                    >
                      {tpl.name}
                    </div>
                    <div className="text-[11px] text-gray-500 break-all mt-1">
                      {tpl.template_uid}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 text-sm text-gray-700">-</div>

                  {/* Date added ✅ */}
                  <div className="col-span-2 text-sm text-gray-700">
                    {formatDate(tpl.created_at)}
                  </div>

                  {/* Last updated ✅ */}
                  <div className="col-span-2 text-sm text-gray-700">
                    {formatDate(tpl.updated_at)}
                  </div>

                  {/* Options */}
                  <div className="col-span-1 flex justify-end">
                    <div className="relative">
                      <button
                        type="button"
                        className="tpl-action-btn h-9 w-9 rounded bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center"
                        title="Options"
                        onClick={(e) => {
                          e.stopPropagation();
                          document
                            .querySelectorAll("[id^='tpl-action-']")
                            .forEach((el) => {
                              if (el.id !== `tpl-action-${tpl.template_uid}`)
                                el.classList.add("hidden");
                            });
                          document
                            .getElementById(`tpl-action-${tpl.template_uid}`)
                            ?.classList.toggle("hidden");
                        }}
                      >
                        <Settings size={16} />
                      </button>

                      <div
                        id={`tpl-action-${tpl.template_uid}`}
                        className="absolute right-full top-1/2 -translate-y-1/2 mr-2 z-50 hidden"
                      >
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              document
                                .getElementById(`tpl-action-${tpl.template_uid}`)
                                ?.classList.add("hidden");
                              goToEdit(tpl.template_uid);
                            }}
                            className="h-9 w-9 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              document
                                .getElementById(`tpl-action-${tpl.template_uid}`)
                                ?.classList.add("hidden");
                              handelDelete({ id: tpl.template_uid });
                            }}
                            className="h-9 w-9 rounded bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-4 bg-white flex items-center justify-between gap-3 flex-wrap border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchTemplates(page - 1, perPage)}
                  disabled={loading || page <= 1 || !meta?.prev_page}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fetchTemplates(page + 1, perPage)}
                  disabled={loading || !meta?.next_page}
                >
                  Next
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Per page</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPerPage(v);
                    setPage(1);
                    fetchTemplates(1, v);
                  }}
                  className="h-9 rounded border border-gray-300 px-3 text-sm outline-none"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
