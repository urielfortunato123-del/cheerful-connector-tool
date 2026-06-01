import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-11 w-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="glass-card col-span-1 lg:col-span-8 border-white/5">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="h-[350px]">
            <Skeleton className="h-full w-full rounded-2xl" />
          </CardContent>
        </Card>
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <Card className="glass-card border-white/5 h-[180px]">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-10 w-24" />
              </div>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
          <Card className="glass-card border-white/5 h-[180px]">
             <CardContent className="p-6 space-y-4">
               <Skeleton className="h-6 w-32" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Card className="glass-card border-white/5">
        <CardContent className="p-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
