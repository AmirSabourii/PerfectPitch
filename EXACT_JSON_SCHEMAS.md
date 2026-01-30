# Exact JSON Schemas for PerfectPitch Analysis

## Purpose
این فایل schema های دقیق JSON را برای هر stage تعریف می‌کند تا:
1. مدل AI دقیقاً بداند چه ساختاری برگرداند
2. UI بداند چه فیلدهایی را نمایش دهد
3. اگر فیلدی کم یا زیاد بود، سیستم crash نکند

## Stage 1 Output Schema

```json
{
  "distortionScan": {
    "buzzwords": ["string", "string"],
    "unsupportedClaims": ["string", "string"],
    "logicalLeaps": ["string", "string"],
    "hiddenOrGlossedOver": ["string", "string"]
  },
  "ideaRealityReconstruction": {
    "actualProblem": "string",
    "realTargetCustomer": "string",
    "coreSolutionMechanism": "string",
    "problemWorthSolving": {
      "isVentureScale": true/false,
      "reasoning": "string"
    }
  },
  "marketAndTimingAnalysis": {
    "marketPull": "string",
    "marketReadiness": "string",
    "competitiveLandscape": "string",
    "timingValidity": {
      "whyNow": "string"
    }
  },
  "executionSignalDetection": {
    "businessModelClarity": "string",
    "unitEconomics": "string",
    "customerLearningEvidence": "string",
    "tradeOffAwareness": "string",
    "teamMarketProductFit": {
      "signals": "string"
    }
  },
  "investorRiskScan": {
    "fatalAssumptions": ["string", "string"],
    "scalePotential": "string",
    "capitalEfficiency": "string",
    "exitStoryPlausibility": "string",
    "competitiveDefensibility": "string"
  },
  "presentationIntegrityCheck": {
    "narrativeCoherence": "string",
    "missingCriticalEvidence": ["string", "string"],
    "slideBySlideCredibility": "string",
    "ideaQualityVsPitchQualityGap": {
      "gap": "string"
    }
  },
  "startupReconstruction": {
    "problem": "string",
    "solution": "string",
    "customer": "string",
    "market": "string",
    "businessModel": "string",
    "reconstructionReasoning": {
      "evidenceUsed": ["string"],
      "inferencesMade": ["string"],
      "confidenceLevel": "high|medium|low",
      "contradictionsFound": ["string"]
    }
  },
  "ideaQuality": {
    "score": 7,
    "reasoning": {
      "scoreBreakdown": {
        "problemSignificance": {
          "score": 8,
          "why": "string",
          "evidence": ["string", "string"]
        },
        "solutionNovelty": {
          "score": 6,
          "why": "string",
          "evidence": ["string"]
        },
        "marketTiming": {
          "score": 7,
          "why": "string",
          "evidence": ["string"]
        },
        "scalePotential": {
          "score": 7,
          "why": "string",
          "evidence": ["string"]
        }
      },
      "calculationMethod": "string explaining formula",
      "whyNotHigher": "string",
      "whyNotLower": "string",
      "comparableIdeas": ["string", "string"]
    },
    "fundamentalStrength": "string"
  },
  "pitchQuality": {
    "score": 6,
    "reasoning": {
      "scoreBreakdown": {
        "narrativeClarity": {
          "score": 7,
          "why": "string",
          "evidence": ["string"]
        },
        "evidenceQuality": {
          "score": 6,
          "why": "string",
          "evidence": ["string"]
        },
        "visualEffectiveness": {
          "score": 5,
          "why": "string",
          "evidence": ["string"]
        },
        "logicalFlow": {
          "score": 7,
          "why": "string",
          "evidence": ["string"]
        }
      },
      "calculationMethod": "string",
      "gapBetweenIdeaAndPresentation": "string",
      "mostEffectiveSlides": ["string"],
      "leastEffectiveSlides": ["string"]
    },
    "presentationEffectiveness": "string"
  },
  "investorSignals": {
    "positive": [
      {
        "signal": "string",
        "strength": "weak|moderate|strong",
        "reasoning": "string",
        "comparablePattern": "string"
      }
    ],
    "negative": [
      {
        "signal": "string",
        "severity": "minor|moderate|major",
        "reasoning": "string",
        "comparablePattern": "string",
        "mitigationPossibility": "string"
      }
    ],
    "critical": [
      {
        "signal": "string",
        "fatalityRisk": "low|medium|high",
        "reasoning": "string",
        "comparablePattern": "string"
      }
    ],
    "signalAnalysisMethod": "string"
  },
  "patternMatching": {
    "similarSuccesses": [
      {
        "company": "string",
        "similarity": "string",
        "outcome": "string",
        "relevantLesson": "string",
        "differencesThatMatter": "string"
      }
    ],
    "similarFailures": [
      {
        "company": "string",
        "similarity": "string",
        "outcome": "string",
        "relevantLesson": "string",
        "differencesThatMatter": "string"
      }
    ],
    "uniqueAspects": ["string"],
    "patternConfidence": "string"
  },
  "investmentReadiness": {
    "stage": "string",
    "readiness": "string or number",
    "readinessReasoning": {
      "currentStateAssessment": "string",
      "stageRequirements": "string",
      "gapAnalysis": ["string"],
      "scoreJustification": "string",
      "timeToReady": "string"
    },
    "gapToFundable": "string"
  },
  "rawVerdict": {
    "decision": "pass|maybe|proceed",
    "confidence": "low|medium|high",
    "keyReason": "string",
    "verdictReasoning": {
      "decisiveFactors": ["string"],
      "weighingProcess": "string",
      "edgeCaseConsiderations": "string",
      "confidenceDrivers": "string",
      "scenarioAnalysis": {
        "bestCase": "string",
        "worstCase": "string",
        "mostLikely": "string"
      }
    }
  },
  "overallReasoningTransparency": {
    "keyAssumptions": ["string", "string"],
    "uncertaintyAreas": ["string", "string"],
    "dataQuality": "string",
    "biasCheck": "string",
    "alternativeInterpretations": ["string", "string"]
  }
}
```

