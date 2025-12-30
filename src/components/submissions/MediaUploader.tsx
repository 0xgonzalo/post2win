"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Video, CheckCircle2, AlertCircle } from "lucide-react";
import { useUpload } from "@/hooks/useUpload";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
    onUploadComplete: (result: { url: string; type: "image" | "video"; thumbnail: string }) => void;
    allowedTypes?: ("image" | "video")[];
    maxSizeMB?: number;
    className?: string;
}

export function MediaUploader({
    onUploadComplete,
    allowedTypes = ["image", "video"],
    maxSizeMB = 50,
    className,
}: MediaUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileType, setFileType] = useState<"image" | "video" | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const mimeTypes = allowedTypes.flatMap((type) =>
        type === "image"
            ? ["image/jpeg", "image/png", "image/webp"]
            : ["video/mp4", "video/quicktime"]
    );

    const { upload, isUploading, progress, error, reset } = useUpload({
        maxSizeMB,
        allowedTypes: mimeTypes,
    });

    const handleFile = useCallback(
        async (file: File) => {
            const type = file.type.startsWith("video/") ? "video" : "image";
            setFileType(type);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(file);

            // Upload
            const result = await upload(file);
            if (result) {
                onUploadComplete({
                    url: result.url,
                    type: result.type,
                    thumbnail: result.thumbnail,
                });
            }
        },
        [upload, onUploadComplete]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const clearSelection = () => {
        setPreview(null);
        setFileType(null);
        reset();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={cn("space-y-4", className)}>
            <input
                ref={fileInputRef}
                type="file"
                accept={mimeTypes.join(",")}
                onChange={handleChange}
                className="hidden"
            />

            <AnimatePresence mode="wait">
                {!preview ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "relative flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300",
                            isDragging
                                ? "border-primary bg-primary/10 scale-[1.02]"
                                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        )}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-lg font-bold mb-2">Drag & Drop your file</p>
                        <p className="text-sm text-foreground/60">or click to browse</p>
                        <div className="flex items-center space-x-4 mt-4">
                            {allowedTypes.includes("image") && (
                                <span className="flex items-center space-x-1 text-xs text-foreground/40">
                                    <ImageIcon className="w-4 h-4" />
                                    <span>Images</span>
                                </span>
                            )}
                            {allowedTypes.includes("video") && (
                                <span className="flex items-center space-x-1 text-xs text-foreground/40">
                                    <Video className="w-4 h-4" />
                                    <span>Videos</span>
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-foreground/30 mt-2">Max {maxSizeMB}MB</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative rounded-3xl overflow-hidden border border-white/10"
                    >
                        <button
                            onClick={clearSelection}
                            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {fileType === "video" ? (
                            <video
                                src={preview}
                                className="w-full aspect-video object-cover"
                                controls
                            />
                        ) : (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full aspect-video object-cover"
                            />
                        )}

                        {/* Progress Overlay */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-primary animate-spin" />
                                <p className="text-lg font-bold">{progress}%</p>
                            </div>
                        )}

                        {/* Success Overlay */}
                        {!isUploading && progress === 100 && !error && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <p className="text-lg font-bold text-green-400">Upload Complete!</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
                >
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-400">{error}</p>
                </motion.div>
            )}
        </div>
    );
}
