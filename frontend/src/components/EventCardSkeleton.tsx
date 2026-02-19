export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 glass">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl skeleton" />
        <div className="flex-1">
          <div className="h-4 w-3/4 skeleton mb-2" />
          <div className="h-3 w-1/2 skeleton" />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-20 rounded-full skeleton" />
      </div>
      <div className="h-3 w-full skeleton mb-2" />
      <div className="h-3 w-2/3 skeleton mb-3" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-20 skeleton" />
          <div className="h-3 w-16 skeleton" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full skeleton" />
          <div className="h-3 w-12 skeleton" />
        </div>
      </div>
    </div>
  );
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}
