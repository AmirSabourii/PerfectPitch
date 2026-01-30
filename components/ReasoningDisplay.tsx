'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Brain, TrendingUp, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReasoningDisplayProps {
  title: string
  reasoning: any
  type?: 'score' | 'test' | 'decision'
  defaultExpanded?: boolean
}

export function ReasoningDisplay({ 
  title, 
  reasoning, 
  type = 'score',
  defaultExpanded = false 
}: ReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // SAFE: Handle null, undefined, or string reasoning
  if (!reasoning || reasoning === null || reasoning === undefined) {
    return (
      <div className="p-3 bg-black/20 rounded-lg border border-white/5">
        <p className="text-xs text-zinc-400">-</p>
      </div>
    )
  }

  if (typeof reasoning === 'string') {
    return (
      <div className="p-3 bg-black/20 rounded-lg border border-white/5">
        <p className="text-xs text-zinc-400">{reasoning}</p>
      </div>
    )
  }

  // SAFE: Ensure reasoning is an object
  if (typeof reasoning !== 'object') {
    return (
      <div className="p-3 bg-black/20 rounded-lg border border-white/5">
        <p className="text-xs text-zinc-400">-</p>
      </div>
    )
  }

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-white/5">
          {/* Score Breakdown */}
          {reasoning.scoreBreakdown && typeof reasoning.scoreBreakdown === 'object' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Score Breakdown
              </h4>
              {Object.entries(reasoning.scoreBreakdown).map(([key, value]: [string, any]) => (
                <div key={key} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-zinc-300">{key}</span>
                    <span className="text-sm font-bold text-indigo-400">{value?.score ?? '-'}/10</span>
                  </div>
                  {value?.why && <p className="text-xs text-zinc-400 mb-2">{value.why}</p>}
                  {value?.evidence && Array.isArray(value.evidence) && value.evidence.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <p className="text-[10px] text-zinc-500 uppercase mb-1">Evidence:</p>
                      <ul className="space-y-1">
                        {value.evidence.map((item: string, i: number) => (
                          <li key={i} className="text-xs text-zinc-400 pl-2 border-l border-indigo-500/30">
                            {item || '-'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Calculation Method */}
          {reasoning.calculationMethod && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Calculation Method</h4>
              <p className="text-xs text-zinc-300">{reasoning.calculationMethod}</p>
            </div>
          )}

          {/* Score Justification */}
          {reasoning.scoreJustification && (
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Score Justification</h4>
              <p className="text-xs text-zinc-300">{reasoning.scoreJustification}</p>
            </div>
          )}

          {/* Why Not Higher/Lower */}
          {(reasoning.whyNotHigher || reasoning.whyNotLower) && (
            <div className="grid grid-cols-2 gap-3">
              {reasoning.whyNotHigher && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                  <h4 className="text-xs font-bold text-amber-400 uppercase mb-2">Why Not Higher?</h4>
                  <p className="text-xs text-zinc-300">{reasoning.whyNotHigher}</p>
                </div>
              )}
              {reasoning.whyNotLower && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Why Not Lower?</h4>
                  <p className="text-xs text-zinc-300">{reasoning.whyNotLower}</p>
                </div>
              )}
            </div>
          )}

          {/* Evidence Lists */}
          {reasoning.evidenceFromStage1 && Array.isArray(reasoning.evidenceFromStage1) && reasoning.evidenceFromStage1.length > 0 && (
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Evidence from Analysis</h4>
              <ul className="space-y-1">
                {reasoning.evidenceFromStage1.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-indigo-500/30">
                    {item || '-'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Test-specific reasoning */}
          {reasoning.evidenceChecked && Array.isArray(reasoning.evidenceChecked) && reasoning.evidenceChecked.length > 0 && (
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Evidence Checked</h4>
              <ul className="space-y-1">
                {reasoning.evidenceChecked.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-blue-500/30">
                    {item || '-'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contradictions */}
          {reasoning.contradictionsFound && Array.isArray(reasoning.contradictionsFound) && reasoning.contradictionsFound.length > 0 && (
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-red-400 uppercase mb-2 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                Contradictions Found
              </h4>
              <ul className="space-y-1">
                {reasoning.contradictionsFound.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-red-500/30">
                    {item || '-'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confidence Level */}
          {reasoning.confidenceLevel && (
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-xs font-bold text-zinc-500 uppercase">Confidence Level</span>
              <span className={cn(
                'text-sm font-bold uppercase',
                reasoning.confidenceLevel === 'high' ? 'text-emerald-400' :
                reasoning.confidenceLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
              )}>
                {reasoning.confidenceLevel}
              </span>
            </div>
          )}

          {/* Impact on Investability */}
          {reasoning.impactOnInvestability && (
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">Impact on Investability</h4>
              <p className="text-xs text-zinc-300">{reasoning.impactOnInvestability}</p>
            </div>
          )}

          {/* Comparable Ideas/Patterns */}
          {reasoning.comparableIdeas && Array.isArray(reasoning.comparableIdeas) && reasoning.comparableIdeas.length > 0 && (
            <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">Comparable Ideas</h4>
              <ul className="space-y-1">
                {reasoning.comparableIdeas.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-purple-500/30">
                    {item || '-'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Scenario Analysis */}
          {reasoning.scenarioAnalysis && typeof reasoning.scenarioAnalysis === 'object' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-500 uppercase">Scenario Analysis</h4>
              <div className="grid grid-cols-3 gap-2">
                {reasoning.scenarioAnalysis.bestCase && (
                  <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded">
                    <p className="text-[10px] text-emerald-400 uppercase mb-1">Best Case</p>
                    <p className="text-xs text-zinc-300">{reasoning.scenarioAnalysis.bestCase}</p>
                  </div>
                )}
                {reasoning.scenarioAnalysis.mostLikely && (
                  <div className="p-2 bg-blue-500/5 border border-blue-500/10 rounded">
                    <p className="text-[10px] text-blue-400 uppercase mb-1">Most Likely</p>
                    <p className="text-xs text-zinc-300">{reasoning.scenarioAnalysis.mostLikely}</p>
                  </div>
                )}
                {reasoning.scenarioAnalysis.worstCase && (
                  <div className="p-2 bg-red-500/5 border border-red-500/10 rounded">
                    <p className="text-[10px] text-red-400 uppercase mb-1">Worst Case</p>
                    <p className="text-xs text-zinc-300">{reasoning.scenarioAnalysis.worstCase}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verdict-specific reasoning: Decision Logic */}
          {reasoning.decisionLogic && typeof reasoning.decisionLogic === 'object' && (
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase">Decision Logic</h4>
              {reasoning.decisionLogic.automaticFailTriggers && Array.isArray(reasoning.decisionLogic.automaticFailTriggers) && reasoning.decisionLogic.automaticFailTriggers.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Automatic Fail Triggers:</p>
                  <ul className="space-y-1">
                    {reasoning.decisionLogic.automaticFailTriggers.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-red-500/30">
                        {item || '-'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {reasoning.decisionLogic.averageScoreAnalysis && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Average Score Analysis:</p>
                  <p className="text-xs text-zinc-300">{reasoning.decisionLogic.averageScoreAnalysis}</p>
                </div>
              )}
              {reasoning.decisionLogic.exceptionalStrengths && Array.isArray(reasoning.decisionLogic.exceptionalStrengths) && reasoning.decisionLogic.exceptionalStrengths.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Exceptional Strengths:</p>
                  <ul className="space-y-1">
                    {reasoning.decisionLogic.exceptionalStrengths.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-emerald-500/30">
                        {item || '-'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {reasoning.decisionLogic.fatalWeaknesses && Array.isArray(reasoning.decisionLogic.fatalWeaknesses) && reasoning.decisionLogic.fatalWeaknesses.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Fatal Weaknesses:</p>
                  <ul className="space-y-1">
                    {reasoning.decisionLogic.fatalWeaknesses.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-red-500/30">
                        {item || '-'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Verdict-specific reasoning: Confidence Analysis */}
          {reasoning.confidenceAnalysis && typeof reasoning.confidenceAnalysis === 'object' && (
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-blue-400 uppercase">Confidence Analysis</h4>
              {reasoning.confidenceAnalysis.certaintyDrivers && Array.isArray(reasoning.confidenceAnalysis.certaintyDrivers) && reasoning.confidenceAnalysis.certaintyDrivers.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Certainty Drivers:</p>
                  <ul className="space-y-1">
                    {reasoning.confidenceAnalysis.certaintyDrivers.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-blue-500/30">
                        {item || '-'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {reasoning.confidenceAnalysis.edgeCaseConsiderations && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Edge Case Considerations:</p>
                  <p className="text-xs text-zinc-300">{reasoning.confidenceAnalysis.edgeCaseConsiderations}</p>
                </div>
              )}
              {reasoning.confidenceAnalysis.informationGaps && Array.isArray(reasoning.confidenceAnalysis.informationGaps) && reasoning.confidenceAnalysis.informationGaps.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Information Gaps:</p>
                  <ul className="space-y-1">
                    {reasoning.confidenceAnalysis.informationGaps.map((item: string, i: number) => (
                      <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-amber-500/30">
                        {item || '-'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {reasoning.confidenceAnalysis.confidenceCalibration && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Confidence Calibration:</p>
                  <p className="text-xs text-zinc-300">{reasoning.confidenceAnalysis.confidenceCalibration}</p>
                </div>
              )}
            </div>
          )}

          {/* Verdict-specific reasoning: Alternative Outcomes */}
          {reasoning.alternativeOutcomes && typeof reasoning.alternativeOutcomes === 'object' && (
            <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-purple-400 uppercase">Alternative Outcomes</h4>
              {reasoning.alternativeOutcomes.ifPassedWhatRisks && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">If Passed - What Risks:</p>
                  <p className="text-xs text-zinc-300">{reasoning.alternativeOutcomes.ifPassedWhatRisks}</p>
                </div>
              )}
              {reasoning.alternativeOutcomes.ifRejectedWhatMissed && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">If Rejected - What Missed:</p>
                  <p className="text-xs text-zinc-300">{reasoning.alternativeOutcomes.ifRejectedWhatMissed}</p>
                </div>
              )}
              {reasoning.alternativeOutcomes.reversalConditions && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Reversal Conditions:</p>
                  <p className="text-xs text-zinc-300">{reasoning.alternativeOutcomes.reversalConditions}</p>
                </div>
              )}
            </div>
          )}

          {/* Verdict-specific reasoning: Investor Time Value */}
          {reasoning.investorTimeValue && typeof reasoning.investorTimeValue === 'object' && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase">Investor Time Value</h4>
              {reasoning.investorTimeValue.opportunityCost && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Opportunity Cost:</p>
                  <p className="text-xs text-zinc-300">{reasoning.investorTimeValue.opportunityCost}</p>
                </div>
              )}
              {reasoning.investorTimeValue.expectedValue && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Expected Value:</p>
                  <p className="text-xs text-zinc-300">{reasoning.investorTimeValue.expectedValue}</p>
                </div>
              )}
              {reasoning.investorTimeValue.timeInvestmentRequired && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Time Investment Required:</p>
                  <p className="text-xs text-zinc-300">{reasoning.investorTimeValue.timeInvestmentRequired}</p>
                </div>
              )}
              {reasoning.investorTimeValue.worthinessCalculation && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Worthiness Calculation:</p>
                  <p className="text-xs text-zinc-300">{reasoning.investorTimeValue.worthinessCalculation}</p>
                </div>
              )}
            </div>
          )}

          {/* Scoring Methodology (for readiness score) */}
          {reasoning.weightingScheme && typeof reasoning.weightingScheme === 'object' && (
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase">Weighting Scheme</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(reasoning.weightingScheme).map(([key, value]) => (
                  <div key={key} className="p-2 bg-white/5 rounded">
                    <p className="text-[10px] text-zinc-500 uppercase">{key}</p>
                    <p className="text-xs text-zinc-300 font-mono">{value ? String(value) : '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reasoning.aggregationFormula && (
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Aggregation Formula</h4>
              <p className="text-xs text-zinc-300 font-mono">{reasoning.aggregationFormula}</p>
            </div>
          )}

          {reasoning.penaltyApplication && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-amber-400 uppercase mb-2">Penalty Application</h4>
              <p className="text-xs text-zinc-300">{reasoning.penaltyApplication}</p>
            </div>
          )}

          {reasoning.calibrationBenchmarks && Array.isArray(reasoning.calibrationBenchmarks) && reasoning.calibrationBenchmarks.length > 0 && (
            <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">Calibration Benchmarks</h4>
              <ul className="space-y-1">
                {reasoning.calibrationBenchmarks.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-zinc-300 pl-2 border-l border-purple-500/30">
                    {item || '-'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Band Reasoning (for readiness band) */}
          {reasoning.thresholdLogic && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Threshold Logic</h4>
              <p className="text-xs text-zinc-300">{reasoning.thresholdLogic}</p>
            </div>
          )}

          {reasoning.currentBandJustification && (
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Current Band Justification</h4>
              <p className="text-xs text-zinc-300">{reasoning.currentBandJustification}</p>
            </div>
          )}

          {reasoning.distanceToNextBand && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-amber-400 uppercase mb-2">Distance to Next Band</h4>
              <p className="text-xs text-zinc-300">{reasoning.distanceToNextBand}</p>
            </div>
          )}

          {reasoning.confidenceInBand && (
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
              <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">Confidence in Band</h4>
              <p className="text-xs text-zinc-300">{reasoning.confidenceInBand}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
