---
type: Entity
prefLabel: MCP Server
altLabels:
  - Model Context Protocol server
  - MCP provider
  - Tool provider
category: [Entities]
subcategory: [integration]
facets: [Mechanisms]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://modelcontextprotocol.io
---

# MCP Server

## WHAT: Definition

_Stub — an external Tool provider integrated via the Model Context Protocol. An MCP Server exposes Tools, Resources, and Prompts to the Agent over a standardized protocol. From the Agent's perspective, MCP-provided Tools are indistinguishable from built-in Tools at invocation time — the Agent calls them the same way, receives results the same way. The MCP Server is the integration layer: it translates the standard protocol into whatever the external system (database, API, service) actually requires._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Tool]] (MCP Servers provide Tools), [[System - MCP Integration Layer]] (the protocol bridge), [[Role - Agent]] (the Agent calls MCP-provided Tools), [[Role - User]] (the User configures MCP Server connections in settings)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the MCP protocol spec reference, how MCP Servers are configured (settings.json), the Tool/Resource/Prompt primitives the protocol defines, and the trust model for MCP-provided Tools vs built-in Tools._
