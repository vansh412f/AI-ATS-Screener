"use client";

import React, { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, UploadCloud, X, Loader2, CheckCircle2, AlertCircle, Sparkles, ClipboardList,} from "lucide-react";
import { parsePdf, ParsePdfResult } from "@/actions/parse-pdf";
import { cn } from "@/lib/utils";

interface UploadedFile {
  file: File;
  preview: string;
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

function ResultPanel({ result }: { result: ParsePdfResult }) {
  if (!result.success) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300 mb-1">
              Parsing Failed
            </p>
            <p className="text-xs text-red-400/80 leading-relaxed">
              {result.error ?? "An unexpected error occurred."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const wordCount = result.text?.trim().split(/\s+/).length ?? 0;
  const charCount = result.text?.length ?? 0;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-300">
            Parsed Successfully
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
          <span>{wordCount.toLocaleString()} words</span>
          <span className="text-zinc-700">·</span>
          <span>{charCount.toLocaleString()} chars</span>
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs font-mono text-zinc-400 leading-relaxed whitespace-pre-wrap line-clamp-[12] max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700">
          {result.text}
        </p>
      </div>
    </div>
  );
}

export default function ScreenerPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [dropError, setDropError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsePdfResult | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setDropError(null);
      setResult(null);

      if (rejectedFiles.length > 0) {
        const reason = rejectedFiles[0].errors[0];
        if (reason.code === "file-too-large") {
          setDropError("File exceeds 5 MB limit. Please use a smaller PDF.");
        } else if (reason.code === "file-invalid-type") {
          setDropError("Only PDF files are accepted.");
        } else {
          setDropError(reason.message);
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile({
          file,
          preview: URL.createObjectURL(file),
        });
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 5 * 1024 * 1024, // 5 MB
    maxFiles: 1,
    multiple: false,
  });

  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setResult(null);
    setDropError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!uploadedFile) return;

    setIsParsing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", uploadedFile.file);
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription.trim());
      }

      const parseResult = await parsePdf(formData);
      setResult(parseResult);
    } catch (err) {
      setResult({
        success: false,
        text: null,
        error:
          err instanceof Error
            ? err.message
            : "A network error occurred. Please try again.",
      });
    } finally {
      setIsParsing(false);
    }
  }, [uploadedFile, jobDescription]);

  const canSubmit = Boolean(uploadedFile) && !isParsing;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Resume Screener
              </h1>
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                Upload a PDF resume and optionally provide a job description.
                The engine will parse the document and prepare it for AI
                analysis.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8">
            {/* Resume Drop Zone */}
            <div>
              <SectionLabel icon={FileText} label="Resume" />
              <div
                {...getRootProps()}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-300 outline-none",
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
                  onRemove={handleRemoveFile}
                />
              </div>

              {dropError && (
                <div className="flex items-center gap-2 mt-3">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{dropError}</p>
                </div>
              )}
            </div>

            <div>
              <SectionLabel
                icon={ClipboardList}
                label="Job Description"
                optional
              />
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to enable targeted ATS analysis…"
                rows={8}
                className={cn(
                  "resize-none bg-zinc-900/40 border-zinc-700 text-zinc-200 placeholder:text-zinc-600",
                  "text-sm leading-relaxed rounded-xl",
                  "focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-zinc-500",
                  "hover:border-zinc-600 transition-colors duration-150",
                  "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700"
                )}
              />
              {jobDescription.trim().length > 0 && (
                <p className="text-[11px] text-zinc-600 mt-1.5 text-right">
                  {jobDescription.trim().split(/\s+/).length} words
                </p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "w-full h-12 font-semibold text-sm rounded-xl transition-all duration-200",
                canSubmit
                  ? "bg-white text-black hover:bg-zinc-200 active:scale-[0.99]"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              )}
            >
              {isParsing ? (
                <span className="flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Parsing Document…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Parse Resume
                </span>
              )}
            </Button>
          </div>

          <div className="lg:sticky lg:top-8">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Parsed Output
                </span>
                {result?.success && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] px-2 py-0.5">
                    Ready
                  </Badge>
                )}
              </div>

              <div className="p-5 min-h-[340px] flex flex-col justify-center">
                {!result && !isParsing && (
                  <div className="flex flex-col items-center gap-3 text-center py-8">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-700 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">
                        Awaiting submission
                      </p>
                      <p className="text-xs text-zinc-700 mt-1">
                        Parsed text will appear here
                      </p>
                    </div>
                  </div>
                )}

                {isParsing && (
                  <div className="flex flex-col items-center gap-4 text-center py-8">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                      <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
                      <FileText className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">
                        Extracting text…
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        Reading PDF buffer in memory
                      </p>
                    </div>
                  </div>
                )}

                {result && !isParsing && <ResultPanel result={result} />}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-4">
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                <span className="text-zinc-500 font-medium">
                  Security note:
                </span>{" "}
                Your file is processed entirely in-memory on the server and is
                never written to disk or stored. Raw text is returned directly
                to this client.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}