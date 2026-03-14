# Claude Cookbooks - Knowledge Base

> Condensed reference from Anthropic's official Claude Cookbooks repository.
> Copy-paste code patterns for integrating Claude into production applications.

---

## Core Capabilities

### Classification
- Use Claude for text and data classification with complex business rules
- Ideal when training data is limited or rules are subjective
- Pattern: Provide category definitions, examples, and edge cases in the prompt
- Evaluation: Use Promptfoo for systematic testing

### Retrieval Augmented Generation (RAG)
- Enhance Claude's knowledge with external data sources
- Workflow: Retrieve context → Combine with query → Send to Claude
- Supports: Vector databases (Pinecone), Wikipedia, web pages, embeddings (Voyage AI)
- Pattern: Index external documents, retrieve top-k relevant chunks, include in system prompt

### Summarization
- Effective techniques for condensing long texts
- Works across articles, transcripts, reports, code reviews
- Pattern: Specify summary style/length, use examples for consistency

---

## Tool Use & Integration

### Foundation Pattern
```
User request → Claude analyzes → Proposes tool calls
→ Execute tools → Return results → Claude synthesizes answer
```

### Key Notebooks
- **Customer Service Agent**: Build autonomous agents that use tools to resolve issues
- **Calculator Tool**: Integrate external compute; enables math-heavy workflows
- **Tool Choice Strategy**: Control when/how Claude uses tools vs. direct answers
- **Parallel Tools**: Execute multiple tools simultaneously for efficiency
- **Pydantic Integration**: Use type hints for structured tool definitions
- **Vision with Tools**: Combine image analysis with tool-calling workflows

### Advanced Patterns
- **Programmatic Tool Calling**: Generate tool calls without explicit definitions
- **Tool Search with Embeddings**: Find relevant tools from large tool libraries
- **Memory Tool**: Build persistent memory systems for multi-turn conversations
- **Automatic Context Compaction**: Manage token usage in long conversations

---

## Multimodal Capabilities

### Vision Tasks
- **Getting Started**: Basic image analysis, OCR, shape detection
- **Best Practices**: Provide context, ask specific questions, use vision for high-value tasks
- **Charts & Graphs**: Extract data from visual representations
- **Form Extraction**: Auto-fill forms by analyzing document images
- **Transcription**: Extract text from images, PDFs, screenshots

### Vision + Tools
- Combine image analysis with external APIs
- Example: Analyze screenshot → Extract data → Call API → Return results

### Sub-Agents Pattern
- Use Haiku for cheap, fast analysis tasks
- Escalate complex decisions to Sonnet/Opus
- Cost-efficient for high-volume processing

---

## Advanced Techniques

### Prompt Caching
- Cache expensive system prompts and documents
- Reduces costs for repetitive queries over same context
- Speculative caching: Pre-compute likely follow-up queries

### JSON Mode
- Force valid JSON output for structured data extraction
- Prevents parsing errors in production
- Pattern: Include JSON schema in prompt, set `response_format`

### Extended Thinking
- Enable longer internal reasoning for complex problems
- Two notebooks: standalone and combined with tool use
- Trade-off: Higher latency for better reasoning quality

### Batch Processing
- Send multiple requests in one batch for 50% cost reduction
- Ideal for non-time-critical bulk work
- Asynchronous processing with job status polling

### SQL Queries
- Let Claude write SQL from natural language descriptions
- Include schema definitions and example queries
- Add safety constraints to prevent destructive operations

---

## Production Patterns

### Moderation & Filtering
- Use Claude itself as a content moderation filter
- Define moderation criteria, provide examples
- Pattern: Flag, classify severity, recommend actions

### PDF Processing
- Upload PDFs directly to Claude (Files API)
- Extract structured data, summarize, analyze
- Handles images within PDFs

### Web Content
- Use Haiku to read web pages (cost-efficient)
- Extract, summarize, or analyze web content at scale
- Pattern: Fetch page → Pass to Claude → Extract insights

### Evaluations & Testing
- Use Claude to auto-generate test cases
- Build evaluation frameworks with Promptfoo
- Systematic prompt optimization via evals

### Citations & References
- Track source documents for RAG responses
- Include citations in model output
- Pattern: Tag context chunks, return references with answers

### Session Memory
- Compress conversation history with summarization
- Maintain context across sessions without token explosion
- Pattern: Periodically summarize, include summary in system prompt

---

## Integration Examples

- **AWS**: Anthropic-on-AWS samples for cloud deployment
- **Vector Databases**: Pinecone integration for semantic search
- **Image Generation**: Claude + Stable Diffusion for illustrated responses
- **Bedrock**: Finetuning Claude models on AWS Bedrock

---

## Key Takeaways

1. **Start Simple**: Begin with direct prompting; add tools/RAG only if needed
2. **Use Sub-Agents**: Haiku for cheap filtering, Opus for hard problems
3. **Leverage Caching**: Expensive system prompts and documents benefit most
4. **Batch When Possible**: 50% cost savings for non-urgent work
5. **Test & Evaluate**: Use Promptfoo for systematic quality assurance
6. **Include Examples**: Few-shot learning dramatically improves output consistency
7. **Manage Context**: Use compression and caching for long-running interactions

---

**Repository**: https://github.com/anthropics/anthropic-cookbook

**License**: MIT (copy freely, adapt to your use case)

**Updated**: 2026-03-15 (based on current cookbook inventory)
