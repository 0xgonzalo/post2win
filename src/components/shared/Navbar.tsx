"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Trophy, PlusCircle, Search, User, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NavLinks = [
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Create Campaign", href: "/campaigns/create", icon: PlusCircle },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { data: session, status } = useSession(); // Added useSession hook

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6",
                scrolled ? "py-4" : "py-6"
            )}
        >
            <div
                className={cn(
                    "max-w-7xl mx-auto rounded-2xl transition-all duration-300",
                    scrolled
                        ? "glass-dark border-white/10 px-6 py-3"
                        : "bg-transparent px-0 py-0"
                )}
            >
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                            <Trophy className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gradient">
                            Rewards
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {NavLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors flex items-center space-x-2"
                            >
                                <link.icon className="w-4 h-4" />
                                <span>{link.name}</span>
                            </Link>
                        ))}
                        <div className="h-6 w-[1px] bg-white/10" />

                        {status === "authenticated" ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors text-foreground/70"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-sm font-medium px-4 py-2 rounded-xl border border-white/10 transition-all active:scale-95 text-foreground/70"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                                {session.user?.image && (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        className="w-8 h-8 rounded-full border border-primary/20"
                                    />
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-sm font-medium px-4 py-2 rounded-xl border border-white/10 transition-all active:scale-95"
                            >
                                <User className="w-4 h-4" />
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-foreground"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-24 left-6 right-6 md:hidden glass-dark rounded-3xl p-6 border-white/10"
                    >
                        <div className="flex flex-col space-y-4">
                            {NavLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center space-x-3 text-lg font-medium p-3 rounded-2xl hover:bg-white/5 transition-colors"
                                >
                                    <link.icon className="w-6 h-6 text-primary" />
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                            <div className="h-[1px] bg-white/10" />

                            {status === "authenticated" ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center space-x-3 text-lg font-medium p-3 rounded-2xl hover:bg-white/5 transition-colors"
                                    >
                                        <LayoutDashboard className="w-6 h-6 text-primary" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            signOut();
                                        }}
                                        className="flex items-center space-x-3 text-lg font-medium p-3 rounded-2xl hover:bg-white/5 transition-colors text-left"
                                    >
                                        <LogOut className="w-6 h-6 text-primary" />
                                        <span>Sign Out</span>
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center space-x-3 text-lg font-medium p-3 rounded-2xl bg-primary text-white text-center justify-center transition-all active:scale-95"
                                >
                                    <User className="w-5 h-5" />
                                    <span>Sign In</span>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
