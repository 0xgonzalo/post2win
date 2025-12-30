"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Campaign {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    eventName: string;
    eventLocation: string;
    eventDate: string;
    prizePool: number;
    currency: string;
    status: string;
    endDate: string;
    _count?: {
        submissions: number;
    };
}

interface CampaignCardProps {
    campaign: Campaign;
    variant?: "default" | "compact" | "featured";
}

export function CampaignCard({ campaign, variant = "default" }: CampaignCardProps) {
    const endDate = new Date(campaign.endDate);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const statusColors = {
        ACTIVE: "bg-green-500",
        COMPLETED: "bg-gold",
        DRAFT: "bg-foreground/20",
        CANCELLED: "bg-red-500",
    };


    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Link href={`/campaigns/${campaign.id}`}>
                <article className={cn(
                    "group glass-dark rounded-[2rem] overflow-hidden border-white/5 hover:border-white/10 transition-all",
                    variant === "featured" && "md:col-span-2"
                )}>
                    {/* Cover Image */}
                    <div className="relative aspect-video overflow-hidden">
                        {campaign.coverImage ? (
                            <img
                                src={campaign.coverImage}
                                alt={campaign.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                        )}

                        {/* Prize Badge */}
                        <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-gold text-gold-foreground text-sm font-black shadow-lg">
                            {campaign.currency === "USD" ? "$" : campaign.currency}
                            {campaign.prizePool.toLocaleString()} PRIZE
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-4 left-4 flex items-center space-x-2">
                            <span className={cn("w-2 h-2 rounded-full animate-pulse", statusColors[campaign.status as keyof typeof statusColors])} />
                            <span className="text-xs font-bold uppercase tracking-wider bg-black/50 backdrop-blur px-2 py-1 rounded-lg">
                                {campaign.status}
                            </span>
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Event Info Overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-xl font-bold mb-1 line-clamp-1">{campaign.title}</h3>
                            <p className="text-sm text-foreground/70">{campaign.eventName}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between text-sm text-foreground/60">
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span className="line-clamp-1">{campaign.eventLocation}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(campaign.eventDate).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center space-x-2 text-sm text-foreground/40">
                                <Users className="w-4 h-4" />
                                <span>{campaign._count?.submissions || 0} submissions</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className={cn(
                                    "text-sm font-bold",
                                    daysLeft <= 3 ? "text-red-400" : "text-primary"
                                )}>
                                    {daysLeft === 0 ? "Ending today" : `${daysLeft} days left`}
                                </span>
                            </div>
                        </div>
                    </div>
                </article>
            </Link>
        </motion.div>
    );
}
