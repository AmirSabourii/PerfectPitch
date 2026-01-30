# Deep Web Research Stage - طراحی کامل

## 🎯 هدف
جمع‌آوری اطلاعات جامع و واقعی از وب درباره:
- اندازه واقعی بازار (Market Size)
- رقبای مستقیم و غیرمستقیم
- ترندها و تحولات صنعت
- منابع معتبر و آمار رسمی
- سرمایه‌گذاری‌های اخیر در حوزه
- چالش‌های واقعی صنعت

---

## 📊 موقعیت در سیستم

### گزینه 1: Stage 0 (Pre-Analysis Research)
```
Stage 0: Deep Web Research
  ↓
Stage 1: Investor Simulation
  ↓
Stage 2: Decision Engine
  ↓
Stage 3: Final Investor Gate
```

**مزایا:**
- اطلاعات واقعی قبل از تحلیل جمع می‌شود
- Stage 1-3 می‌توانند از این داده‌ها استفاده کنند
- تحلیل دقیق‌تر با داده‌های واقعی

### گزینه 2: Stage 4 (Post-Analysis Validation)
```
Stage 1: Investor Simulation
  ↓
Stage 2: Decision Engine
  ↓
Stage 3: Final Investor Gate
  ↓
Stage 4: Deep Web Research & Validation
```

**مزایا:**
- ادعاهای پیچ را با واقعیت مقایسه می‌کند
- نقاط ضعف را با داده‌های واقعی نشان می‌دهد
- Fact-checking قدرتمند

**✅ پیشنهاد: Stage 0 (بهتر است)**

---

## 🔍 سیستم پرامپت

### System Prompt

```markdown
# ROLE: Deep Web Research Analyst

You are an expert research analyst specializing in startup market validation and competitive intelligence. Your job is to conduct comprehensive web research to gather REAL, FACTUAL data about the startup's market, competitors, and industry.

## YOUR MISSION

Given a startup's pitch deck information, you will:
1. Search the web for REAL market data, competitor information, and industry trends
2. Find CREDIBLE sources (reports, statistics, news, funding data)
3. Validate or challenge the startup's claims with actual data
4. Provide actionable intelligence for investors

## RESEARCH AREAS

### 1. MARKET SIZE & OPPORTUNITY
- Find actual market size data (TAM, SAM, SOM)
- Identify growth rates and projections
- Discover market trends and drivers
- Find credible sources (Gartner, Statista, CB Insights, etc.)

### 2. COMPETITIVE LANDSCAPE
- Identify direct competitors (same solution, same market)
- Identify indirect competitors (different solution, same problem)
- Find recent funding rounds in the space
- Discover market leaders and their traction

### 3. INDUSTRY TRENDS & INSIGHTS
- Recent news and developments
- Regulatory changes
- Technology shifts
- Customer behavior changes

### 4. VALIDATION & RED FLAGS
- Compare startup's claims with actual data
- Find contradicting evidence
- Identify market saturation signals
- Discover hidden challenges

### 5. CREDIBLE SOURCES & REPORTS
- Industry reports
- Market research publications
- Academic papers
- Government statistics
- Reputable news sources

## SEARCH STRATEGY

For each research area, you will:
1. Formulate 3-5 targeted search queries
2. Execute searches using available tools
3. Analyze and synthesize findings
4. Cite all sources with URLs
5. Rate source credibility (High/Medium/Low)

## OUTPUT REQUIREMENTS

You MUST return a comprehensive JSON object with:
- All findings organized by category
- Source URLs for every claim
- Credibility ratings
- Comparison with startup's claims
- Key insights and red flags

## CRITICAL RULES

1. **CITE EVERYTHING**: Every fact must have a source URL
2. **BE SKEPTICAL**: Question the startup's claims
3. **FIND NUMBERS**: Prioritize quantitative data
4. **RECENT DATA**: Prefer sources from last 2 years
5. **MULTIPLE SOURCES**: Verify important claims with 2+ sources
6. **NO HALLUCINATION**: If you can't find data, say "No data found"
```

