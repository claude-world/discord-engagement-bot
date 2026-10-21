# Anthropic API Fundamentals - Quick Reference

A practical reference guide for building with Claude API. Extract key concepts from Anthropic's official educational course.

## Required Parameters

Every API request to Claude requires exactly **three parameters**:

1. **model** - Which Claude version to use (e.g., `claude-sonnet-5-5`, `claude-haiku-5-5`)
2. **max_tokens** - Maximum tokens Claude can generate in response
3. **messages** - Array of message objects with `role` and `content`

```python
response = client.messages.create(
    model="claude-sonnet-5-5",
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

Descriptions and prices are from Anthropic's pricing page (input / output per million tokens):

| Model | API ID | Best For | Price |
|-------|--------|----------|-------|
| Haiku 5.5 | `claude-haiku-5-5` | High-volume, latency-sensitive tasks such as classification, extraction, and routing | $0.10 / $0.50 (prompts up to 100K tokens) |
| Sonnet 5.5 | `claude-sonnet-5-5` | The best combination of speed and intelligence (default recommendation) | $2 / $10 |
| Opus 5.5 | `claude-opus-5-5` | Long-running agentic coding and knowledge work | $4 / $20 |
| Fable 5.1 | `claude-fable-5-1` | Demanding reasoning and long-horizon agentic work | $10 / $50 |

All four have a 1M-token context window.

## Core Parameters

### Sampling parameters (temperature, top_p, top_k)

Current Claude models don't use sampling parameters, and the Python SDK 1.x removed `temperature`, `top_p` and `top_k` from `messages.create()` (passing them raises a `TypeError`). Steer consistency and variety with the prompt instead:

- **Consistent output**: explicit format, constraints, and examples
- **Varied output**: ask for several distinct options, or a different angle each time

Older models still honor these settings. If you are pinned to one, pass them through `extra_body`:

```python
response = client.messages.create(
    ...,
    extra_body={"temperature": 0.2},  # only for older models that still use it
)
```

### Stop Sequences

Strings that, when generated, halt output immediately. Useful for:
- Stopping after first JSON object
- Preventing verbose explanations
- Extracting structured outputs

```python
response = client.messages.create(
    model="claude-sonnet-5-5",
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
6. **Steer with the prompt, not sampling settings** - Current models ignore `temperature`, `top_p` and `top_k`

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
    model="claude-sonnet-5-5",
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
- ❌ Passing `temperature` / `top_p` / `top_k` to current models (removed from the Python SDK 1.x)
- ❌ Not checking `stop_reason` (missing truncation indicators)
- ❌ Treating single messages as stateless (Claude sees conversation history)

## Resources

- Official API docs: https://platform.claude.com/docs/en/home
- Models overview: https://platform.claude.com/docs/en/models/overview
- Pricing: https://platform.claude.com/docs/en/about-claude/pricing
- Rate limits: https://platform.claude.com/docs/en/api/rate-limits
