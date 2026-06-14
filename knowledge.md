# PixelTrade Night Office — Self-Evolving Knowledge Loop Architecture
> **Agent Identity:** Autonomous Full-Stack AI Developer & Financial Analyst Agent  
> **Version:** 2.0 — Enhanced Self-Evolving Edition  
> **Last Revised:** Dynamic (auto-updated on each learning cycle)

---

## 1. Core Philosophy — The Neural Memory

Do not just execute and forget. Every time you analyze financial news, debug a Next.js component, or structure Laravel logic, you must **reflect on the outcome**. You will document operational rules, discovered patterns, and trading logic into a persistent MySQL database. This acts as your **expanding long-term memory**.

> **Guiding Principle:** Knowledge that is not validated is just a hypothesis. Knowledge that is not decayed is a liability. Knowledge that is not linked is an island.

Every insight must be:
- **Earned** — derived from real execution, not assumption
- **Validated** — tested against real outcomes and marked correct/incorrect
- **Connected** — linked causally to the event that produced it
- **Time-aware** — expired when market regime or context changes
- **Promotable** — elevated to Core Rules when proven repeatedly useful

---

## 2. Database Schema Definition

### 2.1 Primary Table: `agent_knowledges`

The main long-term memory store. Every insight, rule, and learned pattern lives here.

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | bigIncrements | — | Primary key |
| `category` | string | required | e.g. `portfolio_strategy`, `code_structure`, `news_sentiment`, `ui_rules`, `meta_synthesis` |
| `topic` | string | required | The core subject of the insight |
| `learned_fact` | longText | required | Condensed 2–3 sentence rule or insight. Must be concise to save token context during retrieval |
| `context_metadata` | json | `{}` | Structured environment snapshot at time of learning (see §2.3) |
| `confidence_score` | int | `1` | Increments when knowledge proves useful. Decrements on wrong prediction or staleness |
| `usage_count` | int | `0` | Tracks how many times this knowledge was retrieved |
| `is_core_rule` | boolean | `false` | Promoted to Core Rule when `confidence_score > 8` AND `usage_count > 10` |
| `is_superseded_by` | foreignId nullable | `null` | Points to a newer `agent_knowledges.id` that replaces this entry |
| `valid_until` | timestamp nullable | `null` | After this datetime, confidence auto-decays |
| `decay_rate` | float | `0.1` | Confidence points lost per day after `valid_until` |
| `contradiction_log` | json | `[]` | Array of `knowledge_id` values that conflict with this entry |
| `last_validated_at` | timestamp | `now()` | Last time this knowledge was confirmed still accurate |
| `environment_hash` | string | — | MD5 hash of market regime + VIX range at time of learning, for context-matched retrieval |
| `prediction_made` | text nullable | `null` | What the agent predicted when this knowledge was applied |
| `prediction_result` | enum | `pending` | `correct`, `incorrect`, `partial`, `pending` |
| `result_recorded_at` | timestamp nullable | `null` | When prediction outcome was confirmed |
| `parent_knowledge_id` | foreignId nullable | `null` | Causal chain: what knowledge led to this one |
| `triggered_by_event` | string nullable | `null` | e.g. `fed_rate_hike`, `earnings_miss`, `ui_regression`, `rss_parse_error` |
| `outcome_observed` | text nullable | `null` | The real-world result observed after applying this knowledge |
| `created_at` | timestamp | auto | — |
| `updated_at` | timestamp | auto | — |

---

### 2.2 Laravel Eloquent Model

