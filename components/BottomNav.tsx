"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Plus, Bot, BarChart3, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home", position: "side", dataTour: "" },
    { href: "/log", icon: Plus, label: "Log", position: "side", dataTour: "nav-log" },
    { href: "/chat", icon: Bot, label: "AI Coach", position: "center", dataTour: "nav-ai" },
    { href: "/analytics", icon: BarChart3, label: "Stats", position: "side", dataTour: "nav-stats" },
    { href: "/profile", icon: User, label: "User", position: "side", dataTour: "" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 backdrop-blur-xl z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex justify-around items-end">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isCenter = item.position === "center";
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                data-tour={item.dataTour}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all relative ${
                  isCenter
                    ? isActive
                      ? "text-background bg-primary shadow-lg shadow-primary/50 -translate-y-2"
                      : "text-background bg-gradient-to-br from-primary to-purple-500 shadow-lg shadow-primary/30 -translate-y-2 hover:shadow-primary/50"
                    : isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted hover:text-white"
                }`}
              >
                {isCenter && !isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-purple-500 opacity-75"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                <Icon className={`${isCenter ? "w-6 h-6" : "w-5 h-5"} relative z-10`} />
                <span className={`${isCenter ? "text-xs font-bold" : "text-xs font-medium"} relative z-10`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
