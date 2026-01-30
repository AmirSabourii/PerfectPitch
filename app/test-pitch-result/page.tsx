'use client'

import { useState } from 'react'
import PitchAnalysisResult from '@/components/PitchAnalysisResult'

const sampleAnalysis = {
  "stage1": {
    "startupReconstruction": {
      "problem": "The challenge of effectively communicating with Large Language Models (LLMs) due to the complexity of prompt engineering, leading to inefficient AI outputs and high costs.",
      "solution": "A dual-interface tool that automates prompt engineering, converting simple user inputs into optimized prompts for LLMs, enhancing output quality and reducing costs.",
      "customer": "Professional users and organizations using generative AI tools who lack prompt engineering expertise.",
      "market": "B2B SaaS market targeting professional users of generative AI, with a focus on reducing API costs and improving AI output quality.",
      "businessModel": "Freemium model with premium subscriptions and enterprise solutions, including API access and dedicated panels for corporate teams."
    },
    "ideaQuality": {
      "score": 6,
      "reasoning": "The idea addresses a real pain point in AI usage but relies heavily on the assumption that users will pay for improved prompt engineering. The market is potentially large, but the solution's uniqueness and defensibility are questionable.",
      "fundamentalStrength": "The fundamental strength lies in addressing a genuine need for better AI interaction, but the reliance on a freemium model and the competitive landscape pose challenges."
    },
    "pitchQuality": {
      "score": 5,
      "reasoning": "The pitch uses buzzwords and lacks concrete evidence of traction beyond vanity metrics. The narrative is somewhat coherent but glosses over competitive threats and execution risks.",
      "presentationEffectiveness": "The presentation is somewhat effective in conveying the problem and solution but lacks depth in market analysis and competitive differentiation."
    },
    "investorSignals": {
      "positive": [
        "Addresses a real and growing problem in AI usage.",
        "Freemium model can drive user acquisition."
      ],
      "negative": [
        "Heavy reliance on buzzwords and vanity metrics.",
        "Competitive landscape is not thoroughly addressed.",
        "Assumes users will pay for prompt optimization."
      ],
      "critical": [
        "Lack of clarity on competitive defensibility.",
        "Unproven market adoption for paid tiers."
      ]
    },
    "patternMatching": {
      "similarSuccesses": [
        "Grammarly's model of improving user-generated content."
      ],
      "similarFailures": [
        "Tools that failed to monetize on top of free AI services."
      ],
      "uniqueAspects": [
        "Focus on prompt engineering automation for LLMs."
      ]
    },
    "investmentReadiness": {
      "stage": "Early-stage (Idea)",
      "readiness": "Not ready for significant investment due to lack of traction and competitive differentiation.",
      "gapToFundable": "Needs clearer evidence of market demand and competitive advantage."
    },
    "rawVerdict": {
      "decision": "Pass",
      "confidence": 0.7,
      "keyReason": "The idea lacks proven traction and competitive differentiation, with significant execution risks in a crowded market."
    }
  },
  "stage2": {
    "scorecard": {
      "Problem Validity & Urgency": {
        "score": 7,
        "reasoning": "The problem of prompt engineering is real and affects many users of LLMs, indicating a valid and urgent need."
      },
      "Market Size & Accessibility": {
        "score": 6,
        "reasoning": "The B2B SaaS market is large, but the accessibility for users willing to pay for prompt optimization is uncertain."
      },
      "Solution Fit & Differentiation": {
        "score": 5,
        "reasoning": "The solution addresses a specific need but lacks clear differentiation from existing tools and services."
      },
      "Business Model Clarity": {
        "score": 6,
        "reasoning": "The freemium model is clear, but its effectiveness in converting users to paid tiers is unproven."
      },
      "Competitive Defensibility": {
        "score": 4,
        "reasoning": "There is a lack of clarity on how the solution will defend against competitors, which is a significant concern."
      },
      "Narrative Coherence": {
        "score": 5,
        "reasoning": "The narrative is somewhat coherent but lacks depth in addressing competitive threats and execution risks."
      },
      "Evidence & Credibility": {
        "score": 4,
        "reasoning": "The pitch relies on buzzwords and lacks concrete evidence of traction, which diminishes credibility."
      },
      "Overall Investability": {
        "score": 5,
        "reasoning": "The combination of a valid problem and a potentially large market is overshadowed by execution risks and lack of differentiation."
      }
    },
    "gapDiagnosis": {
      "biggestGap": "Lack of proven traction and competitive differentiation.",
      "fastestWin": "Provide concrete evidence of market demand and user interest in paid tiers.",
      "dangerousIllusions": "The founder may believe that the freemium model alone will guarantee user acquisition and conversion without addressing competitive threats."
    },
    "prioritizedChecklist": {
      "high": [
        "Develop and present concrete evidence of market demand and user interest in paid tiers to address investor concerns about traction.",
        "Clarify competitive differentiation and defensibility to counteract investor skepticism."
      ],
      "medium": [
        "Enhance the narrative to include a thorough analysis of competitive threats and execution risks.",
        "Provide case studies or examples of similar successful monetization strategies to build credibility."
      ],
      "low": [
        "Refine the pitch to eliminate buzzwords and focus on clear, impactful messaging.",
        "Add supporting details that strengthen the story, such as testimonials or early user feedback."
      ]
    },
    "decisionLogic": {
      "decision": "Pass",
      "reasoning": "The startup lacks proven traction and competitive differentiation, which are critical for investment.",
      "conditions": "For reconsideration, the startup must demonstrate clear evidence of market demand and a solid competitive strategy."
    },
    "improvementPotential": {
      "current": 5,
      "target": 7,
      "ceiling": 9,
      "confidence": "0.6"
    }
  },
  "stage3": {
    "consistency_test": {
      "score": 6,
      "critical_issue": "The financial model and business model narrative are not fully aligned; the freemium model's transition to paid tiers lacks clarity."
    },
    "assumption_stress_test": {
      "score": 4,
      "fatal_dependency": "Assumption that users will pay for improved prompt engineering without proven demand."
    },
    "objection_coverage_test": {
      "score": 5,
      "missed_high_impact_item": "Competitive threats and execution risks are not thoroughly addressed."
    },
    "clarity_under_pressure_test": {
      "score": 5,
      "30s_takeaway": "PromptQT automates prompt engineering to improve AI outputs, but lacks clear competitive edge."
    },
    "market_believability_test": {
      "score": 5,
      "unconvincing_claim": "Market size claims are ambitious without clear evidence of user willingness to pay."
    },
    "story_coherence_test": {
      "score": 6,
      "flow_break_point": "The transition from problem to solution is clear, but the narrative weakens when addressing market adoption and competitive differentiation."
    },
    "final_readiness_scoring": {
      "overall_readiness": 48,
      "readiness_band": "weak",
      "critical_issue_penalties": true
    },
    "investor_gate_verdict": {
      "pass_human_review": false,
      "confidence_level": "high",
      "main_blocking_reason": "Lack of proven market demand and competitive differentiation, with critical assumption risks."
    }
  },
  "metadata": {
    "analyzedAt": "2026-01-22T14:28:39.168Z",
    "pitchDeckLength": 5797,
    "processingTimeMs": 42800
  }
}

export default function TestPitchResultPage() {
  return (
    <div className="min-h-screen bg-black p-8">
      <PitchAnalysisResult
        analysis={sampleAnalysis}
        transcript="Test transcript"
        onStartQnA={() => console.log('Start Q&A')}
        onReset={() => console.log('Reset')}
      />
    </div>
  )
}