```php
// app/Models/AgentKnowledge.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class AgentKnowledge extends Model
{
    protected $fillable = [
        'category', 'topic', 'learned_fact', 'context_metadata',
        'confidence_score', 'usage_count', 'is_core_rule',
        'is_superseded_by', 'valid_until', 'decay_rate',
        'contradiction_log', 'last_validated_at', 'environment_hash',
        'prediction_made', 'prediction_result', 'result_recorded_at',
        'parent_knowledge_id', 'triggered_by_event', 'outcome_observed',
    ];

    protected $casts = [
        'context_metadata'   => 'array',
        'contradiction_log'  => 'array',
        'is_core_rule'       => 'boolean',
        'valid_until'        => 'datetime',
        'last_validated_at'  => 'datetime',
        'result_recorded_at' => 'datetime',
    ];

    // ─── Scopes ───────────────────────────────────────────────

    public function scopeHighConfidence(Builder $q, int $min = 5): Builder
    {
        return $q->where('confidence_score', '>=', $min);
    }

    public function scopeFromCategories(Builder $q, array $cats): Builder
    {
        return $q->whereIn('category', $cats);
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->whereNull('is_superseded_by')
                 ->where('prediction_result', '!=', 'incorrect');
    }

    public function scopeForEnvironment(Builder $q, string $hash): Builder
    {
        return $q->where('environment_hash', $hash);
    }

    public function scopeCoreRules(Builder $q): Builder
    {
        return $q->where('is_core_rule', true);
    }

    // ─── Helpers ──────────────────────────────────────────────

    public function markCorrect(): void
    {
        $this->increment('confidence_score', 2);
        $this->increment('usage_count');
        $this->update([
            'prediction_result'  => 'correct',
            'result_recorded_at' => now(),
            'last_validated_at'  => now(),
        ]);
        $this->promoteIfEligible();
    }

    public function markIncorrect(string $counterFact): void
    {
        $this->decrement('confidence_score', 3);
        $this->update([
            'prediction_result'  => 'incorrect',
            'result_recorded_at' => now(),
        ]);
        // Auto-create counter-knowledge
        self::create([
            'category'            => $this->category,
            'topic'               => 'COUNTER: ' . $this->topic,
            'learned_fact'        => $counterFact,
            'parent_knowledge_id' => $this->id,
            'triggered_by_event'  => 'prediction_failure',
            'context_metadata'    => $this->context_metadata,
            'confidence_score'    => 3,
        ]);
    }

    public function promoteIfEligible(): void
    {
        if ($this->confidence_score > 8 && $this->usage_count > 10) {
            $this->update(['is_core_rule' => true]);
        }
    }

    public function supersede(int $newKnowledgeId): void
    {
        $this->update(['is_superseded_by' => $newKnowledgeId]);
    }
}
```

---

### 2.3 Context Metadata — Standard JSON Fingerprint

Every `context_metadata` JSON field **must** follow this structure to enable precision retrieval by market regime:

```json
{
  "market_regime": "bear | bull | sideways",
  "vix_level": 18.5,
  "portfolio_heat": 0.73,
  "news_sentiment_score": -0.2,
  "dominant_sector": "technology | energy | financials | ...",
  "fed_stance": "hawkish | dovish | neutral",
  "code_file_affected": "components/Portfolio/Chart.tsx",
  "git_commit_ref": "abc123",
  "api_endpoint_used": "/api/v1/portfolio/summary",
  "session_type": "night_office | market_open | post_close"
}
```

**Environment Hash Generation:**
```php
$hash = md5($marketRegime . '_' . floor($vixLevel / 5) * 5);
// Groups VIX into bands: 0-5, 5-10, 10-15, 15-20, etc.
// Ensures similar environments match even with slight value differences
```

---

## 3. The 6-Step Continuous Learning Protocol

For **every task** processed, the agent silently executes this background protocol:

### Step 1 — Ingest & Execute
Perform the user's requested task (parsing RSS feeds, updating UI, analyzing portfolio data, debugging Laravel code). Execute fully and collect all outputs, errors, and API responses.

### Step 2 — Analyze & Reflect
Ask internally:
- *"What new pattern, strategy, or codebase rule did I just formulate?"*
- *"What mistake should I avoid next time?"*
- *"Does this contradict anything I already know?"*
- *"What market regime was active when I learned this?"*

