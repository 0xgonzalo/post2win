"use client";

import { motion } from "framer-motion";
import {
    Trophy,
    Rocket,
    FileText,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
    user: any;
    stats: {
        campaignsCreated: number;
        submissionsMade: number;
        totalWon: number;
    };
    recentSubmissions: any[];
    myCampaigns: any[];
}

export function DashboardClient({
    user,
    stats,
    recentSubmissions,
    myCampaigns
}: DashboardClientProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="mb-12">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-black mb-2 tracking-tight"
                >
                    Welcome back, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user.name || "Creator"}</span>!
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-foreground/60 text-lg"
                >
                    Here's what's happening with your captures and campaigns.
                </motion.p>
            </header>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
                <div className="glass-dark p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Trophy className="w-24 h-24 text-gold" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-2">Total Earnings</p>
                    <h2 className="text-5xl font-black text-white mb-1 font-mono">${stats.totalWon.toLocaleString()}</h2>
                    <p className="text-xs text-green-400 font-bold flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Payouts processed
                    </p>
                </div>

                <div className="glass-dark p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Rocket className="w-24 h-24 text-primary" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-2">Active Campaigns</p>
                    <h2 className="text-5xl font-black text-white mb-1 font-mono">{stats.campaignsCreated}</h2>
                    <p className="text-xs text-primary font-bold">Managing {stats.campaignsCreated} creator projects</p>
                </div>

                <div className="glass-dark p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <FileText className="w-24 h-24 text-accent" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-2">My Submissions</p>
                    <h2 className="text-5xl font-black text-white mb-1 font-mono">{stats.submissionsMade}</h2>
                    <p className="text-xs text-accent font-bold">In {stats.submissionsMade} different contests</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Recent Submissions */}
                <motion.section
                    variants={item}
                    initial="hidden"
                    animate="show"
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            Recent Captures
                            <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-foreground/60 font-medium">Newest First</span>
                        </h3>
                        <Link href="/submissions" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                            View All <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentSubmissions.length > 0 ? (
                            recentSubmissions.map((sub, idx) => (
                                <div key={idx} className="glass-dark p-6 rounded-3xl border-white/5 hover:border-white/10 transition-all flex items-center gap-6 group">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                        <img src={sub.mediaUrl} alt={sub.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-lg mb-1 line-clamp-1">{sub.campaign.title}</h4>
                                        <div className="flex items-center gap-4 text-sm text-foreground/50">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(sub.createdAt).toLocaleDateString()}
                                            </span>
                                            {sub.isWinner ? (
                                                <span className="text-gold font-black flex items-center gap-1">
                                                    🏆 Winner ({sub.winnerPlace}st)
                                                </span>
                                            ) : (
                                                <span className={cn(
                                                    "flex items-center gap-1",
                                                    sub.campaign.status === "ACTIVE" ? "text-blue-400" : "text-foreground/40"
                                                )}>
                                                    {sub.campaign.status === "ACTIVE" ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                                    {sub.campaign.status === "ACTIVE" ? "In Review" : "Campaign Ended"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/campaigns/${sub.campaignId}`}
                                        className="p-4 rounded-2xl bg-white/5 hover:bg-primary/20 text-white transition-colors"
                                    >
                                        <ArrowUpRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="glass-dark p-12 rounded-[2.5rem] border-dashed border-white/10 text-center">
                                <AlertCircle className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                                <p className="text-foreground/40 font-bold">No submissions yet.</p>
                                <Link href="/explore" className="text-primary hover:underline mt-2 inline-block font-bold">Browse Campaigns</Link>
                            </div>
                        )}
                    </div>
                </motion.section>

                {/* My Campaigns (Creator View) */}
                <motion.section
                    variants={item}
                    initial="hidden"
                    animate="show"
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">My Campaigns</h3>
                        <Link href="/campaigns/create" className="p-2 rounded-xl bg-primary text-white hover:scale-105 transition-transform">
                            <Rocket className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {myCampaigns.length > 0 ? (
                            myCampaigns.map((camp, idx) => (
                                <div key={idx} className="glass-dark p-6 rounded-3xl border-white/5 hover:bg-white/5 transition-all">
                                    <h4 className="font-bold mb-3 line-clamp-1">{camp.title}</h4>
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full",
                                            camp.status === "ACTIVE" ? "bg-green-500/10 text-green-500" : "bg-white/10 text-foreground/40"
                                        )}>
                                            {camp.status}
                                        </span>
                                        <span className="text-foreground/40">{camp._count.submissions} Submissions</span>
                                    </div>
                                    <Link
                                        href={`/campaigns/${camp.id}`}
                                        className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-center block text-sm font-bold transition-all"
                                    >
                                        Manage Campaign
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="glass-dark p-12 rounded-[2.5rem] border-dashed border-white/10 text-center">
                                <p className="text-foreground/40 font-bold mb-4">No campaigns created.</p>
                                <Link href="/campaigns/create" className="p-4 rounded-2xl bg-primary text-white font-bold inline-block hover:scale-105 transition-transform">
                                    Start First Campaign
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
