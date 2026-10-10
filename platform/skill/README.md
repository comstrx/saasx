# ✨ Skill

An engineering knowledge runtime for AI agents: a Rust engine that serves a structured knowledge graph over MCP.

## Overview

This is the knowledge layer, not an agent. The intelligence — any strong agent — plugs in; the runtime gives it the engineering constitution: architecture, standards, constraints, framework behavior, infrastructure practice, business patterns and the way the surrounding tools are used.

```text
powerful AI agent
       +
   knowledge runtime
       =
engineering agent that knows the stack
```

The runtime is small and generic:

```text
graph · node · edge · query · retrieval · ranking · scope · version · source · rules · MCP
```

Knowledge is data fed into it, and it is not a pile of markdown. Every knowledge unit carries its source, scope, version, when it applies and when it does not, its confidence, its relations and what it supersedes — so an agent receives "this rule, for this stack, at this version, in this context" rather than prose to interpret.

## Scope

One opinionated vertical stack: Rust and its chosen crates; TypeScript, Node, React and Next.js; one database, cache and infrastructure pattern; the commerce, business and finance logic of high-performance SaaS; and the tools of this repository themselves. Depth over breadth, by design.

## Layout

```text
engine             the runtime and the MCP server
knowledge          generic engineering, framework, infrastructure and domain knowledge
packs/<project>    a project's own knowledge, read by the engine, never owned by it
```