### Step 3 — Persist
Formulate a brief, high-value insight. Generate the Eloquent logic to insert into `agent_knowledges`. Check for contradictions first:

```php
// Check for conflicts before inserting
$existing = AgentKnowledge::where('category', $category)
    ->where('topic', $topic)
    ->active()
    ->first();

if ($existing && $this->contradicts($existing, $newFact)) {
    $existing->update([
        'contradiction_log' => array_merge(
            $existing->contradiction_log ?? [],
            ['pending_review' => $newFact]
        )
    ]);
} else {
    AgentKnowledge::create([
        'category'           => $category,
        'topic'              => $topic,
        'learned_fact'       => $learnedFact,
        'context_metadata'   => $contextFingerprint,
        'environment_hash'   => $environmentHash,
        'triggered_by_event' => $triggerEvent,
        'prediction_made'    => $predictionIfAny,
        'confidence_score'   => 1,
    ]);
}
```

### Step 4 — Retrieve & Inject (Pre-computation)
Before answering future queries, query the top insights for the relevant category **and** current environment hash:

```php
$priorKnowledge = AgentKnowledge::active()
    ->fromCategories([$relevantCategory])
    ->forEnvironment($currentEnvHash)
    ->orderByDesc('confidence_score')
    ->limit(5)
    ->get();

// Also inject Core Rules unconditionally
$coreRules = AgentKnowledge::coreRules()
    ->fromCategories([$relevantCategory])
    ->get();
```

Inject these facts into working memory before generating any response.

### Step 5 — Validate & Close the Loop
After an action produces an observable outcome (trade result, UI rendering success/failure, API response quality), record the prediction result:

```php
// Outcome was correct
$knowledge->markCorrect();

// Outcome was wrong — auto-generates counter-knowledge
$knowledge->markIncorrect('The correct rule is: ...');
```

> This step is what separates a **learning agent** from a **logging agent**. Without Step 5, knowledge grows but never improves.

### Step 6 — Audit & Promote
Weekly automated review. Knowledge that proves itself repeatedly gets promoted to Core Rules and injected into every future prompt automatically:

```php
// Scheduled: every Sunday 02:00 (Night Office cycle)
AgentKnowledge::active()
    ->where('confidence_score', '>', 8)
    ->where('usage_count', '>', 10)
    ->update(['is_core_rule' => true]);
```

---

## 4. Autonomous Discovery Mandate

The agent is expected to learn **dynamically and continuously** without human instruction. Whether analyzing a live stock portfolio, reading macroeconomic data, or building a new UI component, the agent must:

1. **Autonomously extract** the current context using the standard JSON fingerprint
2. **Form a strategy or rule** based on that specific moment in time
3. **Save it immediately** — never defer persistence to a later step
4. **Link it causally** — always record `parent_knowledge_id` and `triggered_by_event`
5. **Predict an outcome** — even a soft prediction, to enable feedback closure

Over time, the `agent_knowledges` table becomes a **highly personalized, context-aware intelligence engine** built entirely from the agent's own observations and validated executions.

---

## 5. Decay & Staleness Mechanism

Financial knowledge has a short shelf-life. The system actively expires outdated knowledge rather than letting it pollute future reasoning.

### Scheduled Job: Daily Decay

```php
// app/Console/Commands/DecayStaleKnowledge.php

class DecayStaleKnowledge extends Command
{
    protected $signature = 'agent:decay-knowledge';

    public function handle(): void
    {
        // Reduce confidence for knowledge not validated in 7+ days
        AgentKnowledge::where('last_validated_at', '<', now()->subDays(7))
            ->where('is_core_rule', false)
            ->each(function ($k) {
                $newScore = max(0, $k->confidence_score - $k->decay_rate * 7);
                $k->update(['confidence_score' => $newScore]);

                // Archive if confidence hits zero
                if ($newScore <= 0) {
                    $k->update(['is_superseded_by' => -1]); // -1 = archived
                }
            });

        // Force-expire knowledge past valid_until
        AgentKnowledge::whereNotNull('valid_until')
            ->where('valid_until', '<', now())
            ->update(['is_superseded_by' => -1]);
    }
}
```

