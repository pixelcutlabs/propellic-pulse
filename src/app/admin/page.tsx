'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BrandShell from '@/components/BrandShell';
import EnpsGauge from '@/components/EnpsGauge';
import EnpsTrendChart from '@/components/EnpsTrendChart';
import DistributionChart from '@/components/DistributionChart';
import WordCloud from '@/components/WordCloud';
import { brand } from '@/lib/brand';

interface StatsData {
  summary: {
    totalResponses: number;
    enps: number;
    promoters: number;
    passives: number;
    detractors: number;
  };
  trend: Array<{
    month: string;
    enpsScore: number;
    responseCount: number;
  }>;
  distribution: {
    promoters: number;
    passives: number;
    detractors: number;
  };
  departments: Array<{
    id: string;
    name: string;
    responseCount: number;
    enpsScore: number;
  }>;
  textResponses: string[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<string>('all');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    fetchStats();
  }, [session, status, router, selectedCycle]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stats?cycle=${selectedCycle}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/export.csv?cycle=${selectedCycle}`);
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `propellic_pulse_${selectedCycle}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <BrandShell>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div 
            className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: brand.primary, borderTopColor: 'transparent' }}
          />
          <h2 className="text-xl font-semibold" style={{ color: brand.text }}>
            Loading Dashboard...
          </h2>
        </div>
      </BrandShell>
    );
  }

  if (!session) {
    return null; // Will redirect to sign in
  }

  return (
    <BrandShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: brand.text }}>
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Employee Net Promoter Score Analytics
            </p>
          </div>
          
          <div className="flex gap-4 items-center">
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              style={{ 
                borderColor: brand.secondary + '30'
              }}
            >
              <option value="all">All Time</option>
              {/* You can add specific cycle options here */}
            </select>
            
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ 
                backgroundColor: brand.primary, 
                color: brand.bg 
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-brand">
            <div className="text-2xl font-bold" style={{ color: brand.text }}>
              {stats?.summary.totalResponses || 0}
            </div>
            <div className="text-sm text-gray-600">Total Responses</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-brand">
            <div 
              className="text-2xl font-bold"
              style={{ color: (stats?.summary.enps ?? 0) >= 0 ? brand.success : brand.danger }}
            >
              {stats?.summary.enps || 0}
            </div>
            <div className="text-sm text-gray-600">eNPS Score</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-brand">
            <div className="text-2xl font-bold" style={{ color: brand.success }}>
              {stats?.summary.promoters || 0}
            </div>
            <div className="text-sm text-gray-600">Promoters</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-brand">
            <div className="text-2xl font-bold" style={{ color: brand.danger }}>
              {stats?.summary.detractors || 0}
            </div>
            <div className="text-sm text-gray-600">Detractors</div>
          </div>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* eNPS Gauge */}
          <div className="bg-white p-6 rounded-2xl shadow-brand">
            <h3 className="text-xl font-semibold mb-4" style={{ color: brand.text }}>
              Current eNPS
            </h3>
            <div className="flex justify-center">
              <EnpsGauge enpsScore={stats?.summary.enps || 0} />
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-brand">
            <DistributionChart 
              data={{
                promoters: stats?.distribution.promoters || 0,
                passives: stats?.distribution.passives || 0,
                detractors: stats?.distribution.detractors || 0,
              }}
            />
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-brand">
          <EnpsTrendChart 
            data={stats?.trend || []}
          />
        </div>

        {/* Department Breakdown */}
        {stats?.departments && stats.departments.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-brand">
            <h3 className="text-xl font-semibold mb-4" style={{ color: brand.text }}>
              Department Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: brand.tintLight }}>
                    <th className="text-left py-2" style={{ color: brand.text }}>Department</th>
                    <th className="text-center py-2" style={{ color: brand.text }}>Responses</th>
                    <th className="text-center py-2" style={{ color: brand.text }}>eNPS</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.departments.map((dept) => (
                    <tr key={dept.id} className="border-b" style={{ borderColor: brand.tintLight }}>
                      <td className="py-3" style={{ color: brand.text }}>{dept.name}</td>
                      <td className="text-center py-3" style={{ color: brand.text }}>{dept.responseCount}</td>
                      <td 
                        className="text-center py-3 font-semibold"
                        style={{ 
                          color: dept.enpsScore >= 0 ? brand.success : brand.danger 
                        }}
                      >
                        {dept.enpsScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Word Cloud */}
        <div className="bg-white p-6 rounded-2xl shadow-brand">
          <WordCloud responses={stats?.textResponses || []} />
        </div>
      </div>
    </BrandShell>
  );
}
