"use client";

import React from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  file: File;
}

interface ScreenerDropzoneProps {
  uploadedFile: UploadedFile | null;
  jobDescription: string;
  dropError: string | null;
  isLoading: boolean;
  onDrop: (accepted: File[], rejected: FileRejection[]) => void;
  onRemoveFile: (e: React.MouseEvent) => void;
  onJobDescriptionChange: (value: string) => void;
}

function SectionLabel({
  icon: Icon,
  label,
  optional = false,
}: {
  icon: React.ElementType;
  label: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800">
        <Icon className="w-3.5 h-3.5 text-zinc-400" />
      </div>
      <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
        {label}
      </span>
      {optional && (
        <Badge
          variant="outline"
          className="text-[10px] text-zinc-600 border-zinc-800 bg-transparent px-1.5 py-0 h-4"
        >
          Optional
        </Badge>
      )}
    </div>
  );
}

function DropZoneContent({
  isDragActive,
  uploadedFile,
  onRemove,
}: {
  isDragActive: boolean;
  uploadedFile: UploadedFile | null;
  onRemove: (e: React.MouseEvent) => void;
}) {
  if (uploadedFile) {
    return (
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="relative">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-xl">
            <FileText className="w-7 h-7 text-zinc-300" />
          </div>
          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <p className="text-sm font-semibold text-white truncate max-w-[240px]">
            {uploadedFile.file.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-600">
              {(uploadedFile.file.size / 1024).toFixed(1)} KB
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="text-[11px] text-zinc-600">PDF</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-red-400 transition-colors duration-200 group"
        >
          <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
          Remove file
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div
        className={cn(
          "relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-500",
          isDragActive ? "scale-110" : "scale-100"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-2xl transition-opacity duration-500",
            isDragActive
              ? "opacity-100 bg-white/5 border border-white/20"
              : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute -inset-1 rounded-3xl blur-md transition-opacity duration-500",
            isDragActive ? "opacity-30 bg-white" : "opacity-0"
          )}
        />
        <div className="relative flex items-center justify-center w-full h-full rounded-2xl bg-zinc-900 border border-zinc-800">
          <UploadCloud
            className={cn(
              "w-7 h-7 transition-colors duration-300",
              isDragActive ? "text-white" : "text-zinc-500"
            )}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p
          className={cn(
            "text-sm font-semibold transition-colors duration-300",
            isDragActive ? "text-white" : "text-zinc-300"
          )}
        >
          {isDragActive ? "Release to upload" : "Drop your resume here"}
        </p>
        <p className="text-xs text-zinc-600">
          or{" "}
          <span className="text-zinc-400 underline underline-offset-2 cursor-pointer hover:text-white transition-colors duration-150">
            click to browse
          </span>
        </p>
        <p className="text-[11px] text-zinc-700 mt-0.5">PDF · Max 5 MB</p>
      </div>
    </div>
  );
}

export function ScreenerDropzone({
  uploadedFile,
  jobDescription,
  dropError,
  isLoading,
  onDrop,
  onRemoveFile,
  onJobDescriptionChange,
}: ScreenerDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    multiple: false,
    disabled: isLoading,
  });

  const hasJobDescription = jobDescription.trim().length > 0;

  return (
    <>
      {/* ── Resume Drop Zone ── */}
      <div>
        <SectionLabel icon={FileText} label="Resume" />
        <div
          className={cn(
            "p-px rounded-2xl transition-all duration-500",
            isDragActive
              ? "bg-gradient-to-br from-white/40 via-white/10 to-white/5"
              : uploadedFile
              ? "bg-gradient-to-br from-emerald-500/40 via-emerald-500/10 to-transparent"
              : dropError
              ? "bg-gradient-to-br from-red-500/40 via-red-500/10 to-transparent"
              : "bg-gradient-to-br from-zinc-700/60 via-zinc-800/30 to-transparent hover:from-zinc-600/60 hover:via-zinc-700/30"
          )}
        >
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-[15px] p-8",
              "outline-none transition-all duration-300 backdrop-blur-sm",
              isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              isDragActive
                ? "bg-white/[0.03]"
                : uploadedFile
                ? "bg-emerald-950/20"
                : dropError
                ? "bg-red-950/20"
                : "bg-zinc-950/80 hover:bg-zinc-900/60"
            )}
          >
            <input {...getInputProps()} />
            <DropZoneContent
              isDragActive={isDragActive}
              uploadedFile={uploadedFile}
              onRemove={onRemoveFile}
            />
          </div>
        </div>

        {dropError && (
          <div className="flex items-center gap-2 mt-3">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <p className="text-xs text-red-400">{dropError}</p>
          </div>
        )}
      </div>

      {/* ── Job Description ── */}
      <div>
        <SectionLabel icon={ClipboardList} label="Job Description" optional />
        <div
          className={cn(
            "p-px rounded-2xl transition-all duration-300",
            hasJobDescription
              ? "bg-gradient-to-br from-zinc-600/50 via-zinc-700/20 to-transparent"
              : "bg-gradient-to-br from-zinc-800/60 via-zinc-800/20 to-transparent hover:from-zinc-700/60"
          )}
        >
          <Textarea
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            disabled={isLoading}
            placeholder="Paste the job description for a targeted dual-ATS comparison…"
            className={cn(
              "h-40 overflow-y-auto",
              "resize-none rounded-[15px] border-0 bg-zinc-950/90",
              "text-sm text-zinc-200 leading-relaxed placeholder:text-zinc-700",
              "focus-visible:ring-0 focus-visible:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-150 backdrop-blur-sm",
              // ── Custom Dark Mode Scrollbar ──
              "[&::-webkit-scrollbar]:w-2",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:bg-zinc-800",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700"
            )}
          />
        </div>

        {hasJobDescription && !isLoading && (
          <p className="text-[11px] text-zinc-700 mt-2 text-right tabular-nums">
            {jobDescription.trim().split(/\s+/).length} words
          </p>
        )}
      </div>
    </>
  );
}