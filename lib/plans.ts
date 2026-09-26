// Monthly plans sold online (Stripe Checkout). Prices in CHF, same as the pricing section.
// The tailored programme (from CHF 299) is quoted after the free audit, not sold here.
export type PlanKey = 'site' | 'visibility' | 'complete'
export const PLAN_KEYS: PlanKey[] = ['site', 'visibility', 'complete']

export const PLANS: Record<PlanKey, { chf: number; name: Record<'fr' | 'de' | 'en', string> }> = {
  site: { chf: 99, name: { fr: 'Site web', de: 'Website', en: 'Website' } },
  visibility: { chf: 149, name: { fr: 'Site + Visibilité IA', de: 'Website + KI-Sichtbarkeit', en: 'Website + AI visibility' } },
  complete: { chf: 229, name: { fr: 'Tout compris', de: 'Alles inklusive', en: 'All inclusive' } },
}

export const isPlanKey = (v: unknown): v is PlanKey => typeof v === 'string' && (PLAN_KEYS as string[]).includes(v)
