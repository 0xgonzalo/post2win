"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Calendar, MapPin, Trophy, Clock, Users, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SubmissionGallery } from "@/components/submissions/SubmissionGallery";
import { MediaUploader } from "@/components/submissions/MediaUploader";
import { cn } from "@/lib/utils";

interface Campaign {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    eventName: string;
    eventLocation: string;
    eventDate: string;
    prizePool: number;
    currency: string;
    status: string;
    startDate: string;
    endDate: string;
    prizeBreakdown: { place: number; percentage: number }[];
    maxSubmissions: number;
    allowedTypes: string[];
    creatorId: string;
    isPaid: boolean;
}

export default function CampaignDetailPage() {
    const params = useParams();
    const { data: session } = useSession();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [campaignRes, submissionsRes] = await Promise.all([
                fetch(`/api/campaigns/${params.id}`),
                fetch(`/api/submissions?campaignId=${params.id}`),
            ]);

            if (campaignRes.ok) {
                setCampaign(await campaignRes.json());
            }
            if (submissionsRes.ok) {
                setSubmissions(await submissionsRes.json());
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUploadComplete = async (result: { url: string; type: "image" | "video"; thumbnail: string }) => {
        if (!campaign) return;

        try {
            const response = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mediaUrl: result.url,
                    mediaType: result.type.toUpperCase(),
                    thumbnail: result.thumbnail,
                    campaignId: campaign.id,
                }),
            });

            if (response.ok) {
                setShowUpload(false);
                fetchData();
            }
        } catch (error) {
            console.error("Failed to submit:", error);
        }
    };

    const handleSelectWinner = async (submissionId: string, place: number | null) => {
        if (!campaign || !session) return;

        try {
            const currentWinners = submissions
                .filter(s => s.isWinner && s.id !== submissionId)
                .map(s => ({ submissionId: s.id, place: s.winnerPlace }));

            if (place !== null) {
                currentWinners.push({ submissionId, place });
            }

            const response = await fetch(`/api/campaigns/${campaign.id}/winners`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ winners: currentWinners }),
            });

            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Winner selection failed:", error);
        }
    };

    const handleCheckout = async () => {
        if (!campaign) return;
        setIsProcessing(true);
        try {
            const res = await fetch("/api/payments/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campaignId: campaign.id }),
            });
            const { url, error } = await res.json();
            if (url) {
                window.location.href = url;
            } else {
                alert(error || "Failed to create checkout session");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading || !campaign) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="animate-pulse space-y-8">
                    <div className="h-80 bg-white/5 rounded-3xl" />
                    <div className="h-8 bg-white/5 rounded w-1/2" />
                </div>
            </div>
        );
    }

    const isOwner = session?.user?.id === campaign.creatorId;
    const endDate = new Date(campaign.endDate);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <Link
                href="/explore"
                className="inline-flex items-center space-x-2 text-foreground/60 hover:text-foreground transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Explore</span>
            </Link>

            <div className="relative rounded-[2.5rem] overflow-hidden mb-12 border border-white/5">
                {campaign.coverImage ? (
                    <img
                        src={campaign.coverImage}
                        alt={campaign.title}
                        className="w-full h-80 md:h-[400px] object-cover"
                    />
                ) : (
                    <div className="w-full h-80 md:h-[400px] bg-gradient-to-br from-primary/30 to-accent/30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest",
                                    campaign.status === "ACTIVE" && "bg-green-500/20 text-green-400",
                                    campaign.status === "DRAFT" && "bg-amber-500/20 text-amber-400",
                                    campaign.status === "COMPLETED" && "bg-gold/20 text-gold"
                                )}>
                                    {campaign.status}
                                </span>
                                {!campaign.isPaid && isOwner && (
                                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                        Unpaid
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{campaign.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-foreground/60">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{campaign.eventLocation}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{new Date(campaign.eventDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end space-y-4">
                            <div className="glass-dark p-6 rounded-[2rem] border-white/10 flex items-center gap-4">
                                <div className="p-3 bg-gold/10 rounded-2xl">
                                    <Trophy className="w-8 h-8 text-gold" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Prize Pool</p>
                                    <p className="text-3xl font-black text-white">${campaign.prizePool.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-foreground/60 font-medium">
                        <Users className="w-5 h-5 text-primary" />
                        <span>{submissions.length} submissions</span>
                    </div>
                    <div className="flex items-center space-x-2 text-foreground/60 font-medium">
                        <Clock className="w-5 h-5 text-primary" />
                        <span>{daysLeft} days remaining</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isOwner && !campaign.isPaid && (
                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="px-8 py-4 rounded-2xl bg-gold text-black font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/20 flex items-center gap-2"
                        >
                            {isProcessing ? "Processing..." : "Pay Prize Pool to Activate"}
                        </button>
                    )}

                    {session && campaign.status === "ACTIVE" && (
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-primary text-white font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                            <Upload className="w-5 h-5" />
                            <span>Capture & Submit</span>
                        </button>
                    )}
                </div>
            </div>

            {showUpload && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="glass-dark rounded-[2.5rem] p-10 border-white/5">
                        <h3 className="text-2xl font-black mb-2">Upload Your Entry</h3>
                        <p className="text-foreground/50 mb-8">Share your perspective of the event to win.</p>
                        <MediaUploader
                            onUploadComplete={handleUploadComplete}
                            allowedTypes={campaign.allowedTypes.includes("image") ? ["image"] : ["video"]}
                            maxSizeMB={100}
                        />
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
                <div className="lg:col-span-2">
                    <div className="glass-dark rounded-[2.5rem] p-10 border-white/5 h-full">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            About Campaign
                            <div className="h-px flex-grow bg-white/5" />
                        </h3>
                        <p className="text-foreground/70 text-lg leading-relaxed">{campaign.description}</p>
                    </div>
                </div>
                <div>
                    <div className="glass-dark rounded-[2.5rem] p-10 border-white/5">
                        <h3 className="text-2xl font-black mb-6">Prize Breakdown</h3>
                        <div className="space-y-4">
                            {campaign.prizeBreakdown.map((p, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <span className="font-bold text-foreground/60">{p.place}{p.place === 1 ? "st" : p.place === 2 ? "nd" : p.place === 3 ? "rd" : "th"} Place</span>
                                    <span className="font-black text-gold">{(p.percentage)}%</span>
                                    <span className="font-mono text-sm">${(campaign.prizePool * p.percentage / 100).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-black tracking-tight tracking-tight">Submission Gallery</h2>
                    {isOwner && (
                        <div className="px-6 py-2 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-widest border border-primary/20">
                            Organizer Mode Active
                        </div>
                    )}
                </div>

                {submissions.length > 0 ? (
                    <SubmissionGallery
                        submissions={submissions}
                        isOwner={isOwner}
                        onSelectWinner={handleSelectWinner}
                        prizeBreakdown={campaign.prizeBreakdown}
                        isSelectionEnabled={isOwner && campaign.status !== "COMPLETED"}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center glass-dark rounded-[3rem] border-dashed border-white/10">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Upload className="w-10 h-10 text-foreground/20" />
                        </div>
                        <h3 className="text-2xl font-black mb-2">No captures yet</h3>
                        <p className="text-foreground/40 max-w-sm mx-auto">
                            Be the first to upload and set the bar for this campaign!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

