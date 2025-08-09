'use client';

import { useState } from 'react';
import { brand } from '@/lib/brand';

interface Question {
  id: string;
  order: number;
  text: string;
}

interface SurveyFormProps {
  cycleId: string;
  questions: Question[];
  departments: { id: string; name: string }[];
  onSubmit: (data: {
    enpsScore: number;
    answers: string[];
    name?: string;
    departmentId?: string;
    honeypot?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export default function SurveyForm({
  cycleId,
  questions,
  departments,
  onSubmit,
  isSubmitting = false,
}: SurveyFormProps) {
  const [enpsScore, setEnpsScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Hidden field for spam detection
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (enpsScore === null) {
      alert('Please select a score from 0-10');
      return;
    }

    if (honeypot) {
      // Bot detected, fail silently
      return;
    }

    try {
      await onSubmit({
        enpsScore,
        answers: answers.slice(0, questions.length),
        name: name.trim() || undefined,
        departmentId: departmentId || undefined,
        honeypot,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your response. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: brand.success }}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: brand.text }}>
          Thank you for your feedback!
        </h2>
        <p className="text-gray-600">
          Your response has been submitted successfully. Your feedback helps us improve the Propellic experience.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      {/* eNPS Score */}
      <div>
        <label className="block text-lg font-semibold mb-4" style={{ color: brand.text }}>
          How likely are you to recommend Propellic as a place to work to a friend or colleague?
        </label>
        <div className="grid grid-cols-11 gap-2">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setEnpsScore(i)}
              className={`
                h-12 rounded-lg border-2 transition-all font-semibold
                ${enpsScore === i 
                  ? 'border-opacity-100 text-white' 
                  : 'border-opacity-30 hover:border-opacity-60'
                }
              `}
              style={{
                borderColor: brand.primary,
                backgroundColor: enpsScore === i ? brand.primary : 'transparent',
                color: enpsScore === i ? brand.bg : brand.text,
              }}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>Not likely at all</span>
          <span>Extremely likely</span>
        </div>
      </div>

      {/* Dynamic Questions */}
      {questions.map((question, index) => (
        <div key={question.id}>
          <label className="block text-lg font-semibold mb-2" style={{ color: brand.text }}>
            {question.text}
          </label>
          <textarea
            value={answers[index] || ''}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[index] = e.target.value;
              setAnswers(newAnswers);
            }}
            className="w-full p-4 border rounded-lg resize-vertical min-h-24 focus:ring-2 focus:ring-opacity-50"
            style={{
              borderColor: brand.secondary + '30',
              focusRingColor: brand.primary,
            }}
            placeholder="Share your thoughts..."
            rows={3}
          />
        </div>
      ))}

      {/* Optional Information */}
      <div className="border-t pt-6" style={{ borderColor: brand.secondary + '20' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: brand.text }}>
          Optional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: brand.text }}>
              Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              style={{
                borderColor: brand.secondary + '30',
                focusRingColor: brand.primary,
              }}
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: brand.text }}>
              Department (Optional)
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              style={{
                borderColor: brand.secondary + '30',
                focusRingColor: brand.primary,
              }}
            >
              <option value="">Select a department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Honeypot field (hidden) */}
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={isSubmitting || enpsScore === null}
          className={`
            px-8 py-3 rounded-lg font-semibold text-white transition-all
            ${isSubmitting || enpsScore === null 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:opacity-90 active:scale-95'
            }
          `}
          style={{ backgroundColor: brand.primary }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </form>
  );
}
