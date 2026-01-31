/**
 * Types for Middle East VC / Startup Program directory (investorDirectory Firestore collection).
 * Used by seed script and GET /api/investor-directory.
 */

export type InvestorType = 'vc' | 'accelerator' | 'angel_network' | 'corporate_venturing' | 'government_program'

export type StageFocus = 'pre_seed' | 'seed' | 'series_a' | 'series_b_plus' | 'growth'

export interface InvestorDirectoryEntry {
  id: string
  /** Display name */
  name: string
  type: InvestorType
  /** e.g. UAE, Saudi Arabia, Egypt, Iran */
  country: string
  /** e.g. Dubai, Riyadh, Cairo */
  city?: string
  /** Short description (optional) */
  description?: string
  /** Website URL */
  website?: string
  /** Application or program page */
  applyUrl?: string
  /** Stages they invest in / accept */
  stages?: StageFocus[]
  /** Industries (e.g. FinTech, HealthTech, EdTech) */
  industries?: string[]
  /** Optional: typical check size or program value (e.g. "Up to $500K") */
  checkSize?: string
  /** Optional: portfolio or program highlights */
  highlights?: string[]
  /** Source of this record (e.g. "manual", "scraper:incubatorlist") */
  source?: string
  /** Last time this record was updated (ISO string or Firestore Timestamp) */
  updatedAt?: string
  /** Language: en | fa */
  lang?: 'en' | 'fa'
}

export interface InvestorDirectorySeedRow {
  name: string
  type: InvestorType
  country: string
  city?: string
  description?: string
  website?: string
  applyUrl?: string
  stages?: StageFocus[]
  industries?: string[]
  checkSize?: string
  highlights?: string[]
  source?: string
}
