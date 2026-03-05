"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";

type MediaItem = {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
  folder: string;
};

type UploadFolder = "blog" | "projects" | "team";

const folderOptions: UploadFolder[] = ["blog", "projects", "team"];

export default function AdminMediaClient() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folder, setFolder] = useState<UploadFolder>("blog");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const totalSizeMb = useMemo(() => (items.reduce((sum, item) => sum + item.size, 0) / (1024 * 1024)).toFixed(2), [items]);

  const loadItems = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/upload", { credentials: "include" });
      const payload = (await response.json()) as { success: boolean; data?: MediaItem[]; error?: string };

      if (response.ok && payload.success && payload.data) {
        setItems(payload.data);
      } else {
        setMessage(payload.error ?? "Unable to load media files.");
      }
    } catch {
      setMessage("Unable to load media files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const onUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please choose an image first.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const formData = new FormData();
    formData.append("folder", folder);
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const payload = (await response.json()) as { success: boolean; data?: { url: string }; error?: string };

      if (!response.ok || !payload.success) {
        setMessage(payload.error ?? "Upload failed.");
        return;
      }

      setMessage("Image uploaded successfully.");
      setFile(null);
      const input = document.getElementById("media-upload-input") as HTMLInputElement | null;
      if (input) {
        input.value = "";
      }
      await loadItems();
    } catch {
      setMessage("Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (url: string) => {
    try {
      const response = await fetch(`/api/admin/upload?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
        credentials: "include",
      });

      const payload = (await response.json()) as { success: boolean; error?: string };

      if (!response.ok || !payload.success) {
        setMessage(payload.error ?? "Delete failed.");
        return;
      }

      setItems((prev) => prev.filter((item) => item.url !== url));
    } catch {
      setMessage("Delete failed.");
    }
  };

  const onCopy = async (url: string) => {
    const absolute = `${window.location.origin}${url}`;

    try {
      await navigator.clipboard.writeText(absolute);
      setMessage("Copied image URL.");
    } catch {
      setMessage("Unable to copy URL.");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onUpload} className="surface-card space-y-4 p-5">
        <h3 className="type-h3">Upload Image</h3>

        <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
          <div className="space-y-2">
            <label htmlFor="media-folder" className="text-sm font-medium">
              Folder
            </label>
            <select
              id="media-folder"
              value={folder}
              onChange={(event) => setFolder(event.target.value as UploadFolder)}
              className="w-full min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {folderOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="media-upload-input" className="text-sm font-medium">
              Image file (png, jpg, jpeg, webp, max 5MB)
            </label>
            <input
              id="media-upload-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="w-full min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Uploading..." : "Upload"}
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="type-h3">Media Library</h3>
        <p className="type-body-sm">{items.length} files • {totalSizeMb} MB total</p>
      </div>

      {message ? <p className="text-sm text-muted">{message}</p> : null}

      {loading ? (
        <p className="type-body">Loading media files...</p>
      ) : items.length === 0 ? (
        <p className="type-body">No uploaded images yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article key={item.url} className="surface-card overflow-hidden p-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-background">
                <Image src={item.url} alt={item.name} fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover" />
              </div>
              <div className="mt-3 space-y-2">
                <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted">/{item.folder} • {(item.size / 1024).toFixed(1)} KB</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void onCopy(item.url)}
                    className="inline-flex min-h-10 items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors duration-200 hover:border-foreground/30"
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(item.url)}
                    className="inline-flex min-h-10 items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors duration-200 hover:border-foreground/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

