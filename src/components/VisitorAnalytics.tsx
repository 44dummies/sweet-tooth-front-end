import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, Clock, MousePointer } from "lucide-react";

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  totalPageViews: number;
  avgDuration: number;
}

interface PageStat {
  page_url: string;
  views: number;
}

interface DeviceStat {
  device_type: string;
  count: number;
}

const VisitorAnalytics = () => {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    totalPageViews: 0,
    avgDuration: 0,
  });
  const [topPages, setTopPages] = useState<PageStat[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStat[]>([]);
  const [recentVisitors, setRecentVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { count: totalVisitors } = await supabase
        .from('visitor_logs')
        .select('visitor_id', { count: 'exact', head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayVisitors } = await supabase
        .from('visitor_logs')
        .select('visitor_id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      const { count: totalPageViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true });

      const { data: durationData } = await supabase
        .from('visitor_logs')
        .select('visit_duration')
        .not('visit_duration', 'is', null);

      const avgDuration = durationData && durationData.length > 0
        ? durationData.reduce((sum, item) => sum + (item.visit_duration || 0), 0) / durationData.length
        : 0;

      const { data: pagesData } = await supabase
        .from('page_views')
        .select('page_url')
        .order('created_at', { ascending: false })
        .limit(100);

      if (pagesData) {
        const pageCounts = pagesData.reduce((acc: any, item) => {
          acc[item.page_url] = (acc[item.page_url] || 0) + 1;
          return acc;
        }, {});

        const topPagesArray = Object.entries(pageCounts)
          .map(([page_url, count]) => ({ page_url, views: count as number }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        setTopPages(topPagesArray);
      }

      const { data: devicesData } = await supabase
        .from('visitor_logs')
        .select('device_type')
        .order('created_at', { ascending: false })
        .limit(100);

      if (devicesData) {
        const deviceCounts = devicesData.reduce((acc: any, item) => {
          acc[item.device_type] = (acc[item.device_type] || 0) + 1;
          return acc;
        }, {});

        const deviceArray = Object.entries(deviceCounts)
          .map(([device_type, count]) => ({ device_type, count: count as number }))
          .sort((a, b) => b.count - a.count);

        setDeviceStats(deviceArray);
      }

      const { data: recentData } = await supabase
        .from('visitor_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentVisitors(recentData || []);

      setStats({
        totalVisitors: totalVisitors || 0,
        todayVisitors: todayVisitors || 0,
        totalPageViews: totalPageViews || 0,
        avgDuration: Math.round(avgDuration),
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return <div className="p-6 text-center">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisitors}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayVisitors}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <MousePointer className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPageViews}</div>
            <p className="text-xs text-muted-foreground mt-1">Total clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Visit Duration</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per session</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{page.page_url || '/'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">{page.views} views</div>
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(page.views / (topPages[0]?.views || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceStats.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{device.device_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">{device.count} visits</div>
                    <div className="w-24 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(device.count / (deviceStats[0]?.count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-3 font-medium">Device</th>
                  <th className="text-left p-3 font-medium">Browser</th>
                  <th className="text-left p-3 font-medium">OS</th>
                  <th className="text-left p-3 font-medium">Page</th>
                  <th className="text-left p-3 font-medium">Referrer</th>
                  <th className="text-left p-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentVisitors.map((visitor) => (
                  <tr key={visitor.id} className="border-b hover:bg-secondary/20">
                    <td className="p-3 capitalize">{visitor.device_type}</td>
                    <td className="p-3">{visitor.browser}</td>
                    <td className="p-3">{visitor.os}</td>
                    <td className="p-3 text-sm">{visitor.page_url}</td>
                    <td className="p-3 text-sm truncate max-w-xs">{visitor.referrer}</td>
                    <td className="p-3 text-sm">
                      {new Date(visitor.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitorAnalytics;
