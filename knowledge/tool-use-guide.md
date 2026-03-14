# Tool Use (Function Calling) Guide - Quick Reference

Comprehensive guide to implementing tool use with Claude. Extracted from Anthropic's official tool use course.

## What is Tool Use?

Tool use (function calling) extends Claude's capabilities by letting it request specific external functions or APIs. **Critical**: Claude doesn't execute code—it asks you to, and you report results back.

**Unlike stateful APIs**, tool use is a **request-response cycle**:
1. You define tools and send prompt
2. Claude decides which tool(s) to call
3. You execute those tools locally
4. You pass results back to Claude
5. Claude uses results to formulate final answer

## When to Use Tool Use

✅ **Perfect for**:
- Retrieving real-time data (weather, stock prices, news)
- Database queries (customer info, order history)
- Complex calculations
- Accessing external APIs
- Getting structured outputs (JSON extraction)
- Chained operations (get data → process → return)

❌ **Not for**:
- General knowledge questions Claude can answer directly
- Tasks where Claude's built-in knowledge suffices
- Simple reasoning that doesn't need external data

## Basic Architecture

```
User Query
    ↓
Claude (with tool definitions)
    ↓
Claude: "I need to call get_weather(city='Tokyo')"
    ↓
Your App (executes get_weather)
    ↓
Your App: "Temperature: 22°C"
    ↓
Claude (now has data)
    ↓
Final Response to User
```

## Defining Tools

Claude needs three pieces of information about each tool:

1. **Name** - Unique identifier for the tool
2. **Description** - What it does (Claude uses this to decide if it's needed)
3. **Input Schema** - JSON Schema describing parameters

```python
tools = [
    {
        "name": "get_stock_price",
        "description": "Get the current stock price for a company by ticker symbol",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {
                    "type": "string",
                    "description": "Stock ticker symbol (e.g., AAPL, GOOGL)"
                },
                "currency": {
                    "type": "string",
                    "enum": ["USD", "EUR", "GBP"],
                    "description": "Currency for the price"
                }
            },
            "required": ["ticker"]
        }
    }
]
```

## Complete Tool Use Workflow

### Step 1: Define Tool Function

```python
def get_stock_price(ticker, currency="USD"):
    # Your implementation here
    # Could call a real API or return mock data
    return {"ticker": ticker, "price": 150.25, "currency": currency}
```

### Step 2: Make API Request with Tool

```python
messages = [
    {"role": "user", "content": "What's the price of Apple stock?"}
]

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    tools=tools,
    messages=messages
)
```

### Step 3: Check Response for Tool Calls

```python
if response.stop_reason == "tool_use":
    # Claude wants to call a tool
    for block in response.content:
        if block.type == "tool_use":
            tool_name = block.name
            tool_input = block.input
            tool_use_id = block.id

            # Execute the tool
            if tool_name == "get_stock_price":
                result = get_stock_price(**tool_input)
```

### Step 4: Pass Tool Result Back to Claude

```python
# Add assistant's response (with tool use request) to messages
messages.append({"role": "assistant", "content": response.content})

# Add tool result
messages.append({
    "role": "user",
    "content": [
        {
            "type": "tool_result",
            "tool_use_id": tool_use_id,
            "content": json.dumps(result)
        }
    ]
})

# Get Claude's final response
final_response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    tools=tools,
    messages=messages
)
```

## Tool Choice Parameter

Controls when Claude calls tools:

### `tool_choice: "auto"` (default)
Claude decides whether to use tools or not.

```python
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    tools=tools,
    tool_choice="auto",  # Default behavior
    messages=messages
)
```

**Tip**: Claude can be "over-eager" with auto. Write detailed system prompts to guide when tools are needed.

### `tool_choice: "any"`
Claude **must** call at least one tool. Useful for:
- Forcing structured output extraction
- Ensuring calculation/lookup always happens

```python
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    tools=tools,
    tool_choice="any",  # Force tool use
    messages=messages
)
```

**Example use case**: Force Claude to use a `print_sentiment_scores` tool to guarantee JSON output.

### `tool_choice: {"type": "tool", "name": "specific_tool"}`
Force a specific tool.

```python
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    tools=tools,
    tool_choice={"type": "tool", "name": "get_stock_price"},
    messages=messages
)
```

## Structured Output Pattern

Use tool_choice to force JSON output:

```python
tools = [
    {
        "name": "save_sentiment_analysis",
        "description": "Save sentiment analysis results",
        "input_schema": {
            "type": "object",
            "properties": {
                "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                "score": {"type": "number", "minimum": 0, "maximum": 1},
                "explanation": {"type": "string"}
            },
            "required": ["sentiment", "score", "explanation"]
        }
    }
]

# Force Claude to use the tool (and thus return JSON-compatible structure)
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    tools=tools,
    tool_choice="any",  # Forces structured output
    messages=[{"role": "user", "content": "Analyze this tweet sentiment: ..."}]
)
```

## Multiple Tool Calls

Claude can request multiple tool calls in one response:

```python
if response.stop_reason == "tool_use":
    tool_results = []

    for block in response.content:
        if block.type == "tool_use":
            # Execute each tool
            if block.name == "get_weather":
                result = get_weather(block.input["city"])
            elif block.name == "get_stock_price":
                result = get_stock_price(block.input["ticker"])

            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": json.dumps(result)
            })

    # Pass all results back at once
    messages.append({"role": "assistant", "content": response.content})
    messages.append({"role": "user", "content": tool_results})
```

## Best Practices

1. **Descriptive tool names** - Use `get_current_weather`, not `weather`
2. **Clear descriptions** - Claude uses these to decide when to call tools
3. **Require inputs** - Use `"required": ["param"]` to avoid missing arguments
4. **Use enums** - Constrain choices with `"enum": ["option1", "option2"]`
5. **Error handling** - Tools might fail; add fallback in your code
6. **Validate results** - Check tool output before passing back to Claude
7. **Detailed prompts** - Help Claude understand when tools are actually needed
8. **Test with auto** - Start with `auto` before forcing tools

## Common Mistakes

- ❌ Forgetting to pass tool results back to Claude
- ❌ Not handling the `tool_use` stop reason
- ❌ Tool descriptions too vague (Claude won't know when to call)
- ❌ Required parameters that are sometimes undefined
- ❌ Forcing tools when Claude doesn't need them (`tool_choice: "any"` overuse)
- ❌ Not validating tool outputs before sending back

## Error Handling Example

```python
def safe_tool_execution(tool_name, tool_input):
    try:
        if tool_name == "get_stock_price":
            return {"success": True, "data": get_stock_price(**tool_input)}
        else:
            return {"success": False, "error": f"Unknown tool: {tool_name}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Pass to Claude
result = safe_tool_execution(block.name, block.input)
```

## Resources

- Official tool use docs: https://docs.anthropic.com/en/docs/build-a-claude-bot-with-tool-use
- Input schema guide: https://docs.anthropic.com/en/docs/build-a-claude-bot-with-tool-use/tool-input-types-and-validation
- Real-world examples: Check Anthropic's courses repository
