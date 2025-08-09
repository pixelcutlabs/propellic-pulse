'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BrandShell from '@/components/BrandShell';
import { brand } from '@/lib/brand';

interface Department {
  id: string;
  name: string;
  _count: {
    responses: number;
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    fetchDepartments();
  }, [session, status, router]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDepartmentName.trim()) return;
    
    setCreating(true);
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDepartmentName.trim() }),
      });

      if (response.ok) {
        await fetchDepartments();
        setNewDepartmentName('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create department');
      }
    } catch (error) {
      console.error('Create department error:', error);
      alert('Failed to create department');
    } finally {
      setCreating(false);
    }
  };

  const handleExportAllData = async () => {
    try {
      const response = await fetch('/api/export.csv?cycle=all');
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `propellic_pulse_all_data_${new Date().toISOString().split('T')[0]}.csv`;
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
            Loading Settings...
          </h2>
        </div>
      </BrandShell>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <BrandShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: brand.text }}>
            Settings
          </h1>
          <p className="text-gray-600">
            Manage departments and export data
          </p>
        </div>

        {/* Department Management */}
        <div className="bg-white rounded-2xl p-6 shadow-brand">
          <h2 className="text-xl font-semibold mb-4" style={{ color: brand.text }}>
            Department Management
          </h2>
          
          {/* Create Department Form */}
          <form onSubmit={handleCreateDepartment} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="Department name"
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: brand.secondary + '30'
                }}
                required
              />
              <button
                type="submit"
                disabled={creating || !newDepartmentName.trim()}
                className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: brand.primary, 
                  color: brand.bg 
                }}
              >
                {creating ? 'Adding...' : 'Add Department'}
              </button>
            </div>
          </form>

          {/* Departments List */}
          <div className="space-y-3">
            {departments.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                No departments found. Add your first department above.
              </p>
            ) : (
              departments.map((department) => (
                <div 
                  key={department.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                  style={{ borderColor: brand.tintLight }}
                >
                  <div>
                    <div className="font-medium" style={{ color: brand.text }}>
                      {department.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {department._count.responses} responses
                    </div>
                  </div>
                  
                  {/* You could add edit/delete buttons here if needed */}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-white rounded-2xl p-6 shadow-brand">
          <h2 className="text-xl font-semibold mb-4" style={{ color: brand.text }}>
            Data Export
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg" style={{ borderColor: brand.tintLight }}>
              <h3 className="font-medium mb-2" style={{ color: brand.text }}>
                Export All Survey Data
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Download a CSV file containing all survey responses, including eNPS scores, 
                text responses, department information, and submission dates.
              </p>
              <button
                onClick={handleExportAllData}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{ 
                  backgroundColor: brand.primary, 
                  color: brand.bg 
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export All Data
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl p-6 shadow-brand">
          <h2 className="text-xl font-semibold mb-4" style={{ color: brand.text }}>
            Navigation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-3 p-4 border rounded-lg text-left transition-all hover:bg-gray-50"
              style={{ borderColor: brand.tintLight }}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: brand.tintLight }}
              >
                <svg className="w-5 h-5" style={{ color: brand.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium" style={{ color: brand.text }}>Dashboard</div>
                <div className="text-sm text-gray-500">View analytics and charts</div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/cycles')}
              className="flex items-center gap-3 p-4 border rounded-lg text-left transition-all hover:bg-gray-50"
              style={{ borderColor: brand.tintLight }}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: brand.tintLight }}
              >
                <svg className="w-5 h-5" style={{ color: brand.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium" style={{ color: brand.text }}>Survey Cycles</div>
                <div className="text-sm text-gray-500">Manage survey periods and questions</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </BrandShell>
  );
}
