"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDropzone, FileRejection } from "react-dropzone";
import { useAuth } from "@clerk/nextjs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  Lock,
  Sparkles,
  Wand2,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JOB_CATEGORIES, getJobDescription } from "@/lib/ats/job-descriptions";

export interface UploadedFile {
  file: File;
}

interface ScreenerDropzoneProps {
  uploadedFile: UploadedFile | null;
  jobDescription: string;
  dropError: string | null;
  isLoading: boolean;
  selectedRole: string;
  onDrop: (accepted: File[], rejected: FileRejection[]) => void;
  onRemoveFile: (e: React.MouseEvent) => void;
  onJobDescriptionChange: (value: string) => void;
  onSelectedRoleChange: (role: string) => void;
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

function LockedDropzoneTeaser() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-black/80 to-black/90 backdrop-blur-sm" />

      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>

      <div className="relative flex flex-col items-center justify-center gap-6 p-10">
        <div className="relative">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-700/50 shadow-2xl shadow-black/50">
            <Lock className="w-7 h-7 text-zinc-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-zinc-500" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-sm font-semibold text-zinc-200">
            AI Resume Screener
          </h3>
          <p className="text-xs text-zinc-500 max-w-[220px] leading-relaxed">
            Sign in to unlock dual ATS analysis powered by legacy and modern AI
            engines
          </p>
        </div>

        <Link href="/sign-in?redirect_url=/screener">
          <Button
            size="sm"
            className={cn(
              "h-10 px-6 text-sm font-semibold rounded-xl",
              "bg-white text-black",
              "hover:bg-zinc-200 active:scale-[0.98]",
              "transition-all duration-200",
              "shadow-lg shadow-white/10"
            )}
          >
            <Lock className="w-3.5 h-3.5 mr-2" />
            Sign In to Unlock
          </Button>
        </Link>

        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1.5 text-[15px] text-zinc-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Free to use
          </div>
          <div className="flex items-center gap-1.5 text-[15px] text-zinc-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            No credit card
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScreenerDropzone({
  uploadedFile,
  jobDescription,
  dropError,
  isLoading,
  selectedRole,
  onDrop,
  onRemoveFile,
  onJobDescriptionChange,
  onSelectedRoleChange,
}: ScreenerDropzoneProps) {
  const { isSignedIn } = useAuth();
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    multiple: false,
    disabled: isLoading || !isSignedIn,
  });

  const hasJobDescription = jobDescription.trim().length > 0;
  const lastAutoFilledJd = React.useRef<string>("");

  function handleRoleSelect(value: string) {
    const jd = getJobDescription(value);
    if (!jd) return;

    const currentJd = jobDescription.trim();
    const isAutoFilled =
      currentJd === "" || currentJd === lastAutoFilledJd.current;

    if (!isAutoFilled && currentJd.length > 0) {
      setPendingRole(value);
      return;
    }

    applyRole(value, jd);
  }

  function applyRole(role: string, jd: string) {
    onSelectedRoleChange(role);
    onJobDescriptionChange(jd);
    lastAutoFilledJd.current = jd;
    setPendingRole(null);
  }

  function confirmReplace() {
    if (!pendingRole) return;
    const jd = getJobDescription(pendingRole);
    if (!jd) return;
    applyRole(pendingRole, jd);
  }

  function cancelReplace() {
    setPendingRole(null);
  }

  return (
    <>
      <div>
        <SectionLabel icon={FileText} label="Resume" />

        {!isSignedIn ? (
          <LockedDropzoneTeaser />
        ) : (
          <>
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
                  isLoading
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer",
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
          </>
        )}
      </div>

      <div>
        <SectionLabel icon={Wand2} label="Quick Fill" optional />
        <div className="flex items-center gap-2">
          <Select
            value={selectedRole}
            onValueChange={handleRoleSelect}
            disabled={isLoading || !isSignedIn}
          >
            <SelectTrigger
              className={cn(
                "w-full bg-zinc-950/90 border border-zinc-800 rounded-xl text-sm text-zinc-200 h-10",
                "hover:border-zinc-700 focus:ring-0 focus:ring-offset-0",
                "transition-colors duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <SelectValue placeholder="Select a target role..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/80">
              {JOB_CATEGORIES.map((category) => (
                <SelectGroup key={category.category}>
                  <SelectLabel className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-2">
                    {category.category}
                  </SelectLabel>
                  {category.roles.map((role) => (
                    <SelectItem
                      key={role.label}
                      value={role.label}
                      className="text-sm text-zinc-300 focus:bg-zinc-800 focus:text-white rounded-lg cursor-pointer"
                    >
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          {selectedRole && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                applyRole("", "");
              }}
              className="flex items-center justify-center shrink-0 w-10 h-10 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
              aria-label="Clear selected role"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {pendingRole ? (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-950/20 px-3.5 py-2.5 animate-in fade-in duration-200">
            <TriangleAlert className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <p className="text-xs text-orange-300 flex-1">
              Replace your current job description with{" "}
              <span className="font-semibold text-orange-200">
                {pendingRole}
              </span>
              ?
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={cancelReplace}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReplace}
                className="text-xs font-semibold text-black bg-white hover:bg-zinc-100 active:scale-[0.98] transition-all duration-200 rounded-lg px-3 py-1.5"
              >
                Replace
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-zinc-600 mt-2">
            Or paste your own job description below
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center">
          <SectionLabel icon={ClipboardList} label="Job Description" optional />
          {selectedRole &&
            jobDescription === lastAutoFilledJd.current && (
              <div className="flex items-center gap-1.5 ml-auto mb-3">
                <Badge
                  variant="outline"
                  className="text-[10px] text-indigo-400 border-indigo-500/25 bg-indigo-500/10 px-1.5 py-0 h-4 border"
                >
                  {selectedRole}
                </Badge>
                <span className="text-[10px] text-zinc-600">· Edit freely</span>
              </div>
            )}
        </div>
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
            disabled={isLoading || !isSignedIn}
            placeholder={
              isSignedIn
                ? "Paste the job description for a targeted dual-ATS comparison…"
                : "Sign in to paste a job description…"
            }
            className={cn(
              "h-40 overflow-y-auto",
              "resize-none rounded-[15px] border-0 bg-zinc-950/90",
              "text-sm text-zinc-200 leading-relaxed placeholder:text-zinc-700",
              "focus-visible:ring-0 focus-visible:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-150 backdrop-blur-sm",
              "[&::-webkit-scrollbar]:w-2",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:bg-zinc-800",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700"
            )}
          />
        </div>

        {hasJobDescription && !isLoading && isSignedIn && (
          <p className="text-[11px] text-zinc-700 mt-2 text-right tabular-nums">
            {jobDescription.trim().split(/\s+/).length} words
          </p>
        )}
      </div>
    </>
  );
}