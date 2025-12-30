"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Camera, Zap, ArrowRight, Star } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl px-6 py-20 md:py-32 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary/20 blur-[128px] rounded-full" />
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-accent/20 blur-[128px] rounded-full" />

        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary shadow-sm"
          >
            <Star className="w-4 h-4 fill-primary" />
            <span>Over $1M paid out to creators</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]"
          >
            Turn Your <span className="text-gradient">Vibe</span> <br />
            Into <span className="text-gradient">Rewards.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl text-lg md:text-xl text-foreground/60 leading-relaxed"
          >
            Upload your best shots from concerts, festivals, and events.
            Compete for prize pools and get paid for your creativity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link
              href="/explore"
              className="group relative px-8 py-4 rounded-2xl bg-primary text-white font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
            >
              <div className="relative z-10 flex items-center space-x-2">
                <span>Start Winning</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>

            <Link
              href="/campaigns/create"
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-lg transition-all hover:bg-white/10 active:scale-95"
            >
              For Organizers
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl px-6 py-20">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div
            variants={fadeUp}
            className="glass-dark p-8 rounded-3xl border-white/5 space-y-4 hover:border-primary/50 transition-colors group"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Capture the Event</h3>
            <p className="text-foreground/60">
              Use your phone or camera to capture the best moments from events you attend.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="glass-dark p-8 rounded-3xl border-white/5 space-y-4 hover:border-accent/50 transition-colors group"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-2xl font-bold">Submit & Compete</h3>
            <p className="text-foreground/60">
              Upload your content to active campaigns and get votes from the community.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="glass-dark p-8 rounded-3xl border-white/5 space-y-4 hover:border-gold/50 transition-colors group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-2xl font-bold">Win Prize Pools</h3>
            <p className="text-foreground/60">
              Finish in the top spots to claim your share of real money prize pools.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Campaigns Preview */}
      <section className="w-full bg-white/5 py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-black italic uppercase italic">Top Campaigns</h2>
            <Link href="/explore" className="text-primary font-bold flex items-center space-x-2">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-dark rounded-[2rem] overflow-hidden border-white/5 group hover:border-white/10 transition-all">
                <div className="aspect-video bg-white/5 relative">
                  <div className="absolute top-4 right-4 bg-gold text-gold-foreground text-xs font-black px-3 py-1 rounded-full">
                    $2,500 PRIZE
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h4 className="text-xl font-bold">Rolling Loud Miami 2025</h4>
                  <p className="text-sm text-foreground/60">Best front-row stage shots. Photos Only.</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs font-medium text-foreground/40">Ends in 2 days</span>
                    <button className="text-sm font-bold text-primary">Join Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
