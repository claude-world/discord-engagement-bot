# Anthropic API Fundamentals - Quick Reference

A practical reference guide for building with Claude API. Extract key concepts from Anthropic's official educational course.

## Required Parameters

Every API request to Claude requires exactly **three parameters**:

1. **model** - Which Claude version to use (e.g., `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`)
2. **max_tokens** - Maximum tokens Claude can generate in response
3. **messages** - Array of message objects with `role` and `content`

```python
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Your prompt here"}
    ]
)
```

## Understanding Tokens

- Claude doesn't think in full words but in token fragments
- Roughly: 1 token ≈ 4 characters or 0.75 words in English
- `max_tokens` sets the hard limit on response length
- Hitting the limit truncates response and sets `stop_reason: "max_tokens"`

**Practical tip**: Set `max_tokens` slightly higher than your target length to avoid truncation.

## Model Selection

| Model | Best For | Speed | Cost |
|-------|----------|-------|------|
| Haiku 3.5 | Simple tasks, fast responses | Fastest | Lowest |
| Sonnet 3.5 | General purpose (default recommendation) | Balanced | Balanced |
| Opus 4 | Complex reasoning, analysis | Slowest | Highest |

## Core Parameters

### Temperature (0 to 1)

Controls randomness in responses. Default: 1.

- **Temperature = 0**: Deterministic, consistent outputs (pick most probable token)
- **Temperature = 0.5**: Balanced, predictable but with variation
- **Temperature = 1**: Creative, diverse outputs

**Use cases**:
- Temperature 0-0.3: Factual answers, structured data, consistency required
- Temperature 0.5-0.8: Normal conversations, content generation
- Temperature 1: Creative writing, brainstorming, ideation

Example: Asking Claude to name an alien planet 3 times:
- At T=0: "Xendor", "Xendor", "Xendor" (identical)
- At T=1: "Xyron", "Xandar", "Zyrcon" (all different)

### Stop Sequences

Strings that, when generated, halt output immediately. Useful for:
- Stopping after first JSON object
- Preventing verbose explanations
- Extracting structured outputs

```python
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=500,
    stop_sequences=["}"],  # Stop after first JSON object
    messages=[
        {"role": "user", "content": "Generate a JSON person object"}
    ]
)
```

Check `response.stop_reason` to see what caused termination:
- `"end_turn"`: Natural completion
- `"max_tokens"`: Hit token limit
- `"stop_sequence"`: Hit a stop sequence

## Message Structure

Claude uses a **conversation format** - alternate between user and assistant:

```python
messages=[
    {"role": "user", "content": "What is Python?"},
    {"role": "assistant", "content": "Python is a programming language..."},
    {"role": "user", "content": "Give me a code example"}
]
```

Each turn builds context. Claude sees the full conversation history.

## Response Structure

```python
response.content[0].text  # The actual response text
response.stop_reason      # Why generation stopped
response.usage.input_tokens      # Tokens consumed from prompt
response.usage.output_tokens     # Tokens generated in response
```

## Best Practices

1. **Include system context** - Use the first user message or dedicated system parameter to set tone/constraints
2. **Be explicit** - Clear instructions beat hoping Claude "gets it"
3. **Set reasonable max_tokens** - Too low = truncation, too high = wasted compute
4. **Check stop_reason** - Verify why the response ended; may indicate issues
5. **Use stop sequences sparingly** - Mainly for structured output extraction
6. **Iterate temperature** - Start at 0.7, adjust based on consistency needs

## Vision (Image) Prompting

Pass images as base64 or URLs:

```python
messages=[
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": base64_string
                }
            }
        ]
    }
]
```

Claude can analyze photos, diagrams, charts, screenshots.

## Streaming

Get responses token-by-token instead of waiting for full completion:

```python
with client.messages.stream(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=messages
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

Use for: long responses, real-time UI updates, better perceived latency.

## Common Mistakes

- ❌ Forgetting `max_tokens` parameter
- ❌ Setting `max_tokens` too low (truncates mid-sentence)
- ❌ Switching temperature without reason (affects reproducibility)
- ❌ Not checking `stop_reason` (missing truncation indicators)
- ❌ Treating single messages as stateless (Claude sees conversation history)

## Resources

- Official API docs: https://docs.anthropic.com
- Model capabilities matrix: https://docs.anthropic.com/en/docs/about/models
- Rate limits and pricing: https://docs.anthropic.com/en/docs/resources/rate-limits
