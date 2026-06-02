import experimentConfig from '../experiments/config.json';

export interface Variant {
  id: string;
  name: string;
  weight: number;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  variants: Variant[];
}

export function getExperiments(): Experiment[] {
  return experimentConfig.experiments;
}

export function getExperiment(id: string): Experiment | undefined {
  return experimentConfig.experiments.find(exp => exp.id === id);
}

/**
 * Client-side variant selection based on user ID or session
 * This should be called from the browser
 */
export function selectVariant(experimentId: string, userId?: string): string | null {
  const experiment = getExperiment(experimentId);

  if (!experiment || !experiment.enabled) {
    return null;
  }

  // Get or create persistent user ID
  const id = userId || getUserId();

  // Check localStorage for existing variant
  const storageKey = `exp_${experimentId}`;
  const stored = localStorage.getItem(storageKey);

  if (stored && experiment.variants.some(v => v.id === stored)) {
    return stored;
  }

  // Select variant based on hash of user ID
  const hash = hashCode(id + experimentId);
  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
  const position = Math.abs(hash % totalWeight);

  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (position < cumulative) {
      localStorage.setItem(storageKey, variant.id);
      return variant.id;
    }
  }

  return experiment.variants[0].id;
}

function getUserId(): string {
  let userId = localStorage.getItem('user_id');

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('user_id', userId);
  }

  return userId;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Track experiment exposure (for analytics)
 */
export function trackExperiment(experimentId: string, variantId: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'experiment_exposure', {
      experiment_id: experimentId,
      variant_id: variantId,
    });
  }

  // You can also send to your own analytics endpoint
  console.log(`Experiment: ${experimentId}, Variant: ${variantId}`);
}
