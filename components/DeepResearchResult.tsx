'use client'

import { useState } from 'react'
import type { DeepResearchResult } from '@/lib/types'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

interface DeepResearchResultProps {
  result: Omit<DeepResearchResult, 'id' | 'userId'>
  language: 'en' | 'fa'
}

/** Safe arrays/strings for display when provider (e.g. Tavily) omits optional fields. */
function safeArr<T>(x: T[] | undefined | null): T[] {
  return Array.isArray(x) ? x : []
}
function safeStr(x: unknown): string {
  if (x == null) return '—'
  if (typeof x === 'string') return x
  return String(x)
}

export default function DeepResearchResult({ result, language }: DeepResearchResultProps) {
  const [activeTab, setActiveTab] = useState('competitors')

  const tabs = [
    { id: 'competitors', label: language === 'fa' ? 'رقبا' : 'Competitors' },
    { id: 'audience', label: language === 'fa' ? 'کاربران هدف' : 'Target Audience' },
    { id: 'value', label: language === 'fa' ? 'ارزش پیشنهادی' : 'Value Proposition' },
    { id: 'market', label: language === 'fa' ? 'بازار' : 'Market' },
    { id: 'advantage', label: language === 'fa' ? 'مزیت رقابتی' : 'Competitive Advantage' },
    { id: 'risks', label: language === 'fa' ? 'ریسک‌ها' : 'Risks' },
    { id: 'recommendations', label: language === 'fa' ? 'توصیه‌ها' : 'Recommendations' }
  ]

  const copyToClipboard = () => {
    const text = JSON.stringify(result, null, 2)
    navigator.clipboard.writeText(text)
    alert(language === 'fa' ? 'کپی شد!' : 'Copied!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {language === 'fa' ? '📊 نتایج تحقیق عمیق' : '📊 Deep Research Results'}
        </h2>
        <Button onClick={copyToClipboard} className="text-sm">
          {language === 'fa' ? '📋 کپی' : '📋 Copy'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card className="p-6">
        {activeTab === 'competitors' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {language === 'fa' ? 'تحلیل رقبا' : 'Competitor Analysis'}
            </h3>
            
            <div className="space-y-4">
              <h4 className="font-medium text-lg">
                {language === 'fa' ? 'رقبای مستقیم' : 'Direct Competitors'}
              </h4>
              {safeArr(result.competitorAnalysis?.directCompetitors).map((comp, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 space-y-2">
                  <h5 className="font-semibold">{safeStr(comp.name)}</h5>
                  <p className="text-sm text-gray-600">{safeStr(comp.description)}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-green-600">
                        {language === 'fa' ? 'نقاط قوت:' : 'Strengths:'}
                      </strong>
                      <ul className="list-disc list-inside">
                        {safeArr(comp.strengths).map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <strong className="text-red-600">
                        {language === 'fa' ? 'نقاط ضعف:' : 'Weaknesses:'}
                      </strong>
                      <ul className="list-disc list-inside">
                        {safeArr(comp.weaknesses).map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                  {comp.pricing != null && comp.pricing !== '' && (
                    <p className="text-sm">
                      <strong>{language === 'fa' ? 'قیمت:' : 'Pricing:'}</strong> {comp.pricing}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <strong>{language === 'fa' ? 'موقعیت بازار:' : 'Market Positioning:'}</strong>
              <p className="mt-2">{safeStr(result.competitorAnalysis?.marketPositioning)}</p>
            </div>
          </div>
        )}

        {activeTab === 'audience' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {language === 'fa' ? 'تحلیل کاربران هدف' : 'Target Audience Analysis'}
            </h3>
            
            {safeArr(result.targetAudienceAnalysis?.personas).map((persona, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-lg">{safeStr(persona.name)}</h4>
                <p className="text-gray-600">{safeStr(persona.description)}</p>
                <p className="text-sm"><strong>{language === 'fa' ? 'جمعیت‌شناسی:' : 'Demographics:'}</strong> {safeStr(persona.demographics)}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong className="text-red-600">{language === 'fa' ? 'دردها:' : 'Pain Points:'}</strong>
                    <ul className="list-disc list-inside mt-1">
                      {safeArr(persona.painPoints).map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-blue-600">{language === 'fa' ? 'نیازها:' : 'Needs:'}</strong>
                    <ul className="list-disc list-inside mt-1">
                      {safeArr(persona.needs).map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-green-600">{language === 'fa' ? 'دلایل استفاده:' : 'Reasons to Use:'}</strong>
                    <ul className="list-disc list-inside mt-1">
                      {safeArr(persona.reasonsToUse).map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
                
                <p className="text-sm">
                  <strong>{language === 'fa' ? 'تمایل به پرداخت:' : 'Willingness to Pay:'}</strong> {safeStr(persona.willingnessToPay)}
                </p>
              </div>
            ))}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">{language === 'fa' ? 'اندازه بازار' : 'Market Size'}</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><strong>TAM:</strong> {safeStr(result.targetAudienceAnalysis?.marketSize?.tam)}</div>
                <div><strong>SAM:</strong> {safeStr(result.targetAudienceAnalysis?.marketSize?.sam)}</div>
                <div><strong>SOM:</strong> {safeStr(result.targetAudienceAnalysis?.marketSize?.som)}</div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{safeStr(result.targetAudienceAnalysis?.marketSize?.methodology)}</p>
            </div>
          </div>
        )}

        {activeTab === 'value' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {language === 'fa' ? 'تحلیل ارزش پیشنهادی' : 'Value Proposition Analysis'}
            </h3>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <strong className="text-lg">{language === 'fa' ? 'ارزش اصلی:' : 'Core Value:'}</strong>
              <p className="mt-2">{safeStr(result.valuePropositionAnalysis?.coreValue)}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">{language === 'fa' ? 'مشکلات حل شده' : 'Problems Solved'}</h4>
              {safeArr(result.valuePropositionAnalysis?.problemsSolved).map((ps, idx) => (
                <div key={idx} className="mb-4 p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <strong>{safeStr(ps.problem)}</strong>
                    <span className={`px-2 py-1 rounded text-xs ${
                      ps.priority === 'high' ? 'bg-red-200 text-red-800' :
                      ps.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {safeStr(ps.priority)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{safeStr(ps.solution)}</p>
                  <p className="text-sm text-gray-600 mt-1"><em>{safeStr(ps.userImpact)}</em></p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-semibold mb-2">{language === 'fa' ? 'پیام‌های توصیه شده' : 'Recommended Messaging'}</h4>
              <ul className="list-disc list-inside space-y-1">
                {safeArr(result.valuePropositionAnalysis?.recommendedMessaging).map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {language === 'fa' ? 'تحلیل بازار' : 'Market Analysis'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">{language === 'fa' ? 'روندها' : 'Trends'}</h4>
                {safeArr(result.marketAnalysis?.trends).map((trend, idx) => (
                  <div key={idx} className="mb-2 text-sm">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      trend.impact === 'positive' ? 'bg-green-500' :
                      trend.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <strong>{safeStr(trend.trend)}</strong>
                    <p className="ml-4 text-gray-600">{safeStr(trend.relevance)}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2">{language === 'fa' ? 'فرصت‌ها' : 'Opportunities'}</h4>
                {safeArr(result.marketAnalysis?.opportunities).map((opp, idx) => (
                  <div key={idx} className="mb-2 text-sm">
                    <strong className="text-green-700">{safeStr(opp.opportunity)}</strong>
                    <p className="text-gray-600">
                      {language === 'fa' ? 'پتانسیل:' : 'Potential:'} {safeStr(opp.potential)} | 
                      {language === 'fa' ? ' زمان:' : ' Time:'} {safeStr(opp.timeToCapture)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold mb-2">{language === 'fa' ? 'تهدیدها' : 'Threats'}</h4>
              {safeArr(result.marketAnalysis?.threats).map((threat, idx) => (
                <div key={idx} className="mb-3 text-sm">
                  <strong className="text-red-700">{safeStr(threat.threat)}</strong>
                  <p className="text-gray-600">
                    {language === 'fa' ? 'شدت:' : 'Severity:'} {safeStr(threat.severity)} | 
                    {language === 'fa' ? ' احتمال:' : ' Likelihood:'} {safeStr(threat.likelihood)}
                  </p>
                  <p className="text-gray-700 mt-1">{language === 'fa' ? 'راه حل:' : 'Mitigation:'} {safeStr(threat.mitigation)}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <strong>{language === 'fa' ? 'پیش‌بینی رشد:' : 'Growth Projection:'}</strong>
              <p className="mt-2">{safeStr(result.marketAnalysis?.growthProjection)}</p>
            </div>
          </div>
        )}

        {activeTab === 'advantage' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {language === 'fa' ? 'مزیت رقابتی' : 'Competitive Advantage'}
            </h3>

            <div className="space-y-3">
              {safeArr(result.competitiveAdvantage?.advantages).map((adv, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <strong>{safeStr(adv.advantage)}</strong>
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded">{safeStr(adv.type)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{safeStr(adv.explanation)}</p>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      adv.strength === 'strong' ? 'bg-green-200 text-green-800' :
                      adv.strength === 'moderate' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {safeStr(adv.strength)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <strong className="block mb-2">{language === 'fa' ? 'خندق:' : 'Moat:'}</strong>
                <p className="text-sm">{safeStr(result.competitiveAdvantage?.moat)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <strong className="block mb-2">{language === 'fa' ? 'پایداری:' : 'Sustainability:'}</strong>
                <p className="text-sm">{safeStr(result.competitiveAdvantage?.sustainability)}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <strong className="block mb-2">{language === 'fa' ? 'قابلیت دفاع:' : 'Defensibility:'}</strong>
                <p className="text-sm">{safeStr(result.competitiveAdvantage?.defensibility)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {language === 'fa' ? 'ریسک‌ها و چالش‌ها' : 'Risks and Challenges'}
            </h3>

            <div>
              <h4 className="font-semibold mb-3">{language === 'fa' ? 'ریسک‌ها' : 'Risks'}</h4>
              {safeArr(result.risksAndChallenges?.risks).map((risk, idx) => (
                <div key={idx} className="mb-3 p-3 border-l-4 border-red-500 bg-red-50 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <strong>{safeStr(risk.risk)}</strong>
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded">{safeStr(risk.category)}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>{language === 'fa' ? 'احتمال:' : 'Probability:'}</strong> {safeStr(risk.probability)} | 
                      <strong className="ml-2">{language === 'fa' ? 'تاثیر:' : 'Impact:'}</strong> {safeStr(risk.impact)}
                    </p>
                    <p className="text-gray-700">
                      <strong>{language === 'fa' ? 'راه حل:' : 'Mitigation:'}</strong> {safeStr(risk.mitigation)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {safeArr(result.risksAndChallenges?.challenges).length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">{language === 'fa' ? 'چالش‌ها' : 'Challenges'}</h4>
                {safeArr(result.risksAndChallenges?.challenges).map((challenge, idx) => (
                  <div key={idx} className="mb-3 p-3 bg-yellow-50 rounded">
                    <strong>{safeStr(challenge.challenge)}</strong>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'fa' ? 'سختی:' : 'Difficulty:'} {safeStr(challenge.difficulty)} | 
                      {language === 'fa' ? ' زمان:' : ' Timeframe:'} {safeStr(challenge.timeframe)}
                    </p>
                    <p className="text-sm mt-1">{safeStr(challenge.approach)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {language === 'fa' ? 'توصیه‌های استراتژیک' : 'Strategic Recommendations'}
            </h3>

            <div>
              <h4 className="font-semibold mb-3 text-green-700">
                {language === 'fa' ? '⚡ پیروزی‌های سریع' : '⚡ Quick Wins'}
              </h4>
              {safeArr(result.strategicRecommendations?.quickWins).map((rec, idx) => (
                <div key={idx} className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <strong className="text-lg">{safeStr(rec.title)}</strong>
                    <span className="text-xs px-2 py-1 bg-green-200 rounded">
                      {language === 'fa' ? 'اولویت:' : 'Priority:'} {safeStr(rec.priority)}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{safeStr(rec.description)}</p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>{language === 'fa' ? 'دلیل:' : 'Rationale:'}</strong> {safeStr(rec.rationale)}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span><strong>{language === 'fa' ? 'تلاش:' : 'Effort:'}</strong> {safeStr(rec.effort)}</span>
                    <span><strong>{language === 'fa' ? 'زمان:' : 'Timeframe:'}</strong> {safeStr(rec.timeframe)}</span>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    <strong>{language === 'fa' ? 'تاثیر:' : 'Impact:'}</strong> {safeStr(rec.expectedImpact)}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-blue-700">
                {language === 'fa' ? '🎯 ابتکارات بلندمدت' : '🎯 Long-term Initiatives'}
              </h4>
              {safeArr(result.strategicRecommendations?.longTermInitiatives).map((rec, idx) => (
                <div key={idx} className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <strong className="text-lg">{safeStr(rec.title)}</strong>
                    <span className="text-xs px-2 py-1 bg-blue-200 rounded">
                      {language === 'fa' ? 'اولویت:' : 'Priority:'} {safeStr(rec.priority)}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{safeStr(rec.description)}</p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>{language === 'fa' ? 'دلیل:' : 'Rationale:'}</strong> {safeStr(rec.rationale)}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span><strong>{language === 'fa' ? 'تلاش:' : 'Effort:'}</strong> {safeStr(rec.effort)}</span>
                    <span><strong>{language === 'fa' ? 'زمان:' : 'Timeframe:'}</strong> {safeStr(rec.timeframe)}</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    <strong>{language === 'fa' ? 'تاثیر:' : 'Impact:'}</strong> {safeStr(rec.expectedImpact)}
                  </p>
                </div>
              ))}
            </div>

            {safeArr(result.strategicRecommendations?.keyMetrics).length > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2">{language === 'fa' ? 'معیارهای کلیدی' : 'Key Metrics'}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {safeArr(result.strategicRecommendations?.keyMetrics).map((metric, idx) => (
                    <li key={idx}>{metric}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
