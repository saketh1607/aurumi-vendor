import React, { useContext, useEffect, useState } from 'react';
import StatCard from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package, Database, Archive } from 'lucide-react';
import UserDetailsContext from '@/hooks/UserDetailsContext';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const userDetails = useContext(UserDetailsContext);

  const [poSummary, setPoSummary] = useState<any[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<any | null>(null);
  const [reqSummaryByUser, setReqSummaryByUser] = useState<Record<string, Record<string, number>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const businessID = String(userDetails?.userDetails?.BusinessID || '');
  const teamContactID = String(userDetails?.userDetails?.TeamContactID);
  const userRole = userDetails?.userDetails?.UserRole;
  const isOwner = userRole === 'owner';
  console.log("userDetails 123 abc", userDetails?.userDetails?.BusinessID);

  const fetchSummaries = async () => {
    if (!businessID) {
      setError('Invalid BusinessID');
      return;
    }

    setLoading(true);

    try {
      const baseUrl = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PORTNO}`;
      const commonPayload = {
        BusinessID: businessID,
        ...(isOwner ? {} : { TeamContactID: teamContactID }),
      };

      const vendorsRes = await axios.post(`${baseUrl}/purchases/GetVendorsList`, commonPayload);
      const vendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : [];

      // Group by VendorType
      const vendorTypeCounts: Record<string, number> = {};
      vendors.forEach(vendor => {
        const type = vendor.VendorType || "Unknown";
        vendorTypeCounts[type] = (vendorTypeCounts[type] || 0) + 1;
      });

      setDashboardSummary({
        TotalVendors: vendors.length,
        VendorTypeCounts: vendorTypeCounts,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  console.log("Effect ran, businessID:", userDetails?.userDetails?.BusinessID);
  if (userDetails?.userDetails?.BusinessID) {
    fetchSummaries();
  }
}, [userDetails?.userDetails?.BusinessID]);

  const selfReqCount = isOwner
    ? Object.values(reqSummaryByUser?.[teamContactID] || {}).reduce((sum, val) => sum + val, 0)
    : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-lg font-medium text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4"> */}
        {/* <StatCard
          title="Total vendors"
          value={dashboardSummary?.TotalVendors ?? 0}
          icon={<FileText />}
        /> */}
{/* 
        {dashboardSummary?.VendorTypeCounts && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(dashboardSummary.VendorTypeCounts).map(([type, count]) => (
              <StatCard
                key={type}
                title={`Type: ${type}`}
                value={count}
                icon={<Package />}
              />
            ))}
          </div>
        )} */}
        
      {/* </div> */}

      {/* Requisition and PO Summary */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {/* Requisition Summary */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-lg">Requisition Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : Object.keys(reqSummaryByUser).length === 0 ? (
              <p className="text-muted-foreground text-sm">No data found</p>
            ) : isOwner ? (
              (() => {
                const totalStatusCounts: Record<string, number> = {};
                Object.values(reqSummaryByUser).forEach(userStatuses => {
                  Object.entries(userStatuses).forEach(([status, count]) => {
                    totalStatusCounts[status] = (totalStatusCounts[status] || 0) + count;
                  });
                });
                return (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(totalStatusCounts).map(([status, count]) => (
                      <div key={status} className="flex text-sm">
                        <span className="w-32 capitalize">{status}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              Object.entries(reqSummaryByUser).map(([_, statuses]) => (
                <div key={teamContactID} className="mb-4">
                  <div className="grid grid-cols-2 gap-2 pl-4">
                    {Object.entries(statuses).map(([status, count]) => (
                      <div key={status} className="flex text">
                        <span className="w-32 capitalize">{status}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card> */}

        {/* Purchase Order Summary */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-lg">Purchase Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : poSummary.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data found</p>
            ) : isOwner ? (
              (() => {
                const statusCounts: Record<string, number> = {};
                poSummary.forEach((item: any) => {
                  const status = item.Status;
                  statusCounts[status] = (statusCounts[status] || 0) + (item.RecordCount || 0);
                });
                return (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <div key={status} className="flex text-sm">
                        <span className="w-32 capitalize">{status}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              poSummary
                .filter(po => String(po.CreatedBy) === teamContactID)
                .map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <span className="w-32 capitalize">{item.Status}</span>
                      <span className="font-medium">{item.RecordCount}</span>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card> */}

        {/* Vendor Type Summary */}
        <Card>
  <CardHeader>
    <CardTitle className="text-lg">Vendor Type Summary</CardTitle>
  </CardHeader>
  <CardContent>
    {error ? (
      <p className="text-red-500 text-sm">{error}</p>
    ) : !dashboardSummary?.VendorTypeCounts || Object.keys(dashboardSummary.VendorTypeCounts).length === 0 ? (
      <p className="text-muted-foreground text-sm">No data found</p>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(dashboardSummary.VendorTypeCounts).map(([type, count]) => (
          <div key={type} className="flex text-sm">
            <span className="w-32 capitalize">{type}</span>
            <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold whitespace-nowrap">
  {count}
</span>

          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>
      </div>
    </div>
  );
};

export default Dashboard;
