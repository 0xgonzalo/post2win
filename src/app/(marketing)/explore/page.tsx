"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, TrendingUp, Clock, DollarSign } from "lucide-react";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { cn } from "@/lib/utils";

const categories = [
    { id: "all", label: "All" },
    { id: "music", label: "Music" },
    { id: "festival", label: "Festival" },
    { id: "sports", label: "Sports" },
    { id: "art", label: "Art & Culture" },
];

const sortOptions = [
    { id: "newest", label: "Newest", icon: Clock },
    { id: "endingSoon", label: "Ending Soon", icon: TrendingUp },
    { id: "highestPrize", label: "Highest Prize", icon: DollarSign },
];

export default function ExplorePage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchCampaigns = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (category !== "all") params.append("category", category);
                params.append("status", "ACTIVE");

                const response = await fetch(`/api/campaigns?${params.toString()}`);
                const data = await response.json();

                // Client-side sorting
                let sorted = [...data];
                switch (sortBy) {
                    case "endingSoon":
                        sorted.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
                        break;
                    case "highestPrize":
                        sorted.sort((a, b) => Number(b.prizePool) - Number(a.prizePool));
                        break;
                    default:
                        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                }

                // Client-side search filter
                if (searchQuery) {
                    sorted = sorted.filter(
                        (c) =>
                            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.eventName.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                }

                setCampaigns(sorted);
            } catch (error) {
                console.error("Failed to fetch campaigns:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaigns();
    }, [category, sortBy, searchQuery]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    Explore <span className="text-gradient">Campaigns</span>
                </h1>
                <p className="text-foreground/60 max-w-xl mx-auto">
                    Find active contests, upload your best shots, and win real money prizes.
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                    type="text"
                    placeholder="Search campaigns or events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:border-primary transition-colors"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                {/* Category Tabs */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                                category === cat.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white/5 hover:bg-white/10 text-foreground/70"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-foreground/40" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-primary appearance-none cursor-pointer"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Campaign Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="glass-dark rounded-[2rem] overflow-hidden border-white/5 animate-pulse"
                        >
                            <div className="aspect-video bg-white/5" />
                            <div className="p-6 space-y-4">
                                <div className="h-4 bg-white/5 rounded w-3/4" />
                                <div className="h-3 bg-white/5 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : campaigns.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {campaigns.map((campaign, idx) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <CampaignCard campaign={campaign} />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Search className="w-10 h-10 text-foreground/30" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No campaigns found</h3>
                    <p className="text-foreground/60">Try adjusting your filters or search query.</p>
                </div>
            )}
        </div>
    );
}
