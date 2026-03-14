# Prompt Engineering Guide - Quick Reference

Practical guide to crafting effective prompts for Claude. Extracted from Anthropic's official prompt engineering course and real-world prompting tutorials.

## What is Prompt Engineering?

The art and science of crafting instructions to elicit accurate, relevant, and useful responses from Claude. It's **iterative**—you write, test, refine, repeat.

The key insight: **Good prompts are engineered, not guessed.**

## The Prompt Engineering Lifecycle

```
1. Write a prompt
   ↓
2. Test with real examples
   ↓
3. Analyze failures and patterns
   ↓
4. Refine instructions
   ↓
5. Repeat until satisfactory
```

## Core Prompting Techniques

### 1. Clear Instructions (Specificity)

❌ Bad:
```
Analyze this customer feedback.
```

✅ Good:
```
Analyze the customer feedback below. Identify:
1. Main complaints or pain points
2. Sentiment (positive/negative/neutral)
3. Requested features or improvements
4. Urgency level (high/medium/low)

Format as a bulleted list.
```

**Lesson**: More specific = better outputs. Tell Claude exactly what you want.

### 2. Role and Context

Give Claude a role to play:

```
You are a technical support specialist with 10 years of experience.
You respond with empathy, clarity, and actionable solutions.

Customer issue: [problem here]

Respond with:
1. Acknowledgment of their problem
2. 2-3 troubleshooting steps
3. When to escalate to senior support
```

**Impact**: Role-playing helps Claude calibrate tone and depth.

### 3. Examples (Few-Shot Prompting)

Demonstrate the desired output format with examples:

```
Classify each review as positive, negative, or neutral.

Examples:
Input: "This product is amazing! Best purchase ever."
Output: positive

Input: "Broke after two days of normal use."
Output: negative

Input: "It's okay, nothing special."
Output: neutral

Now classify this:
Input: "Decent quality but overpriced for what you get."
Output:
```

**Power**: Examples are worth 10x more detailed instructions.

### 4. Output Format Specification

Explicitly state the format you want:

```
Generate 3 blog post titles about AI. Return as JSON:

{
  "titles": [
    "Title 1",
    "Title 2",
    "Title 3"
  ]
}
```

Or:

```
Respond in exactly this format:

TITLE: [your title]
SUMMARY: [2 sentences]
KEY POINTS:
- Point 1
- Point 2
- Point 3
```

**Why**: Structured output reduces parsing errors and enables automation.

### 5. Constraints and Guardrails

Set explicit boundaries:

```
Write a product description for an ergonomic mouse.

Constraints:
- Maximum 100 words
- Must include price range
- Cannot make health claims
- Use professional but friendly tone
```

**Benefit**: Prevents rambling and off-topic content.

### 6. Chain of Thought (Step-by-Step Reasoning)

Ask Claude to think through problems step-by-step:

```
A train travels 60 mph for 2 hours, then 80 mph for 3 hours.
What's the average speed?

Show your work:
1. Calculate distance for first segment
2. Calculate distance for second segment
3. Calculate total distance
4. Calculate total time
5. Divide total distance by total time
```

**Result**: More accurate reasoning and explainable outputs.

## Real-World Prompt Patterns

**Medical/Technical**: Add disclaimers + structured analysis requirements
**Customer Support**: Combine role + authority limits + escalation rules
**Content Generation**: Show style examples + format constraints + specific topics

## Parameter Tuning for Better Prompts

| Goal | Temperature | Strategy |
|------|-------------|----------|
| Factual accuracy | 0-0.3 | Low temp + explicit constraints |
| Consistency | 0-0.3 | Low temp + specific format |
| Creativity | 0.8-1 | Higher temp + fewer constraints |
| Balanced | 0.7 | Default, start here |

## Iterative Refinement Checklist

When a prompt doesn't work:

- [ ] Are instructions clear and specific?
- [ ] Did I provide examples?
- [ ] Is the output format explicit?
- [ ] Did I include relevant context/role?
- [ ] Are there ambiguous terms? (Define them)
- [ ] Did I test with edge cases?
- [ ] Is the goal actually achievable for the model?

## Prompt Anti-Patterns (Avoid These)

❌ **Too vague**:
```
"Tell me about Python"
```
→ Claude doesn't know if you want basics or advanced concepts.

❌ **Contradictory instructions**:
```
"Be concise but exhaustive"
```
→ Sends conflicting signals.

❌ **Unclear constraints**:
```
"Don't be too technical" (too subjective)
```
→ Better: "Explain as if to a 10-year-old" or "Use analogies, no jargon"

❌ **No examples for complex tasks**:
```
"Extract entities from this text"
```
→ Better: Show 2-3 examples of what good extraction looks like.

❌ **Assuming context**:
```
"Analyze it" (what is "it"?)
```
→ Always include full context.

## Tips for Discord Bot Prompts

Prompts that work well for educational Discord posts:

1. **Keep examples concrete**: "Here's a real workflow: [example]"
2. **Include "why" not just "what"**: Explain the benefit
3. **Add visual markers**: Use emojis or formatting for clarity
4. **One idea per post**: Don't mix 3 concepts
5. **End with actionable takeaway**: "Try this in your next project"

## Testing Your Prompts

Before shipping, test with:
- ✅ Best case input (should work)
- ✅ Ambiguous input (should ask for clarification)
- ✅ Edge cases (should handle gracefully)
- ✅ Different variations (should be consistent)

Example test suite for a sentiment analyzer:
```
Test 1: "I love this!" → Should classify as positive
Test 2: "It's fine" → Should classify as neutral
Test 3: "WORST PRODUCT EVER" → Should classify as negative
Test 4: "The price is high but quality is good" → Should classify as mixed
```

## Common Mistakes

- ❌ Writing one long prompt and hoping it works
- ❌ Not including examples for complex tasks
- ❌ Assuming Claude knows domain-specific terms
- ❌ Treating high temperature as always better for creativity
- ❌ Not testing with realistic data
- ❌ Overly polite ("If you would be so kind...") vs. direct instructions
- ❌ Mixing multiple unrelated tasks in one prompt

## Resources

- Anthropic prompt engineering guide: https://docs.anthropic.com/en/docs/build-a-claude-bot-with-tool-use
- Detailed techniques: https://docs.anthropic.com/en/docs/resources/prompt-engineering
- Prompt testing & evaluation: https://docs.anthropic.com/en/docs/guides/prompt-evaluation
- Real-world examples: Check the Anthropic courses repository
