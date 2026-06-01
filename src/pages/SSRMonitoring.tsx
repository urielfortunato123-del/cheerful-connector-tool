import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { AlertCircle, Activity, TrendingUp, History, Bell, Settings, BellOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

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

  const { data: alerts, refetch: refetchAlerts } = useQuery({
    queryKey: ["ssr-alerts-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alert_settings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: history } = useQuery({
    queryKey: ["ssr-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ssr_error_notifications")
        .select("*, alert_settings(alert_name)")
        .order("sent_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const updateThreshold = async (id: string, count: number) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("alert_settings")
        .update({ threshold_count: count })
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Threshold updated successfully");
      refetchAlerts();
    } catch (err: any) {
      toast.error("Failed to update threshold: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleAlert = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("alert_settings")
        .update({ is_enabled: enabled })
        .eq("id", id);
      
      if (error) throw error;
      toast.success(enabled ? "Alert enabled" : "Alert disabled");
      refetchAlerts();
    } catch (err: any) {
      toast.error("Failed to toggle alert: " + err.message);
    }
  };

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
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">SSR Monitoring</h1>
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full border">
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
                <div key={error.id} className="border-l-4 border-destructive p-3 bg-card rounded shadow-sm">
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Alert Configuration
                </CardTitle>
                <CardDescription>Configure error thresholds for notifications</CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50/10 text-blue-500 border-blue-200/20">
                System Managed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {alerts?.map((alert) => (
                <div key={alert.id} className="flex flex-col space-y-3 p-4 border rounded-lg bg-card shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{alert.alert_name}</span>
                    <Button 
                      variant={alert.is_enabled ? "outline" : "secondary"} 
                      size="sm"
                      onClick={() => toggleAlert(alert.id, !alert.is_enabled)}
                    >
                      {alert.is_enabled ? (
                        <><Bell className="h-4 w-4 mr-2 text-green-500" /> Enabled</>
                      ) : (
                        <><BellOff className="h-4 w-4 mr-2 text-muted-foreground" /> Disabled</>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground block mb-1">
                        Threshold (Errors in {alert.time_window_minutes}m)
                      </label>
                      <Input 
                        type="number" 
                        defaultValue={alert.threshold_count}
                        className="h-9"
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (val !== alert.threshold_count) updateThreshold(alert.id, val);
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground block mb-1">Status</label>
                      <div className="pt-2">
                        {alert.is_enabled ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Monitoring</Badge>
                        ) : (
                          <Badge variant="secondary">Idle</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!alerts?.length && (
                <div className="text-center py-6 text-muted-foreground italic">
                  No alert configurations found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Alert History
            </CardTitle>
            <CardDescription>Last triggered alerts based on thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history?.map((notif) => (
                <div key={notif.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-red-500/10 p-1.5 rounded-full">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{notif.alert_settings?.alert_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {notif.error_count} errors detected
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">{notif.sent_at ? new Date(notif.sent_at).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-[10px] text-muted-foreground">{notif.sent_at ? new Date(notif.sent_at).toLocaleTimeString() : ''}</div>
                  </div>
                </div>
              ))}
              {!history?.length && (
                <div className="text-center py-10 text-muted-foreground">
                  No alerts have been triggered yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SSRErrorsDashboard;