---

## 6. Contradiction Resolution Protocol

When new knowledge conflicts with existing knowledge, the system does not silently overwrite. Instead:

```
New Fact Arrives
      │
      ▼
Search existing active knowledge for same category + topic
      │
      ├─ No conflict → INSERT normally (Step 3)
      │
      └─ Conflict detected
            │
            ├─ New fact has higher context confidence
            │     → Supersede old: old.is_superseded_by = new.id
            │
            ├─ Both have equal confidence
            │     → Log both in contradiction_log, flag for human review
            │
            └─ Old fact is a Core Rule
                  → Never auto-supersede Core Rules
                  → Queue for manual validation with full evidence
```

---

## 7. Causal Chain & Knowledge Graph

Every piece of knowledge is linked to what caused it and what it leads to, forming a traversable graph:

```
fed_rate_hike (triggered_by_event)
      │
      ▼
[knowledge: "Tech stocks underperform 2 weeks post hike"]  ← parent
      │
      ▼
[knowledge: "Rotate to energy/financials during hike cycle"]  ← child
      │
      ▼
[knowledge: "XLE and XLF ETFs show +4% avg during rate hike months"]  ← grandchild
```

Traversal query:
```php
// Get full causal chain for a knowledge entry
function getKnowledgeChain(int $id, int $depth = 3): Collection
{
    return AgentKnowledge::where('parent_knowledge_id', $id)
        ->with(['children' => fn($q) => $q->limit($depth)])
        ->get();
}
```

---

## 8. Cross-Category Meta-Synthesis Engine

Every night at 02:00 (Night Office theme), the agent synthesizes insights across all categories into high-level strategic rules:

```php
// app/Console/Commands/SynthesizeKnowledge.php

public function handle(): void
{
    $inputs = AgentKnowledge::active()
        ->highConfidence(6)
        ->fromCategories(['portfolio_strategy', 'news_sentiment', 'ui_rules', 'code_structure'])
        ->orderByDesc('confidence_score')
        ->limit(15)
        ->get()
        ->map(fn($k) => "[{$k->category}] {$k->topic}: {$k->learned_fact}")
        ->join("\n");

    $synthesis = $this->callClaudeAPI(
        "You are a meta-analyst. Given these operational insights from a trading agent,
         synthesize 3 overarching strategic rules that unify multiple observations.
         Be concise. Output JSON array of {topic, learned_fact}.\n\n{$inputs}"
    );

    foreach ($synthesis as $insight) {
        AgentKnowledge::create([
            'category'           => 'meta_synthesis',
            'topic'              => $insight['topic'],
            'learned_fact'       => $insight['learned_fact'],
            'triggered_by_event' => 'nightly_synthesis',
            'confidence_score'   => 5, // Starts higher — synthesized from proven facts
            'context_metadata'   => ['source_count' => 15, 'synthesis_date' => now()],
        ]);
    }
}
```

---

## 9. Knowledge Categories Reference

| Category | Description | Decay Rate | Max Useful Age |
|---|---|---|---|
| `portfolio_strategy` | Trade rules, sector rotation, position sizing | 0.2/day | 14 days |
| `news_sentiment` | Market reaction patterns to specific news types | 0.3/day | 7 days |
| `code_structure` | Laravel/Next.js architecture patterns, reusable patterns | 0.02/day | 180 days |
| `ui_rules` | Component rendering rules, layout decisions | 0.05/day | 90 days |
| `api_behavior` | External API quirks, rate limits, response formats | 0.1/day | 30 days |
| `meta_synthesis` | Cross-category high-level strategy | 0.05/day | 60 days |
| `error_patterns` | Bugs, failure modes, debugging lessons | 0.01/day | 365 days |
| `market_regime` | Bull/bear/sideways detection signals | 0.15/day | 21 days |

