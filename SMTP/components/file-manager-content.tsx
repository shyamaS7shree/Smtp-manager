"use client";

import { useEffect, useState, useRef } from "react";
import {
  Folder,
  Upload,
  Search,
  Grid,
  List as ListIcon,
  Copy,
  Trash2,
  Edit2,
  Eye,
  FileImage,
  File as FileIcon,
  Check,
  X,
  RotateCcw,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrl, token } from "@/components/common/http";

interface FileItem {
  id: number | string;
  uid: string;
  name: string;
  original_name?: string;
  url: string;
  file_size: number;
  mime_type?: string;
  extension?: string;
  dateAdded?: string;
}

export default function FileManagerContent() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<FileItem | null>(null);
  const [renamingFile, setRenamingFile] = useState<FileItem | null>(null);
  const [newFileName, setNewFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchFiles = async () => {
    // ⚡ Instant 0ms Load from Local Cache
    try {
      const cached = localStorage.getItem("cachedFileManagerFiles");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFiles(parsed);
          setLoading(false);
        }
      }
    } catch {}

    try {
      const res = await fetch("/api/files", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const json = await res.json();
        const records = Array.isArray(json?.data) ? json.data : [];
        setFiles(records);
        localStorage.setItem("cachedFileManagerFiles", JSON.stringify(records));
      }
    } catch (e) {
      console.error("Failed to fetch files:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("file", selectedFiles[i]);
    }

    try {
      const res = await fetch("/api/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
        },
        body: formData,
      });

      if (res.ok) {
        await fetchFiles();
      } else {
        const errJson = await res.json();
        alert(errJson?.message || "File upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("File upload error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (file: FileItem) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      const res = await fetch(`/api/files/delete-a-file?file_uid=${file.uid || file.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== file.id && f.uid !== file.uid));
        if (selectedFileForPreview?.uid === file.uid) setSelectedFileForPreview(null);
      } else {
        alert("Failed to delete file");
      }
    } catch (e) {
      console.error("Delete error:", e);
      alert("Error deleting file");
    }
  };

  const handleRenameFile = async () => {
    if (!renamingFile || !newFileName.trim()) return;

    try {
      const res = await fetch(`/api/files/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          uid: renamingFile.uid || renamingFile.id,
          name: newFileName.trim(),
        }),
      });

      if (res.ok) {
        setFiles((prev) =>
          prev.map((f) => (f.id === renamingFile.id || f.uid === renamingFile.uid ? { ...f, name: newFileName.trim() } : f))
        );
        setRenamingFile(null);
        setNewFileName("");
      } else {
        alert("Failed to rename file");
      }
    } catch (e) {
      console.error("Rename error:", e);
    }
  };

  const copyToClipboard = (url: string, id: string | number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const isImageFile = (file: FileItem) => {
    const mime = file.mime_type || "";
    const ext = file.extension || file.name.split(".").pop() || "";
    return (
      mime.startsWith("image/") ||
      ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp"].includes(ext.toLowerCase())
    );
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Folder className="h-6 w-6 text-sky-600 dark:text-sky-400" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">File manager</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => { setLoading(true); fetchFiles(); }}
            variant="outline"
            disabled={loading}
            className="flex items-center gap-1.5 text-xs h-9"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-sky-500 hover:bg-sky-600 text-white font-medium flex items-center gap-2 h-9 px-4 text-xs rounded-md shadow-xs transition-all"
          >
            <Upload className={`h-4 w-4 ${uploading ? "animate-bounce" : ""}`} />
            {uploading ? "Uploading..." : "Upload files"}
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Total: {filteredFiles.length} file(s)
          </span>

          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden p-0.5 bg-slate-50 dark:bg-zinc-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-zinc-700 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-zinc-700 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-zinc-900 shadow-xs min-h-[380px] p-4">
        {loading ? (
          /* ⚡ Skeleton Loading UI */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-zinc-800 flex flex-col items-center space-y-2">
                <Skeleton className="h-28 w-full rounded-lg bg-slate-200 dark:bg-zinc-700" />
                <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-zinc-700" />
                <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          /* Empty State */
          <div className="p-16 sm:p-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
              <Folder className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
              No files found
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
              Upload images, logos, or banner graphics to reuse them across all your email templates.
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-sky-500 hover:bg-sky-600 text-white text-xs h-9 px-4"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Now
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id || file.uid}
                className="group border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-zinc-800/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setSelectedFileForPreview(file)}
                  className="h-32 w-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden cursor-pointer relative group-hover:opacity-95"
                >
                  {isImageFile(file) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <FileIcon className="h-10 w-10 text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-1.5 rounded-full bg-white/90 text-slate-800 hover:bg-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-2.5 space-y-1.5">
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                    {file.name}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{formatFileSize(file.file_size)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 gap-1">
                    <button
                      onClick={() => copyToClipboard(file.url, file.id)}
                      className="flex-1 py-1 px-1.5 rounded bg-slate-200/60 dark:bg-zinc-700/60 hover:bg-sky-500 hover:text-white text-[11px] text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center gap-1 transition-colors"
                      title="Copy File URL"
                    >
                      {copiedId === file.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedId === file.id ? "Copied" : "Copy URL"}
                    </button>

                    <button
                      onClick={() => {
                        setRenamingFile(file);
                        setNewFileName(file.name);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-sky-600 hover:bg-slate-200 dark:hover:bg-zinc-700"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteFile(file)}
                      className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <th className="p-3">Preview</th>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">URL</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-200">
                {filteredFiles.map((file) => (
                  <tr key={file.id || file.uid} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="p-2 w-12">
                      <div className="w-9 h-9 rounded bg-slate-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                        {isImageFile(file) ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <FileIcon className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{file.name}</td>
                    <td className="p-3 text-slate-500">{formatFileSize(file.file_size)}</td>
                    <td className="p-3 text-slate-400 truncate max-w-xs">{file.url}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(file.url, file.id)}
                          className="h-7 px-2 text-xs"
                        >
                          {copiedId === file.id ? <Check className="w-3 h-3 text-emerald-600 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          {copiedId === file.id ? "Copied" : "Copy URL"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteFile(file)}
                          className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedFileForPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full p-4 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{selectedFileForPreview.name}</h3>
              <button onClick={() => setSelectedFileForPreview(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] flex items-center justify-center overflow-auto rounded bg-slate-100 dark:bg-zinc-800 p-2">
              {isImageFile(selectedFileForPreview) ? (
                <img src={selectedFileForPreview.url} alt={selectedFileForPreview.name} className="max-h-full max-w-full object-contain rounded" />
              ) : (
                <div className="p-12 text-center text-slate-500">Preview not available for this file type</div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">{formatFileSize(selectedFileForPreview.file_size)}</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => copyToClipboard(selectedFileForPreview.url, selectedFileForPreview.id)}
                  className="bg-sky-500 hover:bg-sky-600 text-white text-xs h-8 px-3"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Image URL
                </Button>
                <Button variant="outline" onClick={() => setSelectedFileForPreview(null)} className="text-xs h-8 px-3">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename File Modal */}
      {renamingFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-4 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Rename File</h3>
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter new file name"
              className="text-xs"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRenamingFile(null)} className="text-xs h-8">
                Cancel
              </Button>
              <Button onClick={handleRenameFile} className="bg-sky-500 hover:bg-sky-600 text-white text-xs h-8">
                Save Name
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
