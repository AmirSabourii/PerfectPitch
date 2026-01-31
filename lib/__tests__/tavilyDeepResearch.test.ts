/**
 * Tests for Tavily Deep Research (performTavilyDeepResearch).
 * - Unit tests with mocked Tavily client (output shape, auth error).
 * - Integration test when TAVILY_API_KEY is set (real API, validates proper output).
 */

import type { IdeaSummary } from '../types'

const REQUIRED_SECTIONS = [
  'competitorAnalysis',
  'targetAudienceAnalysis',
  'valuePropositionAnalysis',
  'marketAnalysis',
  'competitiveAdvantage',
  'risksAndChallenges',
  'strategicRecommendations',
] as const

/** Minimal valid content object that satisfies our schema (for mocks). */
function mockTavilyContent(): Record<string, unknown> {
  return {
    competitorAnalysis: {
      directCompetitors: [{ name: 'A', description: 'd', strengths: [], weaknesses: [], differentiators: [], pricing: '' }],
      indirectCompetitors: [],
      marketPositioning: 'test',
    },
    targetAudienceAnalysis: {
      personas: [{ name: 'P', description: 'd', painPoints: [], needs: [], reasonsToUse: [], willingnessToPay: '' }],
      marketSize: { tam: '', sam: '', som: '', methodology: '' },
      adoptionBarriers: [],
      adoptionDrivers: [],
    },
    valuePropositionAnalysis: {
      coreValue: 'test',
      problemsSolved: [],
      valueHierarchy: [],
      recommendedMessaging: [],
    },
    marketAnalysis: {
      marketSize: { tam: '', sam: '', som: '', methodology: '' },
      trends: [],
      opportunities: [],
      threats: [],
      growthProjection: '',
    },
    competitiveAdvantage: {
      advantages: [],
      moat: '',
      sustainability: '',
      defensibility: '',
    },
    risksAndChallenges: {
      risks: [],
      challenges: [],
      mitigationStrategies: [],
    },
    strategicRecommendations: {
      quickWins: [],
      longTermInitiatives: [],
      priorityOrder: [],
      keyMetrics: [],
    },
  }
}

const minimalIdeaSummary: IdeaSummary = {
  summary: 'AI-powered customer support for SMBs.',
  problemStatement: 'SMBs spend too much on support.',
  solutionStatement: 'Automated AI agents with human handoff.',
  targetMarket: 'SMBs in North America.',
  keyDifferentiator: 'No-code setup and 24/7 coverage.',
}

jest.mock('@tavily/core', () => ({
  tavily: jest.fn(() => ({
    research: jest.fn().mockResolvedValue({ requestId: 'mock-request-id' }),
    getResearch: jest.fn().mockResolvedValue({
      status: 'completed',
      content: {
        competitorAnalysis: { directCompetitors: [], indirectCompetitors: [], marketPositioning: '' },
        targetAudienceAnalysis: { personas: [], marketSize: { tam: '', sam: '', som: '', methodology: '' }, adoptionBarriers: [], adoptionDrivers: [] },
        valuePropositionAnalysis: { coreValue: '', problemsSolved: [], valueHierarchy: [], recommendedMessaging: [] },
        marketAnalysis: { marketSize: { tam: '', sam: '', som: '', methodology: '' }, trends: [], opportunities: [], threats: [], growthProjection: '' },
        competitiveAdvantage: { advantages: [], moat: '', sustainability: '', defensibility: '' },
        risksAndChallenges: { risks: [], challenges: [], mitigationStrategies: [] },
        strategicRecommendations: { quickWins: [], longTermInitiatives: [], priorityOrder: [], keyMetrics: [] },
      },
    }),
  })),
}))