## Stage 2 Output Schema

```json
{
  "scorecard": {
    "problemValidityUrgency": {
      "score": 7,
      "reasoning": {
        "evidenceFromStage1": ["string"],
        "calculationMethod": "string",
        "scoreJustification": "string",
        "impactOnInvestability": "string"
      }
    },
    "marketSizeAccessibility": {
      "score": 6,
      "reasoning": { /* same structure */ }
    },
    "solutionFitDifferentiation": {
      "score": 7,
      "reasoning": { /* same structure */ }
    },
    "businessModelClarity": {
      "score": 5,
      "reasoning": { /* same structure */ }
    },
    "competitiveDefensibility": {
      "score": 6,
      "reasoning": { /* same structure */ }
    },
    "narrativeCoherence": {
      "score": 7,
      "reasoning": { /* same structure */ }
    },
    "evidenceCredibility": {
      "score": 6,
      "reasoning": { /* same structure */ }
    },
    "overallInvestability": {
      "score": 6,
      "reasoning": {
        "aggregationMethod": "string",
        "weightingRationale": "string",
        "nonLinearFactors": "string",
        "finalScoreLogic": "string"
      }
    }
  },
  "gapDiagnosis": {
    "biggestValueGap": {
      "issue": "string",
      "currentImpact": "string",
      "reasoning": {
        "whyThisIsWorst": "string",
        "evidenceOfImpact": "string",
        "cascadingEffects": "string"
      }
    },
    "fastestCredibilityWin": {
      "action": "string",
      "expectedImpact": "string",
      "reasoning": {
        "whyThisIsQuickest": "string",
        "evidenceOfValue": "string",
        "implementationReality": "string"
      }
    },
    "dangerousIllusions": [
      {
        "illusion": "string",
        "reality": "string",
        "reasoning": {
          "evidenceOfIllusion": "string",
          "consequencesOfIllusion": "string",
          "difficultyOfCorrection": "string"
        }
      }
    ]
  },
  "prioritizedChecklist": {
    "high": [
      {
        "item": "string",
        "investorConcern": "string",
        "expectedImpact": "string",
        "reasoning": {
          "whyHighPriority": "string",
          "evidenceOfNeed": ["string"],
          "successCriteria": "string",
          "estimatedEffort": "string"
        }
      }
    ],
    "medium": [ /* same structure */ ],
    "low": [ /* same structure */ ],
    "prioritizationMethodology": {
      "impactCalculation": "string",
      "effortEstimation": "string",
      "tradeOffsConsidered": "string",
      "sequencingLogic": "string"
    }
  },
  "decisionLogic": {
    "decision": "pass|maybe|proceed",
    "reasoning": {
      "scoreThresholds": "string",
      "qualitativeFactors": "string",
      "edgeCaseHandling": "string",
      "decisionTree": "string"
    },
    "conditions": {
      "forPass": ["string"],
      "forMaybe": ["string"],
      "forProceed": ["string"]
    }
  },
  "improvementPotential": {
    "current": 6,
    "target": 8,
    "ceiling": 9,
    "confidence": "low|medium|high",
    "reasoning": {
      "currentScoreCalculation": "string",
      "targetScoreLogic": "string",
      "ceilingAssumptions": "string",
      "confidenceDrivers": "string",
      "improvementRoadmap": {
        "quickWins": "string",
        "mediumTerm": "string",
        "longTerm": "string"
      },
      "realismCheck": "string"
    }
  }
}
```

## Stage 3 Output Schema

```json
{
  "consistency_test": {
    "score": 8,
    "critical_issue": "string or null",
    "reasoning": {
      "scoringCriteria": "string",
      "evidenceChecked": ["string"],
      "contradictionsFound": ["string"],
      "alignmentAnalysis": "string",
      "scoreCalculation": "string",
      "confidenceLevel": "high|medium|low"
    }
  },
  "assumption_stress_test": {
    "score": 7,
    "fatal_dependency": "string or null",
    "reasoning": {
      "assumptionInventory": ["string"],
      "validationStatus": "string",
      "fatalityAnalysis": "string",
      "controlAnalysis": "string",
      "scoreCalculation": "string",
      "mitigationPossibility": "string",
      "confidenceLevel": "high|medium|low"
    }
  },
  "objection_coverage_test": {
    "score": 6,
    "missed_high_impact_item": "string or null",
    "reasoning": {
      "expectedObjections": ["string"],
      "addressedObjections": ["string"],
      "missedObjections": ["string"],
      "coverageQuality": "string",
      "scoreCalculation": "string",
      "impactAssessment": "string",
      "confidenceLevel": "high|medium|low"
    }
  },
  "clarity_under_pressure_test": {
    "score": 7,
    "30s_takeaway": "string",
    "reasoning": {
      "clarityMetrics": "string",
      "cognitiveLoad": "string",
      "messageRetention": "string",
      "complexityAnalysis": "string",
      "scoreCalculation": "string",
      "improvementPotential": "string",
      "confidenceLevel": "high|medium|low"
    }
  },
  "market_believability_test": {
    "score": 6,
    "unconvincing_claim": "string or null",
    "reasoning": {
      "claimInventory": ["string"],
      "realismCheck": "string",
      "credibilityAssessment": "string",
      "skepticismTriggers": ["string"],
      "scoreCalculation": "string",
      "comparableData": "string",
      "confidenceLevel": "high|medium|low"
    }
  },
  "story_coherence_test": {
    "score": 7,
    "flow_break_point": "string or null",
    "reasoning": {
      "narrativeStructure": "string",
      "logicalFlow": "string",
      "transitionQuality": "string",
      "missingSteps": ["string"],
      "scoreCalculation": "string",
      "emotionalArc": "string",
      "confidenceLevel": "high|medium|low"
    }
  },
  "final_readiness_score": {
    "testScores": {
      "consistency": 8,
      "assumptionStress": 7,
      "objectionCoverage": 6,
      "clarityUnderPressure": 7,
      "marketBelievability": 6,
      "storyCoherence": 7
    },
    "scoringMethodology": {
      "weightingScheme": {
        "consistency": "20%",
        "assumptionStress": "20%",
        "objectionCoverage": "15%",
        "clarityUnderPressure": "15%",
        "marketBelievability": "15%",
        "storyCoherence": "15%"
      },
      "aggregationFormula": "string",
      "penaltyApplication": "string",
      "calibrationBenchmarks": ["string"]
    },
    "score_0_to_100": 68,
    "readiness_band": "review",
    "bandReasoning": {
      "thresholdLogic": "string",
      "currentBandJustification": "string",
      "distanceToNextBand": "string",
      "confidenceInBand": "string"
    },
    "critical_issue_penalties": true/false
  },
  "investor_gate_verdict": {
    "pass_human_review": true/false,
    "confidence_level": "low|medium|high",
    "main_blocking_reason": "string or null",
    "verdictReasoning": {
      "decisionLogic": {
        "automaticFailTriggers": ["string"],
        "averageScoreAnalysis": "string",
        "exceptionalStrengths": ["string"],
        "fatalWeaknesses": ["string"]
      },
      "confidenceAnalysis": {
        "certaintyDrivers": ["string"],
        "edgeCaseConsiderations": "string",
        "informationGaps": ["string"],
        "confidenceCalibration": "string"
      },
      "alternativeOutcomes": {
        "ifPassedWhatRisks": "string",
        "ifRejectedWhatMissed": "string",
        "reversalConditions": "string"
      },
      "investorTimeValue": {
        "opportunityCost": "string",
        "expectedValue": "string",
        "timeInvestmentRequired": "string",
        "worthinessCalculation": "string"
      }
    }
  }
}
```

## UI Display Rules

### Rule 1: Safe Field Access
```typescript
// Always use optional chaining and nullish coalescing
const score = stage1?.ideaQuality?.score ?? '*'
const reasoning = stage1?.ideaQuality?.reasoning ?? { scoreBreakdown: {} }
```

### Rule 2: Fallback Display
```typescript
// If field is missing, show '*' instead of crashing
{field ? field : '*'}
```

### Rule 3: Type Checking
```typescript
// Check if reasoning is object or string
{typeof reasoning === 'object' ? (
  <ReasoningDisplay reasoning={reasoning} />
) : (
  <p>{reasoning || '*'}</p>
)}
```

### Rule 4: Array Handling
```typescript
// Always check if array exists and has items
{Array.isArray(items) && items.length > 0 ? (
  items.map(item => <li key={i}>{item}</li>)
) : (
  <p>*</p>
)}
```

---

**این schema ها باید دقیقاً در system prompts قرار بگیرند تا مدل بداند چه برگرداند.**
