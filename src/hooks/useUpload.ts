"use client";

import { useState, useCallback } from "react";

interface UploadResult {
    url: string;
    publicId: string;
    type: "image" | "video";
    thumbnail: string;
}

interface UseUploadOptions {
    folder?: string;
    maxSizeMB?: number;
    allowedTypes?: string[];
}

export function useUpload(options: UseUploadOptions = {}) {
    const {
        folder = "submissions",
        maxSizeMB = 50,
        allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"]
    } = options;

    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
        setError(null);
        setProgress(0);

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
            setError(`File type not allowed. Allowed: ${allowedTypes.join(", ")}`);
            return null;
        }

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            setError(`File too large. Max size: ${maxSizeMB}MB`);
            return null;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", folder);

            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const result = await response.json();
            return result as UploadResult;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
            return null;
        } finally {
            setIsUploading(false);
        }
    }, [folder, maxSizeMB, allowedTypes]);

    const reset = useCallback(() => {
        setProgress(0);
        setError(null);
    }, []);

    return {
        upload,
        isUploading,
        progress,
        error,
        reset,
    };
}
