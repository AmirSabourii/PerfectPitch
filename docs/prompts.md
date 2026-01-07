# Prompt Inventory

Collected system prompts and role definitions in one place.

## Realtime Role Personas (`app/api/realtime/sessions/route.ts`)
- `vc`: Tier-1 VC, critical, starts conversation, drills into provided context.
- `mentor`: YC mentor, supportive but honest, starts with thoughts referencing pitch.
- `brainstorm`: Creative co-founder, energetic "yes, and...", starts immediately.
- `practice`: Rapid-fire question bot, asks 10 tough questions back-to-back.
- `founder_test`: Board evaluator, cold/intimidating, probes leadership psyche.
- All roles get context injection (stage, industry, targetAudience, analysisSummary, risks, pitch_transcript, documentContext) plus a system note to use that context and start first.

## Realtime Session System Instructions (base)
Appended per request in `realtime/sessions`:
- Core persona text (role above)
- `=== CONTEXT ===` block including stage/industry/targetAudience, analysis summary, risks, transcript (truncated), document context (truncated)
- `=== IMPORTANT: STARTING THE CALL ===` — must greet first and prove awareness of context.

## Realtime SDP Call (client) (`components/RealtimeConversation.tsx`)
- Creates a response with modalities `["audio","text"]` and instructions: “Greet the founder. Start immediately. Say something like "Okay, I've reviewed your pitch..."”.

## Chat Q&A System Prompt (`app/api/chat/route.ts`)
Persona: Tough Tier-1 VC running live Q&A.
- Uses `pitchContext` (summary, weak_points, red_flags, prepared questions).
- Direct, critical, interrupts vague answers, challenges assumptions.
- If `isInitial`: start immediately with a prepared or challenging question; else continue tough.

## Deep Analysis Prompt (`lib/aiAnalyzer.ts`)
Persona: World-class VC Analyst & Pitch Coach (Partner at Sequoia/a16z), skeptical.
- Uses stage, industry, targetAudience.
- 6-Pillar framework (Structure, Clarity, Logical Flow, Persuasiveness, Audience Fit, Final Score).
- Cross-check transcript vs slides; flag contradictions.
- Output enforced JSON schema with scores, risks, strengths, weaknesses, action items, assets, and pillar breakdown.

## Transcription Prompt (`app/api/transcribe/route.ts`)
- Whisper call prompt: “Startup pitch, technical, venture capital, SaaS, revenue, growth, slides, English speech.”