### User Prompt Template

```markdown
# DEEP WEB RESEARCH REQUEST

## Startup Information (from Pitch Deck)

**Problem:** {extracted_problem}

**Solution:** {extracted_solution}

**Target Market:** {extracted_market}

**Market Size Claim:** {claimed_market_size}

**Competitors Mentioned:** {mentioned_competitors}

**Industry/Sector:** {industry}

**Geography:** {target_geography}

**Business Model:** {business_model}

---

## YOUR RESEARCH TASKS

### Task 1: Market Size Validation
Search for:
- Actual market size data for "{industry}" in "{geography}"
- Growth projections for the next 3-5 years
- Market segmentation data
- TAM/SAM/SOM estimates from credible sources

**Search Queries to Use:**
1. "{industry} market size {current_year}"
2. "{industry} market forecast {geography}"
3. "{specific_problem} market opportunity"

### Task 2: Competitive Intelligence
Search for:
- Direct competitors solving the same problem
- Indirect competitors with alternative solutions
- Recent funding rounds in this space
- Market leaders and their revenue/traction

**Search Queries to Use:**
1. "{solution_type} startups {geography}"
2. "{industry} competitors funding"
3. "companies solving {problem}"

### Task 3: Industry Trends & News
Search for:
- Recent news about this industry
- Technology trends affecting this market
- Regulatory changes
- Customer adoption patterns

**Search Queries to Use:**
1. "{industry} trends {current_year}"
2. "{industry} news latest"
3. "{technology} adoption rate"

### Task 4: Validation & Red Flags
Search for:
- Evidence supporting or contradicting startup's claims
- Failed startups in this space
- Market saturation indicators
- Known challenges in this industry

**Search Queries to Use:**
1. "{industry} challenges {current_year}"
2. "{similar_startup} failed why"
3. "{market} saturation"

### Task 5: Credible Sources & Reports
Search for:
- Industry reports (Gartner, Forrester, McKinsey, etc.)
- Market research (Statista, CB Insights, PitchBook)
- Academic research
- Government/regulatory data

**Search Queries to Use:**
1. "{industry} market report {current_year}"
2. "{industry} research study"
3. "{industry} statistics official"

---

## OUTPUT FORMAT

Return a JSON object with this EXACT structure:

```json
{
  "research_summary": {
    "startup_industry": "string",
    "research_date": "ISO date",
    "total_sources_found": "number",
    "credibility_score": "High/Medium/Low",
    "key_finding": "One sentence summary"
  },
  
  "market_size_research": {
    "claimed_by_startup": "string or null",
    "actual_data_found": [
      {
        "market_size": "string with number",
        "year": "number",
        "geography": "string",
        "source": "string",
        "source_url": "string",
        "credibility": "High/Medium/Low",
        "notes": "string"
      }
    ],
    "growth_projections": [
      {
        "projection": "string",
        "timeframe": "string",
        "source": "string",
        "source_url": "string"
      }
    ],
    "validation_verdict": "Confirmed/Overstated/Understated/Cannot Verify",
    "discrepancy_analysis": "string"
  },
  
  "competitive_landscape": {
    "direct_competitors": [
      {
        "company_name": "string",
        "description": "string",
        "funding_raised": "string or null",
        "last_funding_date": "string or null",
        "traction_metrics": "string or null",
        "source_url": "string",
        "threat_level": "High/Medium/Low"
      }
    ],
    "indirect_competitors": [
      {
        "company_name": "string",
        "alternative_approach": "string",
        "source_url": "string"
      }
    ],
    "market_leaders": [
      {
        "company_name": "string",
        "market_position": "string",
        "estimated_revenue": "string or null",
        "source_url": "string"
      }
    ],
    "recent_funding_activity": [
      {
        "company_name": "string",
        "amount": "string",
        "date": "string",
        "investors": "string",
        "source_url": "string"
      }
    ],
    "competitive_intensity": "Very High/High/Medium/Low",
    "market_saturation_signals": ["string"]
  },
  
  "industry_trends": {
    "major_trends": [
      {
        "trend": "string",
        "impact": "Positive/Negative/Neutral",
        "evidence": "string",
        "source_url": "string"
      }
    ],
    "technology_shifts": [
      {
        "technology": "string",
        "adoption_stage": "string",
        "relevance_to_startup": "string",
        "source_url": "string"
      }
    ],
    "regulatory_changes": [
      {
        "regulation": "string",
        "impact": "string",
        "source_url": "string"
      }
    ],
    "customer_behavior_insights": [
      {
        "insight": "string",
        "source_url": "string"
      }
    ]
  },
  
  "validation_findings": {
    "claims_validated": [
      {
        "startup_claim": "string",
        "validation_status": "Confirmed/Partially Confirmed/Contradicted",
        "evidence": "string",
        "source_url": "string"
      }
    ],
    "red_flags_discovered": [
      {
        "red_flag": "string",
        "severity": "Critical/High/Medium/Low",
        "evidence": "string",
        "source_url": "string"
      }
    ],
    "hidden_opportunities": [
      {
        "opportunity": "string",
        "evidence": "string",
        "source_url": "string"
      }
    ],
    "market_challenges": [
      {
        "challenge": "string",
        "impact": "string",
        "source_url": "string"
      }
    ]
  },
  
  "credible_sources": {
    "industry_reports": [
      {
        "title": "string",
        "publisher": "string",
        "publication_date": "string",
        "url": "string",
        "key_findings": "string"
      }
    ],
    "market_research": [
      {
        "title": "string",
        "source": "string",
        "url": "string",
        "relevance": "string"
      }
    ],
    "news_articles": [
      {
        "title": "string",
        "publication": "string",
        "date": "string",
        "url": "string",
        "summary": "string"
      }
    ],
    "academic_research": [
      {
        "title": "string",
        "authors": "string",
        "url": "string",
        "key_insight": "string"
      }
    ]
  },
  
  "investor_intelligence": {
    "investment_thesis_validation": "string (Does the market data support investing in this space?)",
    "timing_analysis": "string (Is now the right time for this startup?)",
    "risk_assessment": "string (What are the data-backed risks?)",
    "opportunity_score": "number 0-100",
    "recommended_due_diligence": ["string"],
    "questions_for_founders": ["string"]
  },
  
  "research_metadata": {
    "total_searches_performed": "number",
    "total_sources_reviewed": "number",
    "high_credibility_sources": "number",
    "data_freshness": "string (e.g., 'Most data from 2024-2025')",
    "research_limitations": ["string"],
    "confidence_level": "High/Medium/Low"
  }
}
```

---

## CRITICAL INSTRUCTIONS

1. **USE WEB SEARCH TOOLS**: You have access to web search. Use it extensively.

2. **MULTIPLE SEARCHES**: Perform at least 15-20 searches across all categories.

3. **VERIFY CLAIMS**: For every startup claim, try to find supporting or contradicting evidence.

4. **CITE EVERYTHING**: Every single data point must have a source URL.

5. **BE THOROUGH**: This is deep research, not surface-level. Dig deep.

6. **BE HONEST**: If you can't find data, say "No data found" - don't make it up.

7. **RECENT DATA**: Prioritize sources from 2023-2025.

8. **QUANTITATIVE FOCUS**: Numbers, statistics, and metrics are more valuable than opinions.

9. **CREDIBILITY MATTERS**: Rate every source (High/Medium/Low credibility).

10. **INVESTOR PERSPECTIVE**: Think like an investor doing due diligence.

---

Now, conduct your deep web research and return the complete JSON object.
```

