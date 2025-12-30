"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Trophy,
    Calendar,
    MapPin,
    Image as ImageIcon,
    Settings,
    ArrowRight,
    ArrowLeft,
    CheckCircle2
} from "lucide-react";
import { campaignSchema, CampaignSchema } from "@/validations/campaign";
import { cn } from "@/lib/utils";

const steps = [
    { id: "event", title: "Event Info", icon: Calendar },
    { id: "prizes", title: "Prizes", icon: Trophy },
    { id: "rules", title: "Rules", icon: Settings },
    { id: "review", title: "Review", icon: CheckCircle2 },
];

export default function CreateCampaignPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<CampaignSchema>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            prizeBreakdown: [{ place: 1, percentage: 100 }],
            allowedTypes: ["image"],
            maxSubmissions: 3,
            maxFileSize: 50,
        }
    });

    const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tight">Create Campaign</h1>
                    <p className="text-foreground/60">Set up your event contest and define the prize pool</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-between relative px-2">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center space-y-2 z-10">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                currentStep >= idx
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white/5 text-foreground/40"
                            )}>
                                <step.icon className="w-6 h-6" />
                            </div>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                currentStep >= idx ? "text-primary" : "text-foreground/40"
                            )}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                    {/* Progress Bar Background */}
                    <div className="absolute top-6 left-0 right-0 h-[2px] bg-white/5 -z-0 mx-8" />
                    {/* Progress Bar Active */}
                    <motion.div
                        className="absolute top-6 left-0 h-[2px] bg-primary -z-0 mx-8"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(currentStep / (steps.length - 1)) * 90}%` }}
                    />
                </div>

                <form className="glass-dark rounded-[2.5rem] border-white/5 p-8 md:p-12 min-h-[500px] flex flex-col justify-between">
                    <AnimatePresence mode="wait">
                        {currentStep === 0 && (
                            <motion.div
                                key="step-0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-wider text-foreground/60">Campaign Title</label>
                                        <input
                                            {...register("title")}
                                            placeholder="e.g. Rolling Loud Miami 2025 Best Shots"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-colors"
                                        />
                                        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-wider text-foreground/60">Event Name</label>
                                        <input
                                            {...register("eventName")}
                                            placeholder="e.g. Rolling Loud"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wider text-foreground/60">Description</label>
                                    <textarea
                                        {...register("description")}
                                        placeholder="Tell participants what they should capture..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-colors min-h-[120px]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-wider text-foreground/60">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                                            <input
                                                {...register("eventLocation")}
                                                placeholder="Hard Rock Stadium, Miami"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:border-primary transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-wider text-foreground/60">Category</label>
                                        <select
                                            {...register("category")}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-colors appearance-none"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="music">Music Show</option>
                                            <option value="festival">Festival</option>
                                            <option value="sports">Sports</option>
                                            <option value="art">Art & Culture</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col items-center space-y-4 py-8">
                                    <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center">
                                        <Trophy className="w-10 h-10 text-gold" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Define the Prize Pool</h2>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-foreground/40">$</span>
                                        <input
                                            {...register("prizePool")}
                                            type="number"
                                            placeholder="5,000"
                                            className="bg-transparent border-b-2 border-white/10 focus:border-gold transition-colors text-6xl font-black text-center w-full max-w-[300px] py-4 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/60">Distribution</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-xl bg-gold text-gold-foreground flex items-center justify-center font-black">1</div>
                                                <span className="font-bold">1st Place (Winner)</span>
                                            </div>
                                            <span className="text-xl font-black text-gold">100%</span>
                                        </div>
                                        <p className="text-xs text-foreground/40 text-center italic">Advanced multi-place distribution coming soon</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Steps 2 and 3 would go here... Simplified for now */}
                        {currentStep >= 2 && (
                            <motion.div
                                key="step-rest"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-center justify-center h-full space-y-4 text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Settings className="w-10 h-10 text-primary animate-spin-slow" />
                                </div>
                                <h2 className="text-2xl font-bold">Rules & Review Configuration</h2>
                                <p className="text-foreground/60">Finalizing the logic for submission limits and voting deadlines.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between pt-12">
                        <button
                            type="button"
                            onClick={prev}
                            disabled={currentStep === 0}
                            className={cn(
                                "flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all",
                                currentStep === 0 ? "opacity-0 cursor-default" : "hover:bg-white/5 text-foreground/60"
                            )}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-bold">Previous</span>
                        </button>

                        <button
                            type="button"
                            onClick={next}
                            className="group flex items-center space-x-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                        >
                            <span>{currentStep === steps.length - 1 ? "Finish" : "Next Step"}</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
