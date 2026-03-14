# Anthropic Official Skills Reference

**Source**: `anthropics/skills` GitHub repository
**Last Updated**: 2026-03-15
**Specification**: https://agentskills.io/specification

---

## Skills Overview (17 Total)

| Skill | Category | Purpose |
|-------|----------|---------|
| **algorithmic-art** | Creative | Create generative art using p5.js with seeded randomness, particle systems, and flow fields. Two-phase workflow: philosophy → p5.js implementation. |
| **brand-guidelines** | Design | Apply company brand identity (colors, typography, spacing) to any artifact. Reference Anthropic's official palette and font pairings. |
| **canvas-design** | Design | Create static visual designs (posters, artwork) in PNG/PDF. Philosophy-driven workflow similar to algorithmic-art. |
| **claude-api** | Development | Guide building LLM apps with Claude API across 9 languages (Python, TypeScript, Java, Go, Ruby, C#, PHP, Scala, Kotlin). Default: Opus 4.6 + adaptive thinking + streaming. |
| **doc-coauthoring** | Writing | Structured 3-stage workflow for collaborative document creation: Context Gathering → Refinement & Structure → Reader Testing. |
| **docx** | Documents | Create, read, edit Word documents. Tools: `docx-js` (new), pandoc (read), unpack/repack XML (edit), LibreOffice conversion. |
| **frontend-design** | Development | Build production-grade React/HTML/CSS interfaces with bold aesthetic directions (brutalism, maximalism, minimalism, etc.). Avoid "AI slop" aesthetics. |
| **internal-comms** | Writing | Templates for corporate communications: 3P updates, company newsletters, FAQs, status reports, incident reports. |
| **mcp-builder** | Development | Guide for creating high-quality MCP servers. Covers planning, framework selection (FastMCP/Node SDK), tool design, error handling. |
| **pdf** | Documents | Extract text, merge/split, OCR, fill forms, encrypt/decrypt, add watermarks. Libraries: `pypdf`, JavaScript alternatives. |
| **pptx** | Documents | Create/edit PowerPoint presentations. Tools: `pptxgenjs` (create), unpack/repack XML (edit), `markitdown` (read). |
| **skill-creator** | Development | Workflow for creating and iterating skills: draft → test → eval → iterate. Includes quantitative benchmarking and description optimization. |
| **slack-gif-creator** | Creative | Create optimized animated GIFs for Slack. Constraints: 128×128 emoji, 480×480 message, 10-30 FPS, 48-128 colors. |
| **theme-factory** | Design | Apply 10 pre-set professional themes (colors + fonts) to artifacts. Showcase available in `theme-showcase.pdf`. |
| **web-artifacts-builder** | Development | Build complex React artifacts for claude.ai using Vite + Tailwind + shadcn/ui. Bundles to single HTML. |
| **webapp-testing** | Development | Test web apps with Playwright. Helper script `with_server.py` manages server lifecycle. Focus on black-box usage. |
| **xlsx** | Documents | Create/read/edit spreadsheets. Standards: professional fonts, zero formula errors, industry-standard color coding (blue=input, black=formula, green=internal links, red=external links). |

---

## Key Patterns Across Skills

### 1. **Philosophy-Driven Design** (algorithmic-art, canvas-design)
- Two-phase workflow: define aesthetic philosophy → implement
- Philosophy emphasizes craftsmanship, expertise, intentionality (repeated phrasing)
- Leave creative space for implementation phase
- Avoid redundancy in philosophy descriptions

### 2. **Language Detection & Routing** (claude-api)
Check project files for language markers:
```
*.py, requirements.txt, pyproject.toml → Python
*.ts, *.tsx, package.json → TypeScript
*.java, pom.xml, build.gradle → Java
*.go, go.mod → Go
*.rb, Gemfile → Ruby
*.cs, *.csproj → C#
*.php, composer.json → PHP
```
If ambiguous, ask user. Default: Python examples.

### 3. **Document Processing Pattern**
**Read**: Use tool-specific parsers (`pandoc`, `markitdown`, `python -m markitdown`)
**Edit**: Unpack → manipulate XML → repack
**Create**: Use native libraries (`docx-js`, `pptxgenjs`, `pypdf`)

### 4. **Script Helpers as Black Boxes** (webapp-testing, mcp-builder)
Run scripts with `--help` first. Don't read source unless necessary. Examples:
- `scripts/with_server.py --help` - Server lifecycle management
- `scripts/office/soffice.py --headless --convert-to docx document.doc`
- `python scripts/thumbnail.py presentation.pptx` - Visual overview

### 5. **Environment Variables & File Locations**
Skills use standard paths:
- `${CLAUDE_SKILL_DIR}/` - Relative skill directory
- `./examples/` - Documentation examples
- `./scripts/` - Utility scripts
- `.env` files - Credentials (usually gitignored)

### 6. **Structured Workflows** (doc-coauthoring, skill-creator)
Multi-stage processes with user agency:
1. **Capture Intent** - Gather requirements, constraints
2. **Draft** - Create initial output
3. **Iterate** - Evaluate (quantitative + qualitative), refine
4. **Finalize** - Optimize for production

### 7. **Design Anti-Patterns to Avoid**
Mentioned across design skills (frontend-design, web-artifacts-builder):
- Excessive centered layouts
- Purple gradients on white (clichéd)
- Inter font, Arial, system fonts (generic)
- Uniform rounded corners
- Timid color palettes (use dominant colors + sharp accents)

---

## Skill File Structure

All skills follow this minimal structure:

```markdown
---
name: skill-identifier
description: One-sentence summary + use cases + triggers
license: Complete terms in LICENSE.txt [or Proprietary]
---

# Skill Name

[Instructions, patterns, examples, guidelines]
```

**Key frontmatter fields**:
- `name`: lowercase, hyphens for spaces (used as identifier)
- `description`: Trigger conditions, use cases, when NOT to use
- `license`: Apache 2.0 (open), Source-available (docx/pdf/pptx), or Proprietary

---

## Plugin System Basics

**Registration**: Skills are auto-loaded by Claude Code, Claude.ai, and Claude API via:
- `/plugin install skill-name@anthropic-agent-skills`
- `/plugin marketplace add anthropics/skills`
- API: Upload via Skills API Quickstart (docs.claude.com)

**Marketplace**: Two plugin bundles from Anthropic:
- `document-skills` - docx, pdf, pptx, xlsx
- `example-skills` - All 17 public skills

**Format**: Each skill is a single `SKILL.md` file with frontmatter + markdown instructions.

---

## Notable Techniques Worth Studying

1. **Seeded Randomness** (algorithmic-art)
   - Reproducible generative output via noise functions
   - Parametric variation without full recompilation

2. **Philosophy → Implementation Split** (algorithmic-art, canvas-design)
   - Separates aesthetic intent from technical execution
   - Enables iterative refinement at both stages

3. **Brand Standardization** (brand-guidelines)
   - Centralized color palette + typography
   - Easy post-processing application to any artifact

4. **Multi-Stage Document Workflows** (doc-coauthoring)
   - Reader testing phase catches blind spots
   - Fresh Claude (no context) validates clarity

5. **Quantitative Skill Evals** (skill-creator)
   - Benchmark performance with variance analysis
   - Optimize skill descriptions for trigger accuracy

6. **Format Color Coding** (xlsx)
   - Industry standard: blue (input), black (formula), green (internal), red (external)
   - Immediate visual clarity of cell purpose

7. **Helper Script Pattern** (webapp-testing, mcp-builder)
   - Black-box utilities for boilerplate
   - Run `--help` before reading source
   - Reduces context window pollution

---

## Best Practices for Skill Development

1. **Trigger Precision**: Include negative triggers in description ("DO NOT TRIGGER when...")
2. **Phased Workflows**: Complex tasks → multi-stage processes with user checkpoints
3. **Tool Routing**: Detect project context before recommending approach
4. **Standards Reference**: Link to external standards (agentskills.io, MCP spec, Claude API docs)
5. **Black-Box Scripts**: Provide helper scripts; don't inline complex logic
6. **Examples Directory**: Store templates, guidelines, reference materials in `examples/`
7. **Avoid Redundancy**: Each concept mentioned once; don't repeat unless adding new depth
8. **Emphasize Craftsmanship**: Frame outputs as intentional, expert-level work
9. **Creative Freedom**: Leave room for implementation-phase interpretation
10. **Anti-Pattern Lists**: Explicitly mention what to avoid (especially for design)

---

## Resources

- **Spec**: https://agentskills.io/specification
- **Repo**: https://github.com/anthropics/skills
- **Claude Docs**: https://support.claude.com/en/articles/12512176-what-are-skills
- **API Quickstart**: https://docs.claude.com/en/api/skills-guide
- **Engineering Blog**: https://anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

---

## Skill Licensing Notes

**Open Source (Apache 2.0)**:
- algorithmic-art, brand-guidelines, canvas-design, frontend-design, slack-gif-creator, theme-factory, web-artifacts-builder, skill-creator, internal-comms, mcp-builder, claude-api, webapp-testing, doc-coauthoring

**Source-Available (Proprietary, but shared)**:
- docx, pdf, pptx, xlsx (production implementations from claude.ai document editing)

**Special**: agent-skills-spec.md (redirects to web spec at agentskills.io)