describe('Tavily Deep Research', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('unit (mocked)', () => {
    it('throws when TAVILY_API_KEY is missing', async () => {
      delete process.env.TAVILY_API_KEY
      const { performTavilyDeepResearch } = require('../tavilyDeepResearch')
      const err = await performTavilyDeepResearch(minimalIdeaSummary, 'en').catch((e: unknown) => e)
      expect(err).toBeInstanceOf(Error)
      expect((err as Error).message).toContain('TAVILY_API_KEY')
      expect((err as { statusCode?: number }).statusCode).toBe(401)
    })

    it('returns object with all required sections and metadata when mock succeeds', async () => {
      process.env.TAVILY_API_KEY = 'tvly-test-key'
      const { performTavilyDeepResearch } = require('../tavilyDeepResearch')
      const result = await performTavilyDeepResearch(minimalIdeaSummary, 'en')

      for (const key of REQUIRED_SECTIONS) {
        expect(result).toHaveProperty(key)
        expect(typeof (result as Record<string, unknown>)[key]).toBe('object')
      }
      expect(result).toHaveProperty('ideaSummary')
      expect(result.ideaSummary).toEqual(minimalIdeaSummary)
      expect(result).toHaveProperty('generatedAt')
      expect(result).toHaveProperty('language')
      expect(result.language).toBe('en')
      expect(typeof result.generatedAt).toBe('string')
    })

    it('accepts content as string JSON and parses it', async () => {
      process.env.TAVILY_API_KEY = 'tvly-test-key'
      const { tavily } = require('@tavily/core')
      tavily.mockImplementation(() => ({
        research: jest.fn().mockResolvedValue({ requestId: 'mock-id' }),
        getResearch: jest.fn().mockResolvedValue({
          status: 'completed',
          content: JSON.stringify(mockTavilyContent()),
        }),
      }))
      const { performTavilyDeepResearch } = require('../tavilyDeepResearch')
      const result = await performTavilyDeepResearch(minimalIdeaSummary, 'en')
      for (const key of REQUIRED_SECTIONS) {
        expect(result).toHaveProperty(key)
      }
    })
  })
})

describe('Tavily Deep Research – integration (real API)', () => {
  const apiKey = process.env.TAVILY_API_KEY?.trim() ?? ''
  const hasRealApiKey =
    apiKey.length > 0 && !/^(your-key|xxx|placeholder)$/i.test(apiKey)

  it(
    'performTavilyDeepResearch returns valid output when TAVILY_API_KEY is set',
    async () => {
      if (!hasRealApiKey) {
        console.warn(
          'Skipping Tavily integration test: TAVILY_API_KEY not set or is a placeholder'
        )
        return
      }
      jest.unmock('@tavily/core')
      jest.resetModules()
      const { performTavilyDeepResearch } = require('../tavilyDeepResearch')
      const ideaSummary: IdeaSummary = {
        summary: 'AI customer support for small businesses.',
        problemStatement: 'High cost of human support agents.',
        solutionStatement: 'AI-first chat with human escalation.',
        targetMarket: 'SMBs, 10–200 employees.',
        keyDifferentiator: 'No-code setup, under 10 minutes.',
      }
      const result = await performTavilyDeepResearch(ideaSummary, 'en')

      expect(result).toBeDefined()
      expect(result.ideaSummary).toEqual(ideaSummary)
      expect(result.language).toBe('en')
      expect(typeof result.generatedAt).toBe('string')

      for (const key of REQUIRED_SECTIONS) {
        expect(result).toHaveProperty(key)
        const section = (result as Record<string, unknown>)[key]
        expect(section).toBeDefined()
        expect(typeof section).toBe('object')
        expect(section).not.toBeNull()
      }

      expect((result as Record<string, unknown>).competitorAnalysis).toHaveProperty('directCompetitors')
      expect((result as Record<string, unknown>).targetAudienceAnalysis).toHaveProperty('personas')
      expect((result as Record<string, unknown>).strategicRecommendations).toHaveProperty('quickWins')
    },
    hasRealApiKey ? 120_000 : 5_000
  )
})
