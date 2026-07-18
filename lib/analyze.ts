import { blink } from './blink';
import { getTier, type AnalysisResult } from './types';

const SYSTEM_PROMPT = `You are an expert linguistic forensics analyst specializing in detecting genuine expertise versus surface-level knowledge in written and spoken communication.

Analyze the provided text using the "Cognitive Friction" matrix with these four weighted dimensions:

1. Technical Specificity (35%): How precise is the terminology? Real experts use domain-specific terms correctly, cite specific tools/frameworks/methodologies, and avoid generic buzzwords. Bluffers[...]

2. Structural Anchoring (25%): Does the text contain hard metrics, specific timelines, named entities, verifiable facts, numbers, dates, percentages, or concrete deliverables? Or only abstract cla[...]

3. Camouflage Penalty (20%): Identify sentences that are grammatically dense but information-zero — "smoke and mirrors" language. The HIGHER this score, the LESS camouflage (so 100 = no fluff, 0[...]

4. Logical Coherence (20%): Do claims follow a clear cause-and-effect chain? Are arguments supported by evidence? Or are statements disconnected assertions?

Score each dimension 0-100. Provide:
- summary: 1-2 sentence verdict on the speaker's actual knowledge depth
- fluff_phrases: array of 0-5 exact verbatim phrases from the text that are camouflage/buzzwords (empty array if none)
- strengths: array of 0-3 specific elements that demonstrate real expertise (empty array if none)

Be HARSH but fair. Pure buzzword speak should score below 30. Real technical depth with metrics should score above 80.`;

async function callFallbackAnalyze(text: string): Promise<AnalysisResult | null> {
  const fallbackUrl = process.env.EXPO_PUBLIC_ANALYZE_FALLBACK_URL;
  if (!fallbackUrl) return null;

  try {
    const resp = await fetch(fallbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!resp.ok) {
      console.warn('[analyze][fallback] non-OK response', resp.status);
      return null;
    }
    const json = await resp.json();
    // Basic validation of expected fields
    if (typeof json?.overall_score === 'number') {
      return json as AnalysisResult;
    }
    console.warn('[analyze][fallback] unexpected payload shape from fallback');
    return null;
  } catch (e) {
    console.warn('[analyze][fallback] error calling fallback:', (e as any)?.message ?? e);
    return null;
  }
}

export async function analyzeText(text: string): Promise<AnalysisResult> {
  // Feature flag: if Blink is intentionally disabled, return a safe degraded response.
  if (process.env.EXPO_PUBLIC_BLINK_DISABLED === 'true') {
    const score = 50;
    return {
      overall_score: score,
      technical_score: score,
      structural_score: score,
      camouflage_score: score,
      coherence_score: score,
      tier: getTier(score),
      summary: 'Analysis temporarily unavailable — please try again later.',
      fluff_phrases: [],
      strengths: [],
    };
  }

  try {
    // Attempt normal Blink flow first
    const { object } = await blink.ai.generateObject({
      schema: {
        type: 'object',
        properties: {
          technical_score: { type: 'number', minimum: 0, maximum: 100 },
          structural_score: { type: 'number', minimum: 0, maximum: 100 },
          camouflage_score: { type: 'number', minimum: 0, maximum: 100 },
          coherence_score: { type: 'number', minimum: 0, maximum: 100 },
          summary: { type: 'string' },
          fluff_phrases: { type: 'array', items: { type: 'string' } },
          strengths: { type: 'array', items: { type: 'string' } },
        },
        required: ['technical_score', 'structural_score', 'camouflage_score', 'coherence_score', 'summary', 'fluff_phrases', 'strengths'],
      },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this communication for true knowledge depth:\n\n"""${text}"""` },
      ],
    } as any);

    const r = object as any;
    const overall = Math.round(
      r.technical_score * 0.35 +
      r.structural_score * 0.25 +
      r.camouflage_score * 0.20 +
      r.coherence_score * 0.20
    );

    return {
      overall_score: overall,
      technical_score: r.technical_score,
      structural_score: r.structural_score,
      camouflage_score: r.camouflage_score,
      coherence_score: r.coherence_score,
      tier: getTier(overall),
      summary: r.summary,
      fluff_phrases: r.fluff_phrases || [],
      strengths: r.strengths || [],
    };
  } catch (err) {
    console.error('[analyze] Blink call failed:', (err as any)?.message ?? err);

    // Try configured fallback endpoint (if any)
    const fallbackResult = await callFallbackAnalyze(text);
    if (fallbackResult) {
      return fallbackResult;
    }

    // Last-resort degraded response so the app doesn't crash
    const score = 50;
    return {
      overall_score: score,
      technical_score: score,
      structural_score: score,
      camouflage_score: score,
      coherence_score: score,
      tier: getTier(score),
      summary: 'Analysis currently unavailable — please try again later.',
      fluff_phrases: [],
      strengths: [],
    };
  }
}

export async function saveAnalysis(text: string, result: AnalysisResult, inputType: 'text' | 'voice' = 'text') {
  const id = `a_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    const user = await blink.auth.me().catch(() => null);
    await (blink as any).db.analyses.create({
      id,
      user_id: user?.id || 'anon',
      input_text: text.slice(0, 4000),
      input_type: inputType,
      overall_score: result.overall_score,
      technical_score: result.technical_score,
      structural_score: result.structural_score,
      camouflage_score: result.camouflage_score,
      coherence_score: result.coherence_score,
      tier: result.tier,
      summary: result.summary,
      fluff_phrases: JSON.stringify(result.fluff_phrases),
      strengths: JSON.stringify(result.strengths),
    });
  } catch (e) {
    console.warn('Save failed:', e);
  }
  return id;
}
