"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Trophy, Mail, Github, Chrome } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-dark p-8 rounded-[2.5rem] border-white/5 space-y-8 relative overflow-hidden"
            >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 blur-3xl -z-10" />

                <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                        <Trophy className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Welcome Back</h1>
                    <p className="text-foreground/60">Sign in to join active campaigns</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl bg-white text-black font-bold hover:bg-white/90 transition-all active:scale-[0.98]"
                    >
                        <Chrome className="w-5 h-5" />
                        <span>Continue with Google</span>
                    </button>

                    <button
                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all active:scale-[0.98]"
                    >
                        <Github className="w-5 h-5" />
                        <span>Continue with GitHub</span>
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0F0F1A] px-2 text-foreground/40">Or continue with</span>
                        </div>
                    </div>

                    <button
                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all active:scale-[0.98]"
                    >
                        <Mail className="w-5 h-5" />
                        <span>Sign in with Email</span>
                    </button>
                </div>

                <p className="text-center text-sm text-foreground/40">
                    By continuing, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">Terms</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
            </motion.div>
        </div>
    );
}
