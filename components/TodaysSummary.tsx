"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Plus, X } from "lucide-react";

export default function TodaysSummary() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Log workout", completed: true },
    { id: 2, title: "Hit protein goal (165g)", completed: false },
    { id: 3, title: "Drink 3L water", completed: false },
    { id: 4, title: "8h+ sleep", completed: false },
  ]);
  const [newTask, setNewTask] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  function toggleTask(id: number) {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function addTask() {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }]);
      setNewTask("");
      setShowAddTask(false);
    }
  }

  function deleteTask(id: number) {
    setTasks(tasks.filter(t => t.id !== id));
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Today's Mission</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-muted">
            {completedCount}/{tasks.length} complete
          </span>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 bg-surface rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-positive"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* Add task input */}
      {showAddTask && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 flex gap-2"
        >
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 bg-surface border border-white/10 rounded-lg focus:outline-none focus:border-primary"
            autoFocus
          />
          <button
            onClick={addTask}
            className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-light transition-colors"
          >
            Add
          </button>
        </motion.div>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 p-3 bg-surface/50 rounded-lg hover:bg-surface transition-all group"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="flex items-center gap-3 flex-1 cursor-pointer"
            >
              {task.completed ? (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              ) : (
                <Circle className="w-6 h-6 text-muted" />
              )}
              <span
                className={`flex-1 text-left ${
                  task.completed ? "line-through text-muted" : ""
                }`}
              >
                {task.title}
              </span>
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-negative/20 rounded transition-all"
            >
              <X className="w-4 h-4 text-negative" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
