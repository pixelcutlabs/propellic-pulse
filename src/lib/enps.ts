export function computeENPS(scores: number[]) {
  if (!scores.length) return { enps: 0, promoters: 0, passives: 0, detractors: 0 };
  
  const promoters = scores.filter(s => s >= 9).length;
  const passives = scores.filter(s => s >= 7 && s <= 8).length;
  const detractors = scores.filter(s => s <= 6).length;
  
  const enps = Math.round(((promoters - detractors) / scores.length) * 100);
  
  return { enps, promoters, passives, detractors };
}

export function getENPSCategory(score: number): 'promoter' | 'passive' | 'detractor' {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

export function getENPSColor(enpsScore: number): string {
  if (enpsScore >= 50) return '#10B981'; // Green - Excellent
  if (enpsScore >= 0) return '#F59E0B';  // Yellow - Good
  return '#EF4444'; // Red - Needs improvement
}