---

## 🎨 UI Display Design

### Tab: "Deep Research" (در کنار Overview, Stage 1, 2, 3)

```typescript
// Component Structure
<DeepResearchDisplay>
  
  {/* Summary Card */}
  <ResearchSummaryCard>
    - Total Sources: 47
    - Credibility: High
    - Key Finding: "Market is growing 23% YoY but highly competitive"
  </ResearchSummaryCard>
  
  {/* Market Size Section */}
  <MarketSizeSection>
    <ComparisonCard>
      <StartupClaim>$50B market</StartupClaim>
      <ActualData>$38B (Gartner 2024)</ActualData>
      <Verdict>Overstated by 32%</Verdict>
    </ComparisonCard>
    
    <DataSourcesList>
      {sources.map(source => (
        <SourceCard credibility={source.credibility}>
          <SourceTitle>{source.title}</SourceTitle>
          <SourceLink>{source.url}</SourceLink>
          <SourceData>{source.data}</SourceData>
        </SourceCard>
      ))}
    </DataSourcesList>
  </MarketSizeSection>
  
  {/* Competitors Section */}
  <CompetitorsSection>
    <CompetitorGrid>
      {competitors.map(comp => (
        <CompetitorCard threatLevel={comp.threat}>
          <CompanyName>{comp.name}</CompanyName>
          <Funding>{comp.funding}</Funding>
          <Traction>{comp.traction}</Traction>
          <SourceLink>{comp.url}</SourceLink>
        </CompetitorCard>
      ))}
    </CompetitorGrid>
  </CompetitorsSection>
  
  {/* Trends Section */}
  <TrendsSection>
    <TrendsList>
      {trends.map(trend => (
        <TrendCard impact={trend.impact}>
          <TrendTitle>{trend.trend}</TrendTitle>
          <Impact>{trend.impact}</Impact>
          <Evidence>{trend.evidence}</Evidence>
          <Source>{trend.url}</Source>
        </TrendCard>
      ))}
    </TrendsList>
  </TrendsSection>
  
  {/* Red Flags Section */}
  <RedFlagsSection>
    <RedFlagsList>
      {redFlags.map(flag => (
        <RedFlagCard severity={flag.severity}>
          <FlagIcon severity={flag.severity} />
          <FlagText>{flag.red_flag}</FlagText>
          <Evidence>{flag.evidence}</Evidence>
          <Source>{flag.url}</Source>
        </RedFlagCard>
      ))}
    </RedFlagsList>
  </RedFlagsSection>
  
  {/* Sources Library */}
  <SourcesLibrary>
    <Tabs>
      <Tab>Industry Reports (12)</Tab>
      <Tab>Market Research (8)</Tab>
      <Tab>News Articles (18)</Tab>
      <Tab>Academic (5)</Tab>
    </Tabs>
    
    <SourcesList>
      {sources.map(source => (
        <SourceItem>
          <SourceTitle>{source.title}</SourceTitle>
          <Publisher>{source.publisher}</Publisher>
          <Date>{source.date}</Date>
          <Link href={source.url}>View Source →</Link>
          <KeyFindings>{source.key_findings}</KeyFindings>
        </SourceItem>
      ))}
    </SourcesList>
  </SourcesLibrary>
  
  {/* Investor Intelligence */}
  <InvestorIntelligence>
    <InvestmentThesis>{data.investment_thesis_validation}</InvestmentThesis>
    <TimingAnalysis>{data.timing_analysis}</TimingAnalysis>
    <RiskAssessment>{data.risk_assessment}</RiskAssessment>
    <OpportunityScore score={data.opportunity_score} />
    <DueDiligenceChecklist items={data.recommended_due_diligence} />
    <FounderQuestions questions={data.questions_for_founders} />
  </InvestorIntelligence>
  
</DeepResearchDisplay>
```

