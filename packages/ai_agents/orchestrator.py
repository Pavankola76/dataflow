"""LangGraph-style Agent Orchestrator — Central coordinator for all AI agents."""

from typing import Optional


class AgentMessage:
    """Standardized message protocol for inter-agent communication."""

    def __init__(
        self,
        agent_id: str,
        action: str,
        input_context: dict,
        output: Optional[dict] = None,
        confidence: float = 0.0,
        reasoning: str = "",
        suggested_actions: Optional[list] = None,
        requires_approval: bool = False,
        metadata: Optional[dict] = None,
    ):
        self.agent_id = agent_id
        self.action = action
        self.input_context = input_context
        self.output = output or {}
        self.confidence = confidence
        self.reasoning = reasoning
        self.suggested_actions = suggested_actions or []
        self.requires_approval = requires_approval
        self.metadata = metadata or {}

    def to_dict(self) -> dict:
        return {
            "agent_id": self.agent_id,
            "action": self.action,
            "input_context": self.input_context,
            "output": self.output,
            "confidence": self.confidence,
            "reasoning": self.reasoning,
            "suggested_actions": self.suggested_actions,
            "requires_approval": self.requires_approval,
            "metadata": self.metadata,
        }


class AgentOrchestrator:
    """Central orchestrator that routes requests to specialized agents."""

    AGENTS = {
        "schema_discovery": "packages.ai_agents.schema_discovery.SchemaDiscoveryAgent",
        "data_modeling": "packages.ai_agents.data_modeling",
        "code_generation": "packages.ai_agents.code_generation",
        "text_to_sql": "packages.ai_agents.text_to_sql.TextToSqlAgent",
        "visualization": "packages.ai_agents.visualization.VisualizationAgent",
        "diagnostic": "packages.ai_agents.diagnostic",
        "auto_heal": "packages.ai_agents.auto_heal",
        "optimization": "packages.ai_agents.optimization.OptimizationAgent",
        "documentation": "packages.ai_agents.documentation.DocumentationAgent",
        "governance": "packages.ai_agents.governance",
    }

    @classmethod
    async def route(cls, agent_id: str, action: str, context: dict) -> AgentMessage:
        """Route a request to the appropriate agent and return a standardized response."""
        if agent_id not in cls.AGENTS:
            return AgentMessage(
                agent_id=agent_id,
                action=action,
                input_context=context,
                output={"error": f"Unknown agent: {agent_id}"},
                confidence=0.0,
                reasoning="Agent not found in registry.",
            )

        # Dynamic dispatch — in production this would use LangGraph state machine
        try:
            if agent_id == "text_to_sql":
                from packages.ai_agents.text_to_sql import TextToSqlAgent
                sql, chart_type, chart_config, explanation = await TextToSqlAgent.generate_sql_and_chart(
                    context.get("query", "")
                )
                return AgentMessage(
                    agent_id=agent_id, action=action, input_context=context,
                    output={"sql": sql, "chart_type": chart_type, "chart_config": chart_config, "explanation": explanation},
                    confidence=0.8, reasoning=explanation,
                )

            elif agent_id == "visualization":
                from packages.ai_agents.visualization import VisualizationAgent
                result = VisualizationAgent.select_chart(
                    context.get("columns", []), context.get("data", []), context.get("row_count", 0)
                )
                return AgentMessage(
                    agent_id=agent_id, action=action, input_context=context,
                    output=result, confidence=0.85, reasoning="Chart type selected based on data shape analysis.",
                )

            elif agent_id == "schema_discovery":
                from packages.ai_agents.schema_discovery import SchemaDiscoveryAgent
                result = await SchemaDiscoveryAgent.discover(context.get("connection_config", {}))
                return AgentMessage(
                    agent_id=agent_id, action=action, input_context=context,
                    output=result, confidence=0.9, reasoning="Schema discovered from information_schema.",
                )

            elif agent_id == "optimization":
                from packages.ai_agents.optimization import OptimizationAgent
                suggestions = OptimizationAgent.analyze_pipeline_efficiency(context)
                return AgentMessage(
                    agent_id=agent_id, action=action, input_context=context,
                    output={"suggestions": suggestions}, confidence=0.75,
                    reasoning=f"Generated {len(suggestions)} optimization suggestion(s).",
                )

            elif agent_id == "documentation":
                from packages.ai_agents.documentation import DocumentationAgent
                doc = DocumentationAgent.generate_table_readme(
                    context.get("table_name", "unknown"),
                    context.get("columns", []),
                    context.get("description", ""),
                )
                return AgentMessage(
                    agent_id=agent_id, action=action, input_context=context,
                    output={"documentation": doc}, confidence=0.9,
                    reasoning="Documentation generated from schema metadata.",
                )

            else:
                return AgentMessage(
                    agent_id=agent_id, action=action, input_context=context,
                    output={"status": "agent_registered", "note": f"{agent_id} agent is registered but not yet wired for action '{action}'."},
                    confidence=0.5, reasoning="Agent exists but this specific action needs implementation.",
                )

        except Exception as e:
            return AgentMessage(
                agent_id=agent_id, action=action, input_context=context,
                output={"error": str(e)}, confidence=0.0,
                reasoning=f"Agent invocation failed: {str(e)}",
            )
