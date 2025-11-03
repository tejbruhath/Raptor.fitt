"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, TrendingUp, Brain, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen raptor-pattern">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-block">
              <h1 className="text-7xl md:text-9xl font-heading font-bold gradient-text mb-4">
                RAPTOR
              </h1>
              <div className="text-2xl md:text-3xl font-mono text-primary tracking-widest">
                .fitt
              </div>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-2xl md:text-4xl font-heading text-muted mb-4"
          >
            Hunt Your Potential
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg md:text-xl text-muted/70 mb-12 max-w-2xl mx-auto"
          >
            The Intelligence Layer for Your Body
            <br />
            <span className="text-primary">Track. Train. Transform.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
              Enter the Den →
            </Link>
            <Link href="/auth/signin" className="btn-ghost text-lg px-8 py-4">
              Sign In
            </Link>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            <FeatureCard
              icon={<Activity className="w-8 h-8" />}
              title="Smart Tracking"
              description="Adaptive workout logging"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Strength Index"
              description="Unified power metric"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI Coach"
              description="Contextual insights"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Predictions"
              description="Growth modeling"
            />
          </motion.div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-surface/50">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-heading font-bold text-center mb-16"
          >
            The first app that{" "}
            <span className="gradient-text">doesn't just track</span> —{" "}
            <span className="text-primary">it thinks</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            <DifferenceCard
              title="Not a Spreadsheet"
              description="We model you as a system — connecting training, nutrition, recovery, and adaptation into a predictive feedback loop."
              gradient="from-primary to-positive"
            />
            <DifferenceCard
              title="Truly Intelligent"
              description="AI that knows YOUR patterns. Not generic advice — insights based on your unique physiology and training response."
              gradient="from-secondary to-accent"
            />
            <DifferenceCard
              title="Brutally Honest"
              description="No toxic positivity. Just data and truth. We'll tell you exactly why you're plateauing and how to fix it."
              gradient="from-accent to-warning"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 text-center text-muted border-t border-white/5">
        <p className="font-mono">
          Built for discipline. Designed for obsessives.
        </p>
        <p className="mt-2 text-sm">
          © 2024 Raptor.fitt — Open source & community-driven
        </p>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="card text-center hover:border-primary/50"
    >
      <div className="text-primary mb-3 flex justify-center">{icon}</div>
      <h3 className="font-heading font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </motion.div>
  );
}

function DifferenceCard({
  title,
  description,
  gradient,
}: {
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card-elevated group"
    >
      <div
        className={`w-full h-1 bg-gradient-to-r ${gradient} rounded-full mb-6`}
      />
      <h3 className="text-2xl font-heading font-bold mb-4 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted leading-relaxed">{description}</p>
    </motion.div>
  );
}