---

## 💰 Cost & Performance

### Estimated Costs per Analysis

**With GPT-4:**
- 15-20 web searches: ~$0.50-1.00
- Deep analysis (10K tokens input, 5K output): ~$0.50
- **Total: ~$1.00-1.50 per deep research**

**With GPT-4o-mini:**
- Same searches: ~$0.10-0.20
- Analysis: ~$0.05
- **Total: ~$0.15-0.25 per deep research**

### Performance
- Execution time: 60-120 seconds (due to multiple searches)
- Can be run async/background
- Cache results for 24 hours

---

## 🔄 Integration Options

### Option A: Automatic (Recommended)
```typescript
// در API route
const stage0 = await runDeepWebResearch(pitchDeckContent)
const stage1 = await runStage1(pitchDeckContent, stage0) // استفاده از نتایج
const stage2 = await runStage2(stage1, stage0)
const stage3 = await runStage3(stage2, stage0)
```

### Option B: Optional (User Choice)
```typescript
// User can enable/disable deep research
if (userWantsDeepResearch) {
  const deepResearch = await runDeepWebResearch(pitchDeckContent)
  // Show in separate tab
}
```

### Option C: Background (Async)
```typescript
// Start deep research in background
const analysisPromise = runMainAnalysis(pitchDeckContent)
const researchPromise = runDeepWebResearch(pitchDeckContent)

const [analysis, research] = await Promise.all([analysisPromise, researchPromise])
```

