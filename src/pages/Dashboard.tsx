import React, { useContext, useEffect, useState } from 'react';
import StatCard from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Package, 
  Database, 
  Archive, 
  Users, 
  TrendingUp,
  Building2,
  Zap,
  Wrench,
  HelpCircle,
  BarChart2,
  Activity
} from 'lucide-react';
import UserDetailsContext from '@/hooks/UserDetailsContext';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface VendorTypeCounts {
  [key: string]: number;
}

interface DashboardSummary {
  TotalVendors: number;
  VendorTypeCounts: VendorTypeCounts;
  RecentActivity?: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard: React.FC = () => {
  const userDetails = useContext(UserDetailsContext);

  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'vendors' | 'activity'>('vendors');

  const businessID = String(userDetails?.userDetails?.BusinessID || '');
  const teamContactID = String(userDetails?.userDetails?.TeamContactID);
  const userRole = userDetails?.userDetails?.UserRole;
  const isOwner = userRole === 'owner';

  // Prepare data for charts
  const prepareChartData = () => {
    if (!dashboardSummary?.VendorTypeCounts) return [];
    
    return Object.entries(dashboardSummary.VendorTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  };

  const chartData = prepareChartData();
  const hasData = chartData.length > 0;

  // Icon mapping for different vendor types
  const getVendorIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'aurumi servi': <Wrench className="h-4 w-4" />,
      'ac service': <Zap className="h-4 w-4" />,
      'electric service': <Zap className="h-4 w-4" />,
      'sandeep services': <Building2 className="h-4 w-4" />,
      'wood service': <Package className="h-4 w-4" />,
      'unknown': <HelpCircle className="h-4 w-4" />
    };
    return iconMap[type.toLowerCase()] || <Building2 className="h-4 w-4" />;
  };

  // Color mapping for different vendor types
  const getVendorColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'aurumi servi': 'bg-blue-100 text-blue-800 border-blue-200',
      'ac service': 'bg-green-100 text-green-800 border-green-200',
      'electric service': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'sandeep services': 'bg-purple-100 text-purple-800 border-purple-200',
      'wood service': 'bg-orange-100 text-orange-800 border-orange-200',
      'unknown': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[type.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const fetchSummaries = async () => {
    if (!businessID) {
      setError('Invalid BusinessID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseUrl = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}`;
      const commonPayload = {
        BusinessID: businessID,
        ...(isOwner ? {} : { TeamContactID: teamContactID }),
      };

      const vendorsRes = await axios.post(`${baseUrl}/purchases/GetVendorsList`, commonPayload);
      const vendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : [];

      // Group by VendorType
      const vendorTypeCounts: VendorTypeCounts = {};
      vendors.forEach(vendor => {
        const type = vendor.VendorType || "Unknown";
        vendorTypeCounts[type] = (vendorTypeCounts[type] || 0) + 1;
      });

      // Mock recent activity - replace with actual API call if available
      const recentActivity = vendors.slice(0, 5).map(vendor => ({
        id: vendor.ContactID,
        name: vendor.CompanyName || vendor.ContactPerson || 'Unknown Vendor',
        type: vendor.VendorType || 'Unknown',
        date: new Date().toISOString().split('T')[0],
        action: 'Added'
      }));

      setDashboardSummary({
        TotalVendors: vendors.length,
        VendorTypeCounts: vendorTypeCounts,
        RecentActivity: recentActivity
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userDetails?.userDetails?.BusinessID) {
      fetchSummaries();
    }
  }, [userDetails?.userDetails?.BusinessID]);

  const renderLoadingState = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-6 w-[80px]" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-[150px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-8 mx-auto rounded-full" />
              <Skeleton className="h-4 w-[200px] mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderErrorState = () => (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 text-red-600">
          <HelpCircle className="h-5 w-5" />
          <p className="font-medium">{error}</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderVendorPieChart = () => (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} vendors`, 'Count']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderVendorBarChart = () => (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip 
            formatter={(value) => [`${value} vendors`, 'Count']}
          />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" name="Vendors">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderActivityTimeline = () => {
    if (!dashboardSummary?.RecentActivity?.length) {
      return (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">No recent activity found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {dashboardSummary.RecentActivity.map((activity, index) => (
          <div key={index} className="flex items-start pb-4 last:pb-0">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
              {index !== dashboardSummary.RecentActivity.length - 1 && (
                <div className="absolute left-0.5 top-5 h-full w-px bg-gray-200"></div>
              )}
            </div>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {activity.type} • {activity.action} on {activity.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDashboardStats = () => {
    if (!dashboardSummary) return null;

    const stats = [
      {
        title: "Total Vendors",
        value: dashboardSummary.TotalVendors,
        icon: <Users className="h-4 w-4" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        trend: "up"
      },
      {
        title: "Vendor Types",
        value: Object.keys(dashboardSummary.VendorTypeCounts).length,
        icon: <Package className="h-4 w-4" />,
        color: "text-green-600",
        bgColor: "bg-green-100",
        trend: "neutral"
      },
      {
        title: "Active Services",
        value: dashboardSummary.TotalVendors, // Modify with actual data if available
        icon: <TrendingUp className="h-4 w-4" />,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        trend: "up"
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs mt-1 flex items-center">
                    {stat.trend === 'up' ? (
                      <span className="text-green-500">↑ 12% from last month</span>
                    ) : stat.trend === 'down' ? (
                      <span className="text-red-500">↓ 5% from last month</span>
                    ) : (
                      <span className="text-gray-500">No change</span>
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return renderLoadingState();
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's an overview of your vendor management.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {isOwner ? 'Owner' : 'Team Member'}
          </Badge>
        </div>
      </div>

      {/* Error State */}
      {error && renderErrorState()}

      {/* Dashboard Stats */}
      {!error && renderDashboardStats()}

      {/* Tabs */}
      {!error && (
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'vendors' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('vendors')}
          >
            <PieChart className="h-4 w-4" />
            <span>Vendor Analytics</span>
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'activity' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity className="h-4 w-4" />
            <span>Recent Activity</span>
          </button>
        </div>
      )}

      {/* Tab Content */}
      {!error && activeTab === 'vendors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-x-auto max-w-full">
          <Card className="min-w-[320px]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Vendor Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasData ? (
                <div className="w-full max-w-full overflow-x-auto">
                  {renderVendorPieChart()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No vendor data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="min-w-[320px]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <BarChart2 className="h-5 w-5" />
                <span>Vendor Comparison</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasData ? (
                <div className="w-full max-w-full overflow-x-auto">
                  {renderVendorBarChart()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No vendor data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!error && activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Vendor Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderActivityTimeline()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;