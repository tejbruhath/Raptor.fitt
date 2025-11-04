import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background raptor-pattern flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold font-mono gradient-text mb-4">404</h1>
        <h2 className="text-3xl font-heading font-bold mb-2">Page Not Found</h2>
        <p className="text-muted mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 btn-primary"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
