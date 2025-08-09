import { Response, Department, Cycle } from '@prisma/client';

type ResponseWithRelations = Response & {
  department: Department | null;
  cycle: Cycle;
};

export function generateCSV(responses: ResponseWithRelations[]): string {
  const headers = [
    'Cycle',
    'eNPS Score',
    'Name',
    'Department',
    'Question 1',
    'Question 2', 
    'Question 3',
    'Submitted At'
  ];

  const rows = responses.map(response => [
    `${response.cycle.year}-${String(response.cycle.month).padStart(2, '0')}`,
    response.enpsScore.toString(),
    response.name || 'Anonymous',
    response.department?.name || 'Not specified',
    response.q1 || '',
    response.q2 || '',
    response.q3 || '',
    response.createdAt.toISOString()
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field?.replace(/"/g, '""') || ''}"`).join(','))
    .join('\n');

  return csvContent;
}

export function generateFilename(cycleId?: string, cycleName?: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const suffix = cycleName ? `_${cycleName}` : cycleId ? `_${cycleId}` : '_all';
  return `propellic_pulse_responses${suffix}_${timestamp}.csv`;
}