---

## 10. Core Rules Injection (Auto-Prompt Enhancement)

When a task is about to be processed, Core Rules are automatically prepended to the working context:

```php
public function buildAgentContext(string $category): string
{
    $coreRules = AgentKnowledge::coreRules()
        ->fromCategories([$category, 'meta_synthesis'])
        ->orderByDesc('confidence_score')
        ->limit(5)
        ->get()
        ->map(fn($k) => "• [{$k->topic}]: {$k->learned_fact}")
        ->join("\n");

    return "=== AGENT CORE RULES (Proven & Validated) ===\n{$coreRules}\n\n";
}
```

These rules are **not suggestions** — they are proven patterns promoted from repeated validation. The agent must respect them unless a strong contradicting signal is present.

---

## 11. Migration File

```php
// database/migrations/xxxx_create_agent_knowledges_table.php

Schema::create('agent_knowledges', function (Blueprint $table) {
    $table->id();
    $table->string('category')->index();
    $table->string('topic');
    $table->longText('learned_fact');
    $table->json('context_metadata')->default('{}');
    $table->integer('confidence_score')->default(1);
    $table->integer('usage_count')->default(0);
    $table->boolean('is_core_rule')->default(false)->index();
    $table->foreignId('is_superseded_by')->nullable()->constrained('agent_knowledges')->nullOnDelete();
    $table->timestamp('valid_until')->nullable();
    $table->float('decay_rate')->default(0.1);
    $table->json('contradiction_log')->default('[]');
    $table->timestamp('last_validated_at')->nullable();
    $table->string('environment_hash')->nullable()->index();
    $table->text('prediction_made')->nullable();
    $table->enum('prediction_result', ['correct', 'incorrect', 'partial', 'pending'])->default('pending');
    $table->timestamp('result_recorded_at')->nullable();
    $table->foreignId('parent_knowledge_id')->nullable()->constrained('agent_knowledges')->nullOnDelete();
    $table->string('triggered_by_event')->nullable()->index();
    $table->text('outcome_observed')->nullable();
    $table->timestamps();

    $table->index(['category', 'confidence_score']);
    $table->index(['environment_hash', 'category']);
    $table->index(['is_core_rule', 'category']);
});
```

---

## 12. Summary — What Makes This Architecture Self-Evolving

```
  EXECUTE TASK
       │
       ▼
  FINGERPRINT CONTEXT ──────────────────────────────────────────────────────┐
  (market regime, VIX, portfolio heat, session type)                        │
       │                                                                     │
       ▼                                                                     │
  RETRIEVE PRIOR KNOWLEDGE                                                   │
  (by category + environment_hash + Core Rules)                             │
       │                                                                     │
       ▼                                                                     │
  GENERATE RESPONSE / CODE / ANALYSIS                                       │
  with prior knowledge injected                                             │
       │                                                                     │
       ▼                                                                     │
  REFLECT → FORMULATE INSIGHT                                               │
       │                                                                     │
       ├─ Contradiction? ──→ Resolution Protocol                            │
       │                                                                     │
       ▼                                                                     │
  PERSIST TO agent_knowledges                                               │
  (with causal link + environment hash + prediction)                        │
       │                                                                     │
       ▼                                                                     │
  OBSERVE OUTCOME                                                           │
       │                                                                     │
       ├─ Correct  → +2 confidence, check promotion                        │
       └─ Incorrect → -3 confidence, auto-create counter-knowledge          │
                                                                             │
  NIGHTLY: Decay stale, Synthesize meta-rules, Promote Core Rules ─────────┘
```

> The agent does not just remember. It **validates, connects, decays, synthesizes, and promotes**. Over time, the knowledge base becomes a precision instrument — not a graveyard of stale facts.