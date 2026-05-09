import Skeleton from "./Skeleton";

export function AnalyticSkeleton() {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm h-48 flex flex-col justify-between">
      <div className="flex justify-between">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-24 h-3 rounded-full" />
        <Skeleton className="w-32 h-8 rounded-full" />
      </div>
      <div className="flex justify-between items-end">
        <Skeleton className="w-32 h-10 rounded-xl" />
        <Skeleton className="w-16 h-3 rounded-full" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <Skeleton className="w-full h-48 rounded-2xl" />
      <div className="space-y-3 px-2">
        <Skeleton className="w-3/4 h-5 rounded-full" />
        <Skeleton className="w-1/2 h-3 rounded-full" />
        <div className="flex space-x-2 pt-2">
          <Skeleton className="w-12 h-6 rounded-full" />
          <Skeleton className="w-12 h-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}
