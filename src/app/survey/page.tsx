'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BrandShell from '@/components/BrandShell';
import SurveyForm from '@/components/SurveyForm';
import { brand } from '@/lib/brand';

interface Cycle {
  id: string;
  year: number;
  month: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  questions: {
    id: string;
    order: number;
    text: string;
  }[];
}

interface Department {
  id: string;
  name: string;
}

export default function SurveyPage() {
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active cycle and departments
        const [cyclesRes, depsRes] = await Promise.all([
          fetch('/api/cycles'),
          fetch('/api/departments'),
        ]);

        if (!cyclesRes.ok || !depsRes.ok) {
          throw new Error('Failed to fetch survey data');
        }

        const cyclesData = await cyclesRes.json();
        const depsData = await depsRes.json();

        // Find the active cycle
        const activeCycle = cyclesData.cycles?.find((c: Cycle) => c.isActive);
        
        if (!activeCycle) {
          setError('No active survey cycle found. Please check back later.');
          return;
        }

        // Check if cycle is within date range
        const now = new Date();
        const startDate = new Date(activeCycle.startsAt);
        const endDate = new Date(activeCycle.endsAt);

        if (now < startDate || now > endDate) {
          setError('The survey cycle is not currently open. Please check back during the active period.');
          return;
        }

        setCycle(activeCycle);
        setDepartments(depsData.departments || []);
      } catch (err) {
        console.error('Failed to fetch survey data:', err);
        setError('Failed to load survey. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (data: {
    enpsScore: number;
    answers: string[];
    name?: string;
    departmentId?: string;
    honeypot?: string;
  }) => {
    if (!cycle) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cycleId: cycle.id,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit survey');
      }

      // Success - the SurveyForm component will handle the success state
    } catch (err) {
      console.error('Submission error:', err);
      throw err; // Re-throw so SurveyForm can handle it
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <BrandShell>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div 
            className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: brand.primary, borderTopColor: 'transparent' }}
          />
          <h2 className="text-xl font-semibold" style={{ color: brand.text }}>
            Loading Survey...
          </h2>
        </div>
      </BrandShell>
    );
  }

  if (error) {
    return (
      <BrandShell>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: brand.warning + '20' }}
          >
            <svg className="w-8 h-8" style={{ color: brand.warning }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: brand.text }}>
            Survey Not Available
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{ 
              backgroundColor: brand.primary, 
              color: brand.bg 
            }}
          >
            Go Back Home
          </button>
        </div>
      </BrandShell>
    );
  }

  if (!cycle) {
    return (
      <BrandShell>
        <div className="max-w-2xl mx-auto text-center py-16">
          <h2 className="text-2xl font-bold mb-2" style={{ color: brand.text }}>
            Survey Not Found
          </h2>
          <p className="text-gray-600">
            Unable to load the survey. Please try again later.
          </p>
        </div>
      </BrandShell>
    );
  }

  return (
    <BrandShell>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: brand.text }}>
            Monthly Pulse Survey
          </h1>
          <p className="text-gray-600">
            {new Date(cycle.startsAt).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })} Survey
          </p>
        </div>

        {/* Survey Form */}
        <div className="bg-white rounded-2xl p-8 shadow-brand">
          <SurveyForm
            cycleId={cycle.id}
            questions={cycle.questions}
            departments={departments}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Your responses are confidential and help us improve the Propellic experience.
          </p>
        </div>
      </div>
    </BrandShell>
  );
}
