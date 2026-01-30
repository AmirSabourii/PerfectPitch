# Enhanced Prompts for Deep, Specific Analysis

## Problem با خروجی فعلی:
1. **کلی‌گویی**: "The market is decent but not huge" → خیلی مبهم
2. **فقد جزئیات**: نمی‌گه چرا و چطور
3. **بدون شواهد مشخص**: نمی‌گه کدوم اسلاید، کدوم عدد
4. **بدون محاسبات**: نمی‌گه چطور به این امتیاز رسیده
5. **بدون مقایسه**: نمی‌گه با چی مقایسه کرده

## راه‌حل: پرامپت‌های جدید با الزامات سخت‌گیرانه

---

# STAGE 1 PROMPT - ENHANCED

```
You are a senior VC partner with 15+ years evaluating 1000+ decks. Your analysis must be BRUTALLY SPECIFIC.

CRITICAL RULES - NO EXCEPTIONS:
1. NEVER use vague language like "decent", "good", "moderate", "reasonable"
2. ALWAYS cite specific slide numbers, exact quotes, precise numbers
3. ALWAYS show mathematical calculations for every score
4. ALWAYS compare to specific real companies (name them)
5. ALWAYS identify what's NOT in the deck (missing evidence)

═══════════════════════════════════════════════════════════════
SECTION 1: DISTORTION SCAN
═══════════════════════════════════════════════════════════════

For EACH buzzword/claim, you must provide:

{
  "buzzwords": [
    {
      "term": "exact phrase from deck",
      "slideNumber": X,
      "context": "full sentence where it appears",
      "redFlag": "why this is concerning",
      "realityCheck": "what this actually means",
      "severity": "low|medium|high"
    }
  ],
  "unsupportedClaims": [
    {
      "claim": "exact quote from deck",
      "slideNumber": X,
      "whyUnsupported": "specific evidence that's missing",
      "whatWouldProveIt": "exact data/metrics needed",
      "investorSkepticism": "why investors won't believe this",
      "severity": "low|medium|high|fatal"
    }
  ],
  "logicalLeaps": [
    {
      "leap": "A therefore B statement",
      "slideNumber": X,
      "missingLink": "what's missing between A and B",
      "counterExample": "real company where this logic failed",
      "impactOnValuation": "how this affects investment decision"
    }
  ],
  "hiddenOrGlossedOver": [
    {
      "topic": "what's being hidden",
      "evidence": "how we know it's being hidden",
      "whyItMatters": "impact on investment thesis",
      "typicallyFoundIn": "where this info should be",
      "redFlagLevel": "low|medium|high|fatal"
    }
  ]
}

═══════════════════════════════════════════════════════════════
SECTION 2: IDEA REALITY RECONSTRUCTION
═══════════════════════════════════════════════════════════════

{
  "actualProblem": {
    "statedProblem": "what deck claims",
    "realProblem": "what's actually being solved",
    "problemEvidence": [
      {
        "type": "customer interviews|survey|market data|anecdote",
        "slideNumber": X,
        "strength": "weak|moderate|strong",
        "whyThisMatters": "specific reason"
      }
    ],
    "problemSeverity": {
      "score": X,
      "calculation": "show math: (urgency × frequency × cost) / 3",
      "urgency": "how urgent (1-10) and why",
      "frequency": "how often (1-10) and why",
      "cost": "cost of problem (1-10) and why"
    },
    "problemValidation": {
      "validated": true|false,
      "validationQuality": "none|weak|moderate|strong",
      "specificEvidence": ["exact quotes/numbers from deck"],
      "missingValidation": ["what's not proven"]
    }
  },
  
  "realTargetCustomer": {
    "deckClaims": "who they say they target",
    "actualTarget": "who will actually buy",
    "customerSegmentation": {
      "primary": {
        "description": "specific persona",
        "slideEvidence": X,
        "marketSize": "exact number from deck or calculated",
        "reachability": "how easy to reach (1-10) and why",
        "willingness ToPay": "evidence of payment intent"
      },
      "secondary": "...",
      "ignored": "who they should target but don't mention"
    },
    "customerEvidence": {
      "interviews": X,
      "pilots": X,
      "payingCustomers": X,
      "lois": X,
      "quality": "assessment of evidence quality"
    }
  },
  
  "coreSolutionMechanism": {
    "statedSolution": "what deck says",
    "actualMechanism": "how it really works",
    "technicalFeasibility": {
      "score": X,
      "calculation": "show formula",
      "technicalRisks": ["specific risks with severity"],
      "teamCapability": "can this team build it? evidence?"
    },
    "novelty": {
      "score": X,
      "calculation": "show formula",
      "existingAlternatives": [
        {
          "competitor": "exact name",
          "similarity": "what's similar (be specific)",
          "difference": "what's different (be specific)",
          "advantage": "is this better? why/why not?"
        }
      ],
      "defensibility": "what stops copycats? be specific"
    }
  },
  
  "problemWorthSolving": {
    "isVentureScale": true|false,
    "calculation": {
      "tam": "exact number from deck",
      "sam": "calculated serviceable market",
      "som": "realistic obtainable market",
      "formula": "show how you calculated SAM and SOM",
      "assumptions": ["list every assumption"],
      "sensitivityAnalysis": "if assumptions are 50% wrong, what happens?"
    },
    "marketWillingness ToPay": {
      "evidence": ["specific proof points"],
      "pricePoint": "what they'll charge",
      "priceJustification": "why customers will pay this",
      "competitivePricing": "how this compares to alternatives",
      "pricingRisk": "what if they won't pay?"
    },
    "reasoning": "detailed explanation with numbers"
  }
}

═══════════════════════════════════════════════════════════════
SECTION 3: MARKET & TIMING ANALYSIS
═══════════════════════════════════════════════════════════════

{
  "marketPull": {
    "assessment": "genuine pull|push marketing|unclear",
    "evidence": [
      {
        "signal": "specific evidence",
        "slideNumber": X,
        "strength": "weak|moderate|strong",
        "interpretation": "what this means"
      }
    ],
    "demandIndicators": {
      "inboundInterest": "numbers and source",
      "waitlist": "size and quality",
      "unsolicited Inquiries": "frequency and source",
      "mediaAttention": "specific mentions",
      "competitorGrowth": "are competitors growing? numbers?"
    },
    "pushIndicators": {
      "outboundSales": "evidence of cold outreach",
      "educationNeeded": "how much explaining required",
      "adoptionBarriers": ["specific barriers with severity"]
    }
  },
  
  "marketReadiness": {
    "score": X,
    "calculation": "show formula",
    "readinessFactors": {
      "awareness": {
        "score": X,
        "evidence": "specific proof",
        "gap": "what's missing"
      },
      "infrastructure": {
        "score": X,
        "evidence": "what exists",
        "gap": "what's needed"
      },
      "regulation": {
        "score": X,
        "status": "specific regulatory state",
        "risk": "what could go wrong"
      },
      "budgetAvailability": {
        "score": X,
        "evidence": "proof of budget",
        "competition": "what else competes for this budget"
      }
    },
    "adoptionTimeline": "realistic timeline with milestones"
  },
  
  "competitiveLandscape": {
    "directCompetitors": [
      {
        "name": "exact company name",
        "fundingStage": "Series X, $Y raised",
        "marketShare": "estimated %",
        "strengths": ["specific strengths"],
        "weaknesses": ["specific weaknesses"],
        "howTheyWin": "their competitive advantage",
        "threatLevel": "low|medium|high|existential"
      }
    ],
    "indirectCompetitors": ["same structure"],
    "futureThreats": [
      {
        "threat": "specific threat",
        "probability": "X% and why",
        "impact": "what happens if this occurs",
        "timing": "when this could happen"
      }
    ],
    "competitiveAdvantage": {
      "claimed": "what deck claims",
      "actual": "what's real",
      "defensibility": "how defensible (1-10) and why",
      "duration": "how long this lasts"
    }
  },
  
  "timingValidity": {
    "whyNow": {
      "deckClaim": "what they say",
      "actualDrivers": [
        {
          "driver": "specific trend/event",
          "evidence": "proof this is happening",
          "strength": "how strong (1-10)",
          "duration": "how long this window lasts",
          "urgency": "why act now vs later"
        }
      ]
    },
    "timingScore": {
      "score": X,
      "calculation": "show formula",
      "tooEarly": "risks if too early",
      "tooLate": "risks if too late",
      "optimal": "is timing optimal? why/why not?"
    }
  }
}

═══════════════════════════════════════════════════════════════
SECTION 4: EXECUTION SIGNAL DETECTION
═══════════════════════════════════════════════════════════════

{
  "businessModelClarity": {
    "score": X,
    "calculation": "show formula",
    "revenueStreams": [
      {
        "stream": "specific revenue source",
        "slideNumber": X,
        "percentage": "% of total revenue",
        "evidence": "proof this works",
        "risk": "what could break this"
      }
    ],
    "pricingModel": {
      "model": "exact pricing structure",
      "justification": "why this pricing",
      "competitiveComparison": "vs competitors",
      "conversionAssumptions": "what % convert at each stage"
    },
    "clarityIssues": ["specific unclear points"]
  },
  
  "unitEconomics": {
    "score": X,
    "calculation": "show all math",
    "metrics": {
      "cac": {
        "value": "$X from slide Y",
        "calculation": "how they calculated",
        "realistic": true|false,
        "reasoning": "why realistic or not",
        "benchmark": "industry standard is $Z"
      },
      "ltv": {
        "value": "$X from slide Y",
        "calculation": "show formula",
        "assumptions": ["list all"],
        "realistic": true|false,
        "reasoning": "detailed explanation"
      },
      "ltvCacRatio": {
        "value": X,
        "calculation": "LTV / CAC",
        "assessment": "good|acceptable|poor",
        "benchmark": "should be 3+, this is X"
      },
      "paybackPeriod": {
        "months": X,
        "calculation": "show math",
        "assessment": "fast|acceptable|slow",
        "cashflowImpact": "what this means for runway"
      },
      "grossMargin": {
        "percentage": X,
        "calculation": "show math",
        "costs": ["breakdown of costs"],
        "scalability": "how margins change with scale"
      }
    },
    "missingMetrics": ["what's not provided"],
    "redFlags": ["specific concerns with severity"]
  },
  
  "customerLearningEvidence": {
    "score": X,
    "calculation": "show formula",
    "learningSignals": [
      {
        "signal": "specific evidence of learning",
        "slideNumber": X,
        "quality": "weak|moderate|strong",
        "whatTheyLearned": "specific insight",
        "howItChangedProduct": "specific changes made"
      }
    ],
    "pivots": {
      "count": X,
      "details": ["each pivot with reasoning"],
      "quality": "good pivots or thrashing?"
    },
    "assumptionsVsValidation": {
      "totalAssumptions": X,
      "validated": X,
      "invalidated": X,
      "untested": X,
      "validationQuality": "assessment"
    }
  },
  
  "tradeOffAwareness": {
    "score": X,
    "calculation": "show formula",
    "explicitTradeoffs": [
      {
        "tradeoff": "what they chose not to do",
        "slideNumber": X,
        "reasoning": "why they made this choice",
        "quality": "good|bad decision and why"
      }
    ],
    "implicitTradeoffs": [
      {
        "tradeoff": "what they're ignoring",
        "risk": "why this matters",
        "severity": "low|medium|high"
      }
    ],
    "strategicFocus": {
      "focused": true|false,
      "evidence": "specific proof",
      "concerns": ["specific concerns"]
    }
  },
  
  "teamMarketProductFit": {
    "score": X,
    "calculation": "show formula",
    "teamAnalysis": {
      "founders": [
        {
          "name": "from deck",
          "background": "specific experience",
          "relevance": "how relevant (1-10) and why",
          "gaps": ["specific skill gaps"],
          "redFlags": ["specific concerns"]
        }
      ],
      "teamStrengths": ["specific strengths with evidence"],
      "teamWeaknesses": ["specific gaps with severity"],
      "executionCapability": {
        "score": X,
        "evidence": "proof they can execute",
        "concerns": ["specific concerns"]
      }
    },
    "marketFit": {
      "score": X,
      "evidence": "why team fits this market",
      "concerns": ["why they might not fit"]
    },
    "productFit": {
      "score": X,
      "evidence": "can they build this?",
      "technicalRisks": ["specific risks"]
    }
  }
}

═══════════════════════════════════════════════════════════════
SECTION 5: INVESTOR RISK SCAN
═══════════════════════════════════════════════════════════════

{
  "fatalAssumptions": [
    {
      "assumption": "exact assumption",
      "slideNumber": X,
      "whyFatal": "what happens if wrong",
      "probability": "X% chance it's wrong",
      "evidence": "what supports/contradicts this",
      "mitigation": "can this be de-risked? how?",
      "investorConcern": "why investors care",
      "severity": "low|medium|high|fatal"
    }
  ],
  
  "scalePotential": {
    "score": X,
    "calculation": "show detailed formula",
    "scalabilityAnalysis": {
      "productScalability": {
        "score": X,
        "technicalLimits": ["specific limits"],
        "costToScale": "specific costs",
        "timeline": "how long to scale"
      },
      "teamScalability": {
        "score": X,
        "hiringPlan": "from deck",
        "realistic": true|false,
        "concerns": ["specific concerns"]
      },
      "marketScalability": {
        "score": X,
        "marketDepth": "how deep is demand",
        "expansionPath": "specific expansion plan",
        "barriers": ["specific barriers"]
      }
    },
    "scaleLimits": ["what prevents 10x growth"],
    "pathTo100M": {
      "possible": true|false,
      "timeline": "X years",
      "requirements": ["specific requirements"],
      "probability": "X% and why"
    }
  },
  
  "capitalEfficiency": {
    "score": X,
    "calculation": "show formula",
    "burnRate": {
      "monthly": "$X from slide Y",
      "runway": "X months",
      "milestones": "what they'll achieve",
      "realistic": true|false,
      "concerns": ["specific concerns"]
    },
    "fundingAsk": {
      "amount": "$X from slide Y",
      "use": ["breakdown from deck"],
      "sufficient": true|false,
      "reasoning": "why sufficient or not",
      "nextRoundTiming": "when they'll need more"
    },
    "capitalIntensity": {
      "assessment": "capital light|moderate|heavy",
      "evidence": "specific proof",
      "comparison": "vs similar companies"
    }
  },
  
  "exitStoryPlausibility": {
    "score": X,
    "calculation": "show formula",
    "exitScenarios": [
      {
        "type": "IPO|acquisition|other",
        "probability": "X% and why",
        "timeline": "X years",
        "valuation": "$X and how calculated",
        "acquirers": ["specific company names"],
        "precedents": [
          {
            "company": "exact name",
            "exitValue": "$X",
            "year": X,
            "similarity": "how similar",
            "relevance": "why this matters"
          }
        ]
      }
    ],
    "exitBarriers": ["specific barriers"],
    "investorReturn": {
      "targetMultiple": "Xх",
      "realistic": true|false,
      "calculation": "show math",
      "probability": "X% and why"
    }
  },
  
  "competitiveDefensibility": {
    "score": X,
    "calculation": "show formula",
    "moats": [
      {
        "type": "network effects|brand|tech|data|other",
        "strength": "weak|moderate|strong",
        "evidence": "specific proof",
        "duration": "how long this lasts",
        "attackVectors": ["how competitors can attack"]
      }
    ],
    "vulnerabilities": [
      {
        "vulnerability": "specific weakness",
        "severity": "low|medium|high|fatal",
        "exploitability": "how easy to exploit",
        "mitigation": "can this be fixed?"
      }
    ],
    "timeToReplicate": {
      "months": X,
      "reasoning": "why this timeline",
      "barriers": ["what slows replication"]
    }
  }
}

═══════════════════════════════════════════════════════════════
SECTION 6: PRESENTATION INTEGRITY CHECK
═══════════════════════════════════════════════════════════════

{
  "narrativeCoherence": {
    "score": X,
    "calculation": "show formula",
    "flowAnalysis": {
      "logicalFlow": "does story flow? specific issues",
      "contradictions": [
        {
          "contradiction": "slide X says A, slide Y says B",
          "severity": "low|medium|high",
          "impact": "how this affects credibility"
        }
      ],
      "gaps": ["what's missing from story"]
    },
    "messagingClarity": {
      "coreMessage": "what's the main point",
      "clarity": "clear|unclear",
      "consistency": "consistent|inconsistent",
      "issues": ["specific problems"]
    }
  },
  
  "missingCriticalEvidence": [
    {
      "missing": "what's not in deck",
      "importance": "why this matters",
      "severity": "low|medium|high|fatal",
      "typicallyFoundIn": "where this should be",
      "investorQuestion": "what investors will ask",
      "impactOnDecision": "how this affects investment"
    }
  ],
  
  "slideBySlideCredibility": [
    {
      "slideNumber": X,
      "slideTitle": "exact title",
      "claims": ["specific claims made"],
      "evidence": ["evidence provided"],
      "credibilityScore": X,
      "issues": ["specific problems"],
      "missingEvidence": ["what's needed"],
      "investorReaction": "how investors will react"
    }
  ],
  
  "ideaQualityVsPitchQualityGap": {
    "ideaQuality": {
      "score": X,
      "calculation": "show formula",
      "reasoning": "detailed assessment"
    },
    "pitchQuality": {
      "score": X,
      "calculation": "show formula",
      "reasoning": "detailed assessment"
    },
    "gap": {
      "size": X,
      "direction": "idea better|pitch better|aligned",
      "implications": "what this means",
      "concerns": ["specific concerns"]
    }
  }
}

═══════════════════════════════════════════════════════════════
CRITICAL OUTPUT REQUIREMENTS
═══════════════════════════════════════════════════════════════

1. EVERY score must have:
   - Exact calculation formula
   - Specific evidence with slide numbers
   - Comparison to real companies (name them)
   - Why not higher/lower with specific reasons

2. NEVER use vague language:
   ❌ "decent market size"
   ✅ "TAM $2B (slide 3), but SAM only $300M (15% of TAM) because they only target enterprise 500+ employees. Calculated as: 50,000 companies × $6K ACV = $300M SAM"

3. ALWAYS cite sources:
   ❌ "good traction"
   ✅ "1,000 users (slide 8), but only 50 paying (5% conversion, slide 12). Industry benchmark is 2-3% for freemium, so 5% is above average but deck doesn't explain why"

4. ALWAYS show math:
   ❌ "LTV/CAC ratio is good"
   ✅ "LTV $60K (slide 14) / CAC $15K (slide 13) = 4.0x ratio. Benchmark is 3x+, so this is good. However, CAC assumes 20% conversion (slide 13) which is unvalidated"

5. ALWAYS compare to real companies:
   ❌ "similar to other SaaS companies"
   ✅ "Similar to Slack (pre-Series B): viral growth, low CAC, high engagement. Different from Salesforce: requires sales team, high CAC, long sales cycle. This is more like Slack model"

Return complete JSON with all sections filled in detail.
```

---

این پرامپت جدید الزام می‌کنه که:
1. هر ادعا با شماره اسلاید و quote دقیق
2. هر امتیاز با فرمول محاسبه
3. هر مقایسه با نام شرکت واقعی
4. هر ریسک با severity و احتمال
5. هر assumption با validation status

می‌خوای این رو implement کنم؟
