"use client";

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 bg-surface rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-surface rounded"></div>
        <div className="h-4 bg-surface rounded w-5/6"></div>
        <div className="h-4 bg-surface rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 bg-surface rounded-full"></div>
        <div className="flex-1 ml-4">
          <div className="h-4 bg-surface rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-surface rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

export function WorkoutHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-surface rounded w-1/4"></div>
            <div className="h-4 bg-surface rounded w-1/6"></div>
          </div>
          <div className="space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="bg-surface/50 p-3 rounded-lg">
                <div className="h-4 bg-surface rounded w-1/3 mb-3"></div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((k) => (
                    <div key={k} className="h-8 bg-surface rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="card-elevated p-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="w-48 h-48 rounded-full bg-surface animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse h-32"></div>
        ))}
      </div>
      <CardSkeleton />
    </div>
  );
}
