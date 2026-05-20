"use client";

import React from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Settings2,
} from "lucide-react";
import { AtsMode } from "@/actions/analyze-resume";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  file: File;
}

interface ScreenerDropzoneProps {
  uploadedFile: UploadedFile | null;
  jobDescription: string;
  atsMode: AtsMode;
  dropError: string | null;
  isLoading: boolean;
  onDrop: (accepted: File[], rejected: FileRejection[]) => void;
  onRemoveFile: (e: React.MouseEvent) => void;
  onJobDescriptionChange: (value: string) => void;
  onAtsModeChange: (value: AtsMode) => void;
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
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700">
        <Icon className="w-3.5 h-3.5 text-zinc-300" />
      </div>
      <span className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
        {label}
      </span>
      {optional && (
        <Badge
          variant="outline"
          className="text-[10px] text-zinc-500 border-zinc-700 bg-transparent px-1.5 py-0 h-4"
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
        <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-600">
          <FileText className="w-6 h-6 text-white" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-white truncate max-w-[260px]">
            {uploadedFile.file.name}
          </p>
          <p className="text-xs text-zinc-500">
            {(uploadedFile.file.size / 1024).toFixed(1)} KB · PDF
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors duration-150 group"
        >
          <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
          Remove file
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-xl border transition-all duration-300",
          isDragActive
            ? "bg-white/10 border-white/40 scale-110"
            : "bg-zinc-800/80 border-zinc-700"
        )}
      >
        <UploadCloud
          className={cn(
            "w-6 h-6 transition-colors duration-300",
            isDragActive ? "text-white" : "text-zinc-400"
          )}
        />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-sm font-medium text-zinc-200">
          {isDragActive ? "Release to upload" : "Drop your resume here"}
        </p>
        <p className="text-xs text-zinc-500">
          or{" "}
          <span className="text-white underline underline-offset-2 cursor-pointer">
            click to browse
          </span>
        </p>
        <p className="text-[11px] text-zinc-600 mt-1">PDF · Max 5 MB</p>
      </div>
    </div>
  );
}

const ATS_MODE_META: Record<
  AtsMode,
  { label: string; description: string }
> = {
  legacy: {
    label: "Legacy ATS (Strict Keyword Match)",
    description: "Simulates Taleo/Workday — exact keyword matching, zero inference.",
  },
  modern: {
    label: "Modern AI ATS (Semantic Match)",
    description: "Simulates Greenhouse/Eightfold — evaluates meaning and impact.",
  },
  // general is intentionally omitted from the dropdown — it's the default
  // when no JD is present and shouldn't be a user-selectable option.
  general: {
    label: "General Best Practices",
    description: "Evaluates against universal resume standards.",
  },
};

export function ScreenerDropzone({
  uploadedFile,
  jobDescription,
  atsMode,
  dropError,
  isLoading,
  onDrop,
  onRemoveFile,
  onJobDescriptionChange,
  onAtsModeChange,
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
      {/* Resume Drop Zone */}
      <div>
        <SectionLabel icon={FileText} label="Resume" />
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-300 outline-none",
            isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            isDragActive
              ? "border-white/60 bg-white/5 scale-[1.01]"
              : uploadedFile
              ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500/70"
              : dropError
              ? "border-red-500/50 bg-red-500/5"
              : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/70"
          )}
        >
          <input {...getInputProps()} />
          <DropZoneContent
            isDragActive={isDragActive}
            uploadedFile={uploadedFile}
            onRemove={onRemoveFile}
          />
        </div>
        {dropError && (
          <div className="flex items-center gap-2 mt-3">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <p className="text-xs text-red-400">{dropError}</p>
          </div>
        )}
      </div>

      {/* Job Description */}
      <div>
        <SectionLabel icon={ClipboardList} label="Job Description" optional />
        <Textarea
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          disabled={isLoading}
          placeholder="Paste the job description for targeted ATS scoring…"
          rows={7}
          className={cn(
            "resize-none bg-zinc-900/40 border-zinc-700 text-zinc-200 placeholder:text-zinc-600",
            "text-sm leading-relaxed rounded-xl",
            "focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-zinc-500",
            "hover:border-zinc-600 transition-colors duration-150",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        />
        {hasJobDescription && !isLoading && (
          <p className="text-[11px] text-zinc-600 mt-1.5 text-right">
            {jobDescription.trim().split(/\s+/).length} words
          </p>
        )}
      </div>

      {/* ATS Mode Selector — only meaningful when a JD is provided */}
      <div>
        <SectionLabel icon={Settings2} label="ATS Simulator Mode" optional />
        <Select
          value={atsMode}
          onValueChange={(val) => onAtsModeChange(val as AtsMode)}
          disabled={!hasJobDescription || isLoading}
        >
          <SelectTrigger
            className={cn(
              "w-full rounded-xl border-zinc-700 bg-zinc-900/40 text-sm h-11",
              "focus:ring-1 focus:ring-white/30 focus:border-zinc-500",
              "transition-colors duration-150",
              // Visually signal that this control is locked to the JD textarea
              !hasJobDescription
                ? "opacity-40 cursor-not-allowed text-zinc-600"
                : "text-zinc-200 hover:border-zinc-600"
            )}
          >
            <SelectValue placeholder="Select ATS mode…" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
            <SelectItem
              value="legacy"
              className="focus:bg-zinc-800 focus:text-white cursor-pointer"
            >
              <div className="flex flex-col gap-0.5 py-0.5">
                <span className="text-sm font-medium">
                  {ATS_MODE_META.legacy.label}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {ATS_MODE_META.legacy.description}
                </span>
              </div>
            </SelectItem>
            <SelectItem
              value="modern"
              className="focus:bg-zinc-800 focus:text-white cursor-pointer"
            >
              <div className="flex flex-col gap-0.5 py-0.5">
                <span className="text-sm font-medium">
                  {ATS_MODE_META.modern.label}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {ATS_MODE_META.modern.description}
                </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {!hasJobDescription && (
          <p className="text-[11px] text-zinc-600 mt-1.5">
            Add a job description above to enable ATS mode selection.
          </p>
        )}
      </div>
    </>
  );
}