export type Tier = 'Domain Expert' | 'Competent Practitioner' | 'Surface-Level Bluffer' | 'Deceptive Evader';

export interface AnalysisResult {
  overall_score: number;
  technical_score: number;
  structural_score: number;
  camouflage_score: number;
  coherence_score: number;
  tier: Tier;
  summary: string;
  fluff_phrases: string[];
  strengths: string[];
}

export interface Analysis extends AnalysisResult {
  id: string;
  user_id?: string;
  input_text: string;
  input_type: 'text' | 'voice';
  created_at: string;
}

export interface SampleAnalysis {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  full_text: string;
  overall_score: number;
  tier: Tier;
}

export function getTier(score: number): Tier {
  if (score >= 85) return 'Domain Expert';
  if (score >= 60) return 'Competent Practitioner';
  if (score >= 35) return 'Surface-Level Bluffer';
  return 'Deceptive Evader';
}

export function getTierColor(tier: Tier): string {
  switch (tier) {
    case 'Domain Expert': return '#22c55e';
    case 'Competent Practitioner': return '#3b82f6';
    case 'Surface-Level Bluffer': return '#f59e0b';
    case 'Deceptive Evader': return '#ef4444';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 60) return '#3b82f6';
  if (score >= 35) return '#f59e0b';
  return '#ef4444';
}
