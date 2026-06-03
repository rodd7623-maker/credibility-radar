import { useQuery } from '@tanstack/react-query';
import { blink } from '@/lib/blink';
import type { Analysis, SampleAnalysis } from '@/lib/types';

function tryParse(s: any): string[] {
  if (!s) return [];
  if (Array.isArray(s)) return s;
  try { return JSON.parse(s); } catch { return []; }
}

export function useSamples() {
  return useQuery<SampleAnalysis[]>({
    queryKey: ['samples'],
    queryFn: async () => {
      const rows = await (blink as any).db.sampleAnalyses.list({
        orderBy: { overallScore: 'desc' },
      });
      return rows as SampleAnalysis[];
    },
  });
}

export function useHistory() {
  return useQuery<Analysis[]>({
    queryKey: ['analyses'],
    queryFn: async () => {
      const user = await blink.auth.me().catch(() => null);
      const userId = user?.id || 'anon';
      const rows = await (blink as any).db.analyses.list({
        where: { user_id: userId },
        orderBy: { createdAt: 'desc' },
        limit: 50,
      });
      return rows.map((r: any) => ({
        ...r,
        fluff_phrases: tryParse(r.fluff_phrases),
        strengths: tryParse(r.strengths),
      }));
    },
  });
}
