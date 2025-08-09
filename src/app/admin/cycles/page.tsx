'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BrandShell from '@/components/BrandShell';
import { brand } from '@/lib/brand';

interface Cycle {
  id: string;
  year: number;
  month: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  questions: Array<{
    id: string;
    order: number;
    text: string;
  }>;
  _count: {
    responses: number;
  };
}

export default function CyclesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCycle, setNewCycle] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    startsAt: '',
    endsAt: '',
    questions: [
      { order: 1, text: 'What is the main reason for your score?' },
      { order: 2, text: 'What could we do to improve your experience at Propellic?' },
    ],
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    fetchCycles();
  }, [session, status, router]);

  const fetchCycles = async () => {
    try {
      const response = await fetch('/api/cycles');
      if (response.ok) {
        const data = await response.json();
        setCycles(data.cycles || []);
      }
    } catch (error) {
      console.error('Failed to fetch cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCycle),
      });

      if (response.ok) {
        await fetchCycles();
        setShowCreateForm(false);
        setNewCycle({
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          startsAt: '',
          endsAt: '',
          questions: [
            { order: 1, text: 'What is the main reason for your score?' },
            { order: 2, text: 'What could we do to improve your experience at Propellic?' },
          ],
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create cycle');
      }
    } catch (error) {
      console.error('Create cycle error:', error);
      alert('Failed to create cycle');
    }
  };

  const toggleCycleStatus = async (cycleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/cycles/${cycleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        await fetchCycles();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update cycle');
      }
    } catch (error) {
      console.error('Update cycle error:', error);
      alert('Failed to update cycle');
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
            Loading Cycles...
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: brand.text }}>
              Survey Cycles
            </h1>
            <p className="text-gray-600">
              Manage monthly survey cycles and questions
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{ 
              backgroundColor: brand.primary, 
              color: brand.bg 
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Cycle
          </button>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4" style={{ color: brand.text }}>
                Create New Survey Cycle
              </h2>
              
              <form onSubmit={handleCreateCycle} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: brand.text }}>
                      Year
                    </label>
                    <input
                      type="number"
                      value={newCycle.year}
                      onChange={(e) => setNewCycle({ ...newCycle, year: parseInt(e.target.value) })}
                      className="w-full p-3 border rounded-lg"
                      style={{ borderColor: brand.secondary + '30' }}
                      min="2020"
                      max="2100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: brand.text }}>
                      Month
                    </label>
                    <select
                      value={newCycle.month}
                      onChange={(e) => setNewCycle({ ...newCycle, month: parseInt(e.target.value) })}
                      className="w-full p-3 border rounded-lg"
                      style={{ borderColor: brand.secondary + '30' }}
                      required
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i).toLocaleDateString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: brand.text }}>
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={newCycle.startsAt}
                      onChange={(e) => setNewCycle({ ...newCycle, startsAt: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      style={{ borderColor: brand.secondary + '30' }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: brand.text }}>
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={newCycle.endsAt}
                      onChange={(e) => setNewCycle({ ...newCycle, endsAt: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      style={{ borderColor: brand.secondary + '30' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: brand.text }}>
                    Survey Questions
                  </label>
                  {newCycle.questions.map((question, index) => (
                    <div key={index} className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">
                        Question {question.order}
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) => {
                          const updated = [...newCycle.questions];
                          updated[index].text = e.target.value;
                          setNewCycle({ ...newCycle, questions: updated });
                        }}
                        className="w-full p-3 border rounded-lg"
                        style={{ borderColor: brand.secondary + '30' }}
                        rows={2}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                    style={{ 
                      backgroundColor: brand.primary, 
                      color: brand.bg 
                    }}
                  >
                    Create Cycle
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-3 border rounded-lg font-semibold transition-all hover:bg-gray-50"
                    style={{ borderColor: brand.secondary + '30', color: brand.text }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cycles List */}
        <div className="bg-white rounded-2xl shadow-brand overflow-hidden">
          {cycles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No survey cycles found. Create your first cycle to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b" style={{ borderColor: brand.tintLight, backgroundColor: brand.tintLight + '30' }}>
                  <tr>
                    <th className="text-left p-4" style={{ color: brand.text }}>Period</th>
                    <th className="text-center p-4" style={{ color: brand.text }}>Status</th>
                    <th className="text-center p-4" style={{ color: brand.text }}>Responses</th>
                    <th className="text-center p-4" style={{ color: brand.text }}>Questions</th>
                    <th className="text-center p-4" style={{ color: brand.text }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map((cycle) => (
                    <tr key={cycle.id} className="border-b" style={{ borderColor: brand.tintLight }}>
                      <td className="p-4">
                        <div>
                          <div className="font-semibold" style={{ color: brand.text }}>
                            {new Date(cycle.startsAt).toLocaleDateString('en-US', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(cycle.startsAt).toLocaleDateString()} - {new Date(cycle.endsAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            cycle.isActive ? 'text-green-800 bg-green-100' : 'text-gray-600 bg-gray-100'
                          }`}
                        >
                          {cycle.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-center p-4" style={{ color: brand.text }}>
                        {cycle._count.responses}
                      </td>
                      <td className="text-center p-4" style={{ color: brand.text }}>
                        {cycle.questions.length}
                      </td>
                      <td className="text-center p-4">
                        <button
                          onClick={() => toggleCycleStatus(cycle.id, cycle.isActive)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                            cycle.isActive 
                              ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {cycle.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </BrandShell>
  );
}