---

## 📈 Value Proposition

### برای Investors:
✅ داده‌های واقعی بازار (نه ادعاهای استارتاپ)
✅ رقبای واقعی و funding آن‌ها
✅ Red flags مبتنی بر داده
✅ سوالات هوشمند برای پرسیدن از فاندر
✅ Due diligence سریع‌تر

### برای Startups:
✅ می‌بینند چه اطلاعاتی در دسترس عموم است
✅ می‌توانند ادعاهای خود را با واقعیت تطبیق دهند
✅ رقبای جدید کشف می‌کنند
✅ Blind spots خود را می‌بینند

---

## 🎯 Success Metrics

یک Deep Research موفق باید:
- ✅ حداقل 30 منبع معتبر پیدا کند
- ✅ حداقل 5 رقیب مستقیم شناسایی کند
- ✅ داده‌های کمی (اعداد) برای market size داشته باشد
- ✅ حداقل 3 منبع با credibility بالا داشته باشد
- ✅ ادعاهای اصلی استارتاپ را validate یا challenge کند

---

## 🚀 Implementation Priority

### Phase 1: MVP (Week 1)
- ✅ Basic web search integration
- ✅ Market size research
- ✅ Competitor discovery
- ✅ Simple JSON output

### Phase 2: Enhanced (Week 2)
- ✅ Advanced search strategies
- ✅ Source credibility rating
- ✅ Claim validation
- ✅ UI components

### Phase 3: Advanced (Week 3)
- ✅ Caching & optimization
- ✅ Background processing
- ✅ Export to PDF
- ✅ Integration with Stage 1-3

---

## 💡 نتیجه‌گیری

این سیستم Deep Web Research:

**✅ مزایا:**
1. داده‌های واقعی و قابل اعتماد
2. Fact-checking قدرتمند
3. Competitive intelligence جامع
4. ارزش افزوده بالا برای investors
5. تمایز از رقبا

**⚠️ چالش‌ها:**
1. هزینه بالاتر ($1-1.5 per analysis)
2. زمان بیشتر (60-120 ثانیه)
3. نیاز به web search API
4. کیفیت بستگی به نتایج search دارد

**🎯 پیشنهاد:**
این feature را به عنوان **Premium Add-on** ارائه دهید:
- Basic Analysis: بدون Deep Research
- Premium Analysis: با Deep Research (+$2-3)
- Enterprise: Unlimited Deep Research

این باعث می‌شود هم درآمد بیشتری داشته باشید و هم کاربران ارزش واقعی را ببینند.
