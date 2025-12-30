"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Play, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Submission {
    id: string;
    mediaUrl: string;
    mediaType: "IMAGE" | "VIDEO";
    thumbnail?: string;
    title?: string;
    isWinner?: boolean;
    winnerPlace?: number;
    user: {
        id: string;
        name: string | null;
        avatar: string | null;
    };
}

interface SubmissionGalleryProps {
    submissions: Submission[];
    isOwner?: boolean;
    onSelectWinner?: (submissionId: string, place: number | null) => void;
    prizeBreakdown?: { place: number; percentage: number }[];
    isSelectionEnabled?: boolean;
}

export function SubmissionGallery({
    submissions,
    isOwner = false,
    onSelectWinner,
    prizeBreakdown = [],
    isSelectionEnabled = false,
}: SubmissionGalleryProps) {
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    return (
        <>
            {/* Masonry Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {submissions.map((submission, idx) => (
                    <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="break-inside-avoid"
                    >
                        <article
                            onClick={() => setSelectedSubmission(submission)}
                            className="group relative rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 cursor-pointer transition-all"
                        >
                            {/* Media */}
                            <div className="relative">
                                {submission.mediaType === "VIDEO" ? (
                                    <>
                                        <img
                                            src={submission.thumbnail || submission.mediaUrl}
                                            alt={submission.title || "Submission"}
                                            className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                                                <Play className="w-8 h-8 text-white fill-white" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <img
                                        src={submission.mediaUrl}
                                        alt={submission.title || "Submission"}
                                        className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                )}

                                {/* Winner Badge */}
                                {submission.isWinner && (
                                    <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-gold text-gold-foreground text-xs font-black shadow-xl z-20 flex items-center space-x-1">
                                        <span>🏆</span>
                                        <span>{submission.winnerPlace === 1 ? "1ST" : submission.winnerPlace === 2 ? "2ND" : submission.winnerPlace === 3 ? "3RD" : `${submission.winnerPlace}TH`}</span>
                                    </div>
                                )}

                                {/* Organizer Selection Dropdown */}
                                {isOwner && isSelectionEnabled && (
                                    <div className="absolute top-4 left-4 z-20" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={submission.winnerPlace || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                onSelectWinner?.(submission.id, val === "" ? null : Number(val));
                                            }}
                                            className="bg-black/80 backdrop-blur text-white text-xs font-bold rounded-lg border border-white/20 px-2 py-1 outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                                        >
                                            <option value="">Status</option>
                                            <optgroup label="Select Winner">
                                                {prizeBreakdown.map((p) => (
                                                    <option key={p.place} value={p.place}>
                                                        {p.place === 1 ? "1st Place" : p.place === 2 ? "2nd Place" : p.place === 3 ? "3rd Place" : `${p.place}th Place`}
                                                    </option>
                                                ))}
                                            </optgroup>
                                            <option value="">Not a winner</option>
                                        </select>
                                    </div>
                                )}

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* User Info */}
                                <div className="absolute bottom-4 left-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {submission.user.avatar ? (
                                        <img
                                            src={submission.user.avatar}
                                            alt={submission.user.name || "User"}
                                            className="w-8 h-8 rounded-full border border-white/20"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                            <User className="w-4 h-4" />
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-white">{submission.user.name || "Anonymous"}</span>
                                </div>
                            </div>
                        </article>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedSubmission && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
                        onClick={() => setSelectedSubmission(null)}
                    >
                        <button
                            onClick={() => setSelectedSubmission(null)}
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-5xl max-h-[90vh] relative"
                        >
                            {selectedSubmission.mediaType === "VIDEO" ? (
                                <video
                                    src={selectedSubmission.mediaUrl}
                                    controls
                                    autoPlay
                                    className="max-h-[80vh] rounded-3xl overflow-hidden border border-white/10"
                                />
                            ) : (
                                <img
                                    src={selectedSubmission.mediaUrl}
                                    alt={selectedSubmission.title || "Submission"}
                                    className="max-h-[80vh] rounded-3xl object-contain border border-white/10"
                                />
                            )}

                            {/* Info Bar */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-b-3xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {selectedSubmission.user.avatar ? (
                                            <img
                                                src={selectedSubmission.user.avatar}
                                                alt={selectedSubmission.user.name || "User"}
                                                className="w-12 h-12 rounded-full border border-white/20"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-lg font-bold text-white">{selectedSubmission.user.name || "Anonymous"}</p>
                                            {selectedSubmission.title && (
                                                <p className="text-sm text-white/60">{selectedSubmission.title}</p>
                                            )}
                                        </div>
                                    </div>

                                    {selectedSubmission.isWinner && (
                                        <div className="flex items-center space-x-2 px-6 py-3 rounded-full bg-gold text-gold-foreground font-black shadow-2xl">
                                            <span>🏆</span>
                                            <span>{selectedSubmission.winnerPlace === 1 ? "1ST PLACE" : selectedSubmission.winnerPlace === 2 ? "2ND PLACE" : selectedSubmission.winnerPlace === 3 ? "3RD PLACE" : `${selectedSubmission.winnerPlace}TH PLACE`}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

