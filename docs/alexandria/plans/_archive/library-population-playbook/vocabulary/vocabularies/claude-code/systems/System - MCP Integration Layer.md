---
type: System
prefLabel: MCP Integration Layer
altLabels:
  - MCP bridge
  - Model Context Protocol integration
  - MCP protocol layer
category: [Mechanisms]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://modelcontextprotocol.io
---

# MCP Integration Layer

## WHAT: Definition

_Stub — the protocol bridge that connects external MCP Servers to Claude Code's Tool system. When the User configures an MCP Server, the MCP Integration Layer establishes the connection, negotiates the protocol handshake, discovers the Tools and Resources the server exposes, and registers them with the Tool Dispatcher. From the Agent's perspective, MCP-provided Tools appear identical to built-in Tools — the MCP Integration Layer handles all protocol translation transparently._

## WHERE: Ecosystem

_Stub — links to: [[Entity - MCP Server]] (the external servers this layer connects), [[System - Tool Dispatcher]] (the Dispatcher that receives the registered MCP Tools), [[Role - User]] (the User configures MCP Servers in settings), [[Role - Agent]] (the Agent calls MCP-provided Tools without knowing they're MCP-provided)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the MCP connection lifecycle (startup, handshake, teardown), how MCP Server configuration is specified (settings.json format), the trust model for MCP-provided Tools, and how the system handles MCP Server failures mid-session._
