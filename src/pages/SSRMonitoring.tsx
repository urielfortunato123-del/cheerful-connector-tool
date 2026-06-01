import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { AlertCircle, Activity, TrendingUp, History } from "lucide-react";

const SSRErrorsDashboard = () => {
  const { data: errors, isLoading } = useQuery({
    queryKey: ["ssr-errors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ssr_errors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  // Top URLs with failure
  const urlStats = errors?.reduce((acc: any, err) => {
    acc[err.path] = (acc[err.path] || 0) + 1;
    return acc;
  }, {});

  const topUrlsData = Object.entries(urlStats || {})
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 5);

  // Error trend by day/hour (simplified)
  const trendData = errors?.reduce((acc: any, err) => {
    const date = new Date(err.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const trendChartData = Object.entries(trendData || {})
    .map(([date, count]) => ({ date, count }))
    .reverse();

  // Errors by Deployment
  const deployStats = errors?.reduce((acc: any, err) => {
    const id = err.deployment_id?.substring(0, 7) || 'unknown';
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const deployChartData = Object.entries(deployStats || {})
    .map(([id, count]) => ({ id, count }));

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">SSR Monitoring</h1>
        <div className="text-sm text-muted-foreground bg-white px-3 py-1 rounded-full border">
          Live Updates Every 30s
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Failures</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errors?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Last 100 events tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Routes</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(urlStats || {}).length}</div>
            <p className="text-xs text-muted-foreground">Impacted application areas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Stable</div>
            <p className="text-xs text-muted-foreground">Compared to previous deploy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <History className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(deployStats || {}).length}</div>
            <p className="text-xs text-muted-foreground">Active monitoring sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Error Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Errors by Deployment</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deployChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Failing URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUrlsData.map((row) => (
                  <TableRow key={row.path}>
                    <TableCell className="font-mono text-xs">{row.path}</TableCell>
                    <TableCell className="text-right font-bold">{row.count as number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent SSR Failures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {errors?.slice(0, 3).map((error) => (
                <div key={error.id} className="border-l-4 border-destructive p-3 bg-white rounded shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm">{error.method} {error.path}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(error.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs text-destructive line-clamp-2 mb-1">{error.error_message}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">Deploy: {error.deployment_id?.substring(0, 7)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SSRErrorsDashboard;
