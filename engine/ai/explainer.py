import json
import anthropic
import os


SYSTEM_PROMPT = """You are a senior security engineer reviewing production readiness reports.
Be precise, technical, and direct. No filler language."""

USER_PROMPT_TEMPLATE = """Analyze this scan result and return JSON with keys:
- summary: 2-3 sentence executive overview
- risks: top 3 [{{"title": str, "impact": str, "fix": str}}]
- roadmap: prioritized [{{"priority": int, "action": str, "effort": "low"|"medium"|"high"}}]
- recommendation: one of "Ready" | "Needs Work" | "Not Ready"

Scan data: {scan_data}"""


async def generate_explanation(scan_data: dict) -> dict:
    """Call Claude API and return structured explanation."""
    client = anthropic.AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    scan_json = json.dumps(scan_data, indent=2)
    user_message = USER_PROMPT_TEMPLATE.format(scan_data=scan_json)

    try:
        response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
            output_config={
                "format": {
                    "type": "json_schema",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "summary": {"type": "string"},
                            "risks": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "impact": {"type": "string"},
                                        "fix": {"type": "string"},
                                    },
                                    "required": ["title", "impact", "fix"],
                                    "additionalProperties": False,
                                },
                            },
                            "roadmap": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "priority": {"type": "integer"},
                                        "action": {"type": "string"},
                                        "effort": {"type": "string", "enum": ["low", "medium", "high"]},
                                    },
                                    "required": ["priority", "action", "effort"],
                                    "additionalProperties": False,
                                },
                            },
                            "recommendation": {
                                "type": "string",
                                "enum": ["Ready", "Needs Work", "Not Ready"],
                            },
                        },
                        "required": ["summary", "risks", "roadmap", "recommendation"],
                        "additionalProperties": False,
                    },
                }
            },
        )

        text = response.content[0].text
        return json.loads(text)

    except anthropic.APIError as e:
        # Fallback: return a basic explanation
        return _fallback_explanation(scan_data, str(e))
    except (json.JSONDecodeError, IndexError, KeyError):
        return _fallback_explanation(scan_data, "Failed to parse AI response")


def _fallback_explanation(scan_data: dict, error: str) -> dict:
    total = scan_data.get("total", 0)
    if total >= 75:
        recommendation = "Ready"
    elif total >= 50:
        recommendation = "Needs Work"
    else:
        recommendation = "Not Ready"

    flags = scan_data.get("flags", [])
    top_flags = [f for f in flags if f.get("severity") == "high"][:3]

    risks = [
        {
            "title": f["title"],
            "impact": "Reduces production readiness and security posture.",
            "fix": f.get("detail", "Review and remediate this issue."),
        }
        for f in top_flags
    ] or [
        {
            "title": "Review scan findings",
            "impact": "Unresolved issues may cause production incidents.",
            "fix": "Review the flagged issues and prioritize remediation.",
        }
    ]

    return {
        "summary": f"This repository scored {total}/100 on production readiness. AI analysis was limited ({error}). Review the flags manually.",
        "risks": risks[:3],
        "roadmap": [
            {"priority": 1, "action": "Address all high-severity findings", "effort": "medium"},
            {"priority": 2, "action": "Add CI/CD pipeline and tests", "effort": "medium"},
            {"priority": 3, "action": "Configure security headers on deployment", "effort": "low"},
        ],
        "recommendation": recommendation,
    }
