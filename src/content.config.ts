import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// owner/name, e.g. "github/spec-kit"
const repoId = z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'must be a GitHub "owner/name" pair');

export const MATURITY_LEVELS = ['experimental', 'emerging', 'established', 'mature'] as const;
export const DRIFT_LEVELS = ['none', 'low', 'moderate', 'high', 'unknown'] as const;
export const PROJECT_STATUSES = ['active', 'paused', 'archived'] as const;

// Canonical vocabulary for `supportedTools`. Entries are products, not
// surfaces or modes: Codex covers Codex CLI/App, Kiro covers IDE/CLI/web/
// mobile; qualifiers like "(planning)" belong in the page's prose. `Claude`
// means the Claude models/apps generally — use `Claude Code` for the coding
// agent. Extend this list deliberately when a framework adds a new tool.
export const SUPPORTED_TOOLS = [
  'Amazon Q Developer',
  'Amp',
  'Antigravity',
  'Augment',
  'ChatGPT Custom GPTs',
  'Claude',
  'Claude Code',
  'Cline',
  'CodeBuddy',
  'Codex',
  'Cosmos',
  'Cursor',
  'Factory Droid',
  'Gemini CLI',
  'Gemini Gems',
  'GitHub Copilot',
  'Goose',
  'Hermes',
  'JetBrains IDEs',
  'Kilo',
  'Kimi Code',
  'Kiro',
  'OpenCode',
  'Pi',
  'Qwen Code',
  'RooCode',
  'Slack',
  'Trae',
  'VS Code',
  'Vim/Neovim',
  'Windsurf',
  'Zed',
  'Any MCP-compatible agent',
  'Any skills-compatible agent',
] as const;

const frameworks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/frameworks' }),
  schema: z.object({
    name: z.string(),
    website: z.url().optional(),
    repo: repoId.optional(),
    summary: z.string(),
    coreApproach: z.string(),
    workflow: z.array(z.string()).min(1),
    supportedTools: z.array(z.enum(SUPPORTED_TOOLS)).min(1),
    maturity: z.enum(MATURITY_LEVELS),
    strengths: z.array(z.string()).min(1),
    limitations: z.array(z.string()).min(1),
    added: z.coerce.date(),
    lastReviewed: z.coerce.date(),
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    repo: repoId,
    framework: reference('frameworks'),
    summary: z.string(),
    status: z.enum(PROJECT_STATUSES).default('active'),
    specStructure: z.object({
      location: z.string(),
      formats: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }),
    drift: z.enum(DRIFT_LEVELS).default('unknown'),
    timeline: z
      .array(
        z.object({
          date: z.coerce.date(),
          title: z.string(),
          description: z.string().optional(),
          link: z.url().optional(),
        }),
      )
      .default([]),
    added: z.coerce.date(),
    lastReviewed: z.coerce.date(),
  }),
});

export const collections = { frameworks, projects };
