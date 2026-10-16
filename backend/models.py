from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

ChannelType = Literal["whatsapp", "email", "web"]
ModelType = Literal["groq", "gemini", "auto"]
IndustryType = Literal["real_estate", "manufacturing", "logistics", "pharma", "general"]

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    id: Optional[str] = None
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    channel: ChannelType = "web"
    model: ModelType = "auto"
    vertical: IndustryType = "general"
    custom_instruction: Optional[str] = None
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)

class AgentCreateRequest(BaseModel):
    name: str
    vertical: str = "general"
    channel: Any = "web"
    preferred_model: str = "groq"
    system_prompt: str = ""
    description: str = ""
    avatar: str = "🤖"

class WorkflowExecutionRequest(BaseModel):
    channel: str = "whatsapp"
    sender: str = "+91-98254-11029"
    message: str = "Interested in MOQ and delivery for 10,000 packaging units."
    customer_name: Optional[str] = "Ramesh Patel"
    company_name: Optional[str] = "Sun Pharma Dahej"
    scenario_id: Optional[str] = None

class ROIRequest(BaseModel):
    monthly_inquiries: int = 2000
    avg_human_cost_inr: int = 150000
