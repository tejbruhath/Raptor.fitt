"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Templates() {
  const { data: session } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    if (session?.user?.id) {
      fetchTemplates();
    }
  }, [session]);

  async function fetchTemplates() {
    try {
      const res = await fetch(`/api/templates?userId=${session?.user?.id}`);
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;

    try {
      const res = await fetch(`/api/templates?id=${id}&userId=${session?.user?.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        success("Template deleted");
        fetchTemplates();
      } else {
        error("Failed to delete template");
      }
    } catch (err) {
      error("Error deleting template");
    }
  }

  async function useTemplate(template: any) {
    // Store template in localStorage for workout logger to pick up
    localStorage.setItem("workout-template", JSON.stringify(template.exercises));
    router.push("/workout/log");
    success(`Using template: ${template.name}`);
  }

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-primary hover:text-primary-light">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold">Workout Templates</h1>
          <Link href="/templates/create" className="btn-primary text-sm px-4 py-2">
            <Plus className="w-4 h-4 inline mr-2" />
            New
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {templates.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-2">No Templates Yet</h2>
            <p className="text-muted mb-6">Create templates to save time logging workouts</p>
            <Link href="/templates/create" className="btn-primary inline-block">
              Create First Template
            </Link>
          </div>
        ) : (
          templates.map((template, idx) => (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-bold mb-1">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-muted">{template.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {template.tags.map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => useTemplate(template)}
                    className="p-2 hover:bg-primary/10 rounded transition-colors"
                    title="Use template"
                  >
                    <Copy className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template._id)}
                    className="p-2 hover:bg-negative/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-negative" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted uppercase">Exercises:</p>
                {template.exercises.map((ex: any, exIdx: number) => (
                  <div key={exIdx} className="bg-surface/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{ex.name}</span>
                      <span className="text-xs text-muted capitalize">{ex.muscleGroup}</span>
                    </div>
                    <p className="text-xs text-muted mt-1">{ex.sets.length} sets</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted mt-4">Used {template.usageCount || 0} times</p>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
}
