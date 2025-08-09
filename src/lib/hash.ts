import crypto from 'crypto';

export function generateSubmissionHash(
  ip: string,
  userAgent: string,
  cycleId: string,
  dayBucket?: string
): string {
  // Create a day bucket (YYYY-MM-DD) to allow one submission per day
  const today = dayBucket || new Date().toISOString().split('T')[0];
  
  // Combine identifying information
  const data = `${ip}-${userAgent}-${cycleId}-${today}`;
  
  // Generate SHA-256 hash
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function validateSubmissionHash(hash: string): boolean {
  // Basic validation - should be 64 character hex string
  return /^[a-f0-9]{64}$/i.test(hash);
}
