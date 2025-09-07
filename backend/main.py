from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import os
import stripe
from supabase import create_client, Client
import httpx
import asyncio

# Initialize FastAPI app
app = FastAPI(
    title="Ikon Systems Dashboard API",
    description="Backend API for Ikon Systems Dashboard with comprehensive integrations",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Supabase configuration
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Google Calendar configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/google/callback")

# Enhanced Models
class VoiceAgentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone_number: str = Field(..., regex=r'^\+?1?\d{9,15}$')
    script: str = Field(..., min_length=10, max_length=1000)
    client_id: str = Field(..., min_length=1)
    type: str = Field(default="sales", regex="^(sales|support|appointment|follow_up|custom)$")
    model: str = Field(default="gpt-4")
    voice: str = Field(default="alloy")
    max_duration: int = Field(default=300, ge=60, le=1800)

class VoiceAgentResponse(BaseModel):
    id: str
    name: str
    phone_number: str
    status: str
    performance_metrics: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class AppointmentCreate(BaseModel):
    client_id: str = Field(..., min_length=1)
    date_time: datetime
    type: str = Field(..., regex="^(demo|call|follow_up|meeting|consultation)$")
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    duration: Optional[int] = Field(60, ge=15, le=480)
    location: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = Field(None, max_length=1000)

class InvoiceCreate(BaseModel):
    client_id: str = Field(..., min_length=1)
    project_id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    amount: float = Field(..., gt=0)
    tax_rate: float = Field(0.0, ge=0, le=1)
    due_date: datetime
    notes: Optional[str] = Field(None, max_length=1000)

class PaymentCreate(BaseModel):
    invoice_id: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    payment_method: str = Field(..., regex="^(stripe|check|cash|bank_transfer)$")
    payment_date: datetime
    reference_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=500)

class ClientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., regex=r'^[^@]+@[^@]+\.[^@]+$')
    phone: str = Field(..., regex=r'^\+?1?\d{9,15}$')
    address: str = Field(..., min_length=1, max_length=200)
    status: str = Field(default="lead", regex="^(lead|prospect|active|churned)$")
    bilingual_preference: bool = Field(default=False)
    notes: Optional[str] = Field(None, max_length=1000)

class ProjectCreate(BaseModel):
    client_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=1000)
    status: str = Field(default="planning", regex="^(planning|in_progress|on_hold|completed|cancelled)$")
    priority: str = Field(default="medium", regex="^(low|medium|high|urgent)$")
    budget: float = Field(..., gt=0)
    timeline: str = Field(..., min_length=1, max_length=100)
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=1000)

class AnalyticsRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    metrics: List[str] = Field(default=["revenue", "clients", "projects", "appointments"])

class WebhookPayload(BaseModel):
    event_type: str
    data: Dict[str, Any]
    timestamp: datetime

# Enhanced VAPI Integration
class VAPIService:
    def __init__(self):
        self.api_key = os.getenv("VAPI_API_KEY")
        self.base_url = "https://api.vapi.ai"
        self.enabled = bool(self.api_key)
    
    async def create_agent(self, agent_data: VoiceAgentCreate) -> Dict[str, Any]:
        """Create a new voice agent via VAPI"""
        if not self.enabled:
            raise HTTPException(status_code=503, detail="VAPI service not configured")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/assistant",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "name": agent_data.name,
                        "model": {
                            "provider": "openai",
                            "model": agent_data.model,
                            "voice": agent_data.voice,
                            "maxDurationSeconds": agent_data.max_duration
                        },
                        "voice": {
                            "provider": "elevenlabs",
                            "voiceId": "21m00Tcm4TlvDq8ikWAM"
                        },
                        "firstMessage": agent_data.script,
                        "systemMessage": f"You are a professional {agent_data.type} assistant for Ikon Systems.",
                        "phoneNumberId": agent_data.phone_number
                    }
                )
                
                if response.status_code == 201:
                    agent_data = response.json()
                    return {
                        "success": True,
                        "agent_id": agent_data.get("id"),
                        "data": agent_data
                    }
                else:
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                    
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"VAPI service error: {str(e)}")

    async def get_agent_logs(self, agent_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get logs for a specific agent"""
        if not self.enabled:
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/call",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    params={"assistantId": agent_id, "limit": limit}
                )
                
                if response.status_code == 200:
                    return response.json().get("data", [])
                else:
                    return []
                    
        except Exception as e:
            print(f"Error fetching agent logs: {e}")
            return []

    async def update_agent(self, agent_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing agent"""
        if not self.enabled:
            raise HTTPException(status_code=503, detail="VAPI service not configured")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    f"{self.base_url}/assistant/{agent_id}",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json=updates
                )
                
                if response.status_code == 200:
                    return {"success": True, "data": response.json()}
                else:
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                    
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"VAPI service error: {str(e)}")

    async def delete_agent(self, agent_id: str) -> bool:
        """Delete an agent"""
        if not self.enabled:
            raise HTTPException(status_code=503, detail="VAPI service not configured")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{self.base_url}/assistant/{agent_id}",
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                
                return response.status_code == 200
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"VAPI service error: {str(e)}")

    async def make_call(self, agent_id: str, phone_number: str) -> Dict[str, Any]:
        """Make a call using an agent"""
        if not self.enabled:
            raise HTTPException(status_code=503, detail="VAPI service not configured")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/call",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "assistantId": agent_id,
                        "customer": {
                            "number": phone_number
                        }
                    }
                )
                
                if response.status_code == 201:
                    return {"success": True, "data": response.json()}
                else:
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                    
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"VAPI service error: {str(e)}")

# Twilio Integration
class TwilioService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.base_url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}"
    
    async def send_sms(self, to: str, message: str) -> Dict[str, Any]:
        """Send SMS via Twilio"""
        if not self.account_sid or not self.auth_token:
            raise HTTPException(status_code=503, detail="Twilio service not configured")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/Messages.json",
                    auth=(self.account_sid, self.auth_token),
                    data={
                        "To": to,
                        "From": os.getenv("TWILIO_PHONE_NUMBER"),
                        "Body": message
                    }
                )
                
                if response.status_code == 201:
                    return {"success": True, "data": response.json()}
                else:
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                    
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Twilio service error: {str(e)}")

    async def get_phone_numbers(self) -> List[Dict[str, Any]]:
        """Get all phone numbers from Twilio"""
        if not self.account_sid or not self.auth_token:
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/IncomingPhoneNumbers.json",
                    auth=(self.account_sid, self.auth_token)
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("incoming_phone_numbers", [])
                else:
                    return []
                    
        except Exception as e:
            print(f"Error fetching phone numbers: {e}")
            return []

# Stripe Integration
class StripeService:
    def __init__(self):
        self.secret_key = os.getenv("STRIPE_SECRET_KEY")
        self.enabled = bool(self.secret_key)
    
    async def create_payment_intent(self, amount: float, currency: str = "usd", 
                                  customer_id: Optional[str] = None, 
                                  metadata: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Create a payment intent"""
        if not self.enabled:
            raise HTTPException(status_code=503, detail="Stripe service not configured")
        
        try:
            intent_data = {
                "amount": int(amount * 100),  # Convert to cents
                "currency": currency,
                "metadata": metadata or {}
            }
            
            if customer_id:
                intent_data["customer"] = customer_id
            
            payment_intent = stripe.PaymentIntent.create(**intent_data)
            
            return {
                "success": True,
                "client_secret": payment_intent.client_secret,
                "id": payment_intent.id
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Stripe service error: {str(e)}")

    async def create_customer(self, email: str, name: Optional[str] = None, 
                            phone: Optional[str] = None) -> Dict[str, Any]:
        """Create a Stripe customer"""
        if not self.enabled:
            raise HTTPException(status_code=503, detail="Stripe service not configured")
        
        try:
            customer_data = {"email": email}
            if name:
                customer_data["name"] = name
            if phone:
                customer_data["phone"] = phone
            
            customer = stripe.Customer.create(**customer_data)
            
            return {
                "success": True,
                "customer_id": customer.id,
                "data": customer
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Stripe service error: {str(e)}")

    async def create_invoice(self, customer_id: str, amount: float, 
                           description: str, due_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Create a Stripe invoice"""
        if not self.enabled:
            raise HTTPException(status_code=503, detail="Stripe service not configured")
        
        try:
            # Create invoice item
            invoice_item = stripe.InvoiceItem.create(
                customer=customer_id,
                amount=int(amount * 100),
                currency="usd",
                description=description
            )
            
            # Create invoice
            invoice = stripe.Invoice.create(
                customer=customer_id,
                due_date=int(due_date.timestamp()) if due_date else None,
                auto_advance=True
            )
            
            return {
                "success": True,
                "invoice_id": invoice.id,
                "data": invoice
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Stripe service error: {str(e)}")

# Google Calendar Integration
class GoogleCalendarService:
    def __init__(self):
        self.client_id = GOOGLE_CLIENT_ID
        self.client_secret = GOOGLE_CLIENT_SECRET
        self.redirect_uri = GOOGLE_REDIRECT_URI
        self.enabled = bool(self.client_id and self.client_secret)
    
    def get_auth_url(self, user_id: str) -> str:
        """Generate Google OAuth URL"""
        if not self.enabled:
            raise HTTPException(status_code=503, detail="Google Calendar service not configured")
        
        from urllib.parse import urlencode
        
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "https://www.googleapis.com/auth/calendar",
            "response_type": "code",
            "access_type": "offline",
            "prompt": "consent",
            "state": user_id
        }
        
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    async def exchange_code_for_token(self, code: str, user_id: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        if not self.enabled:
            raise HTTPException(status_code=503, detail="Google Calendar service not configured")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": self.redirect_uri
                    }
                )
                
                if response.status_code == 200:
                    token_data = response.json()
                    
                    # Store tokens in database (implement your storage logic)
                    # For now, we'll return the tokens
                    return {
                        "success": True,
                        "access_token": token_data.get("access_token"),
                        "refresh_token": token_data.get("refresh_token"),
                        "expires_in": token_data.get("expires_in")
                    }
                else:
                    raise HTTPException(status_code=response.status_code, detail=response.text)
                    
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Google Calendar service error: {str(e)}")

    async def create_calendar_event(self, user_id: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a calendar event"""
        if not self.enabled:
            raise HTTPException(status_code=503, detail="Google Calendar service not configured")
        
        # This would require the user's access token
        # Implement token retrieval and event creation logic here
        return {"success": True, "message": "Event creation not fully implemented"}

# Initialize services
vapi_service = VAPIService()
twilio_service = TwilioService()
stripe_service = StripeService()
google_calendar_service = GoogleCalendarService()

# Authentication
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Verify token with Supabase
        response = supabase.auth.get_user(credentials.credentials)
        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(token: str = Depends(verify_token)):
    """Get current authenticated user"""
    return token

async def log_activity(user_id: str, action: str, entity_type: str, entity_id: str, entity_name: str, details: Optional[Dict] = None):
    """Log user activity"""
    if not supabase:
        return
    
    try:
        supabase.table("activities").insert({
            "user_id": user_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "entity_name": entity_name,
            "details": details or {},
            "created_at": datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        print(f"Error logging activity: {e}")

# Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Ikon Systems Dashboard API v2.0.0",
        "status": "operational",
        "integrations": {
            "vapi": vapi_service.enabled,
            "stripe": stripe_service.enabled,
            "twilio": bool(twilio_service.account_sid),
            "google_calendar": google_calendar_service.enabled
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "services": {
            "database": supabase is not None,
            "vapi": vapi_service.enabled,
            "stripe": stripe_service.enabled,
            "twilio": bool(twilio_service.account_sid),
            "google_calendar": google_calendar_service.enabled
        }
    }

# Client Management
@app.post("/api/clients")
async def create_client(
    client_data: ClientCreate,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """Create a new client"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Insert client into database
        result = supabase.table("clients").insert({
            "name": client_data.name,
            "email": client_data.email,
            "phone": client_data.phone,
            "address": client_data.address,
            "status": client_data.status,
            "bilingual_preference": client_data.bilingual_preference,
            "notes": client_data.notes,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        
        if result.data:
            client_id = result.data[0]["id"]
            
            # Log activity
            background_tasks.add_task(
                log_activity,
                current_user.id,
                "create",
                "client",
                client_id,
                client_data.name
            )
            
            return {
                "success": True,
                "client_id": client_id,
                "data": result.data[0]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create client")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/clients")
async def get_clients(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user = Depends(get_current_user)
):
    """Get all clients with optional filtering"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        query = supabase.table("clients").select("*")
        
        if status:
            query = query.eq("status", status)
        
        result = query.range(offset, offset + limit - 1).execute()
        
        return {
            "success": True,
            "data": result.data,
            "count": len(result.data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Project Management
@app.post("/api/projects")
async def create_project(
    project_data: ProjectCreate,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """Create a new project"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Insert project into database
        result = supabase.table("projects").insert({
            "client_id": project_data.client_id,
            "name": project_data.name,
            "description": project_data.description,
            "status": project_data.status,
            "priority": project_data.priority,
            "budget": project_data.budget,
            "timeline": project_data.timeline,
            "start_date": project_data.start_date.isoformat() if project_data.start_date else None,
            "due_date": project_data.due_date.isoformat() if project_data.due_date else None,
            "notes": project_data.notes,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        
        if result.data:
            project_id = result.data[0]["id"]
            
            # Log activity
            background_tasks.add_task(
                log_activity,
                current_user.id,
                "create",
                "project",
                project_id,
                project_data.name
            )
            
            return {
                "success": True,
                "project_id": project_id,
                "data": result.data[0]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create project")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Appointment Management
@app.post("/api/appointments")
async def create_appointment(
    appointment_data: AppointmentCreate,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """Create a new appointment"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Insert appointment into database
        result = supabase.table("appointments").insert({
            "client_id": appointment_data.client_id,
            "date_time": appointment_data.date_time.isoformat(),
            "type": appointment_data.type,
            "title": appointment_data.title,
            "description": appointment_data.description,
            "duration": appointment_data.duration,
            "location": appointment_data.location,
            "notes": appointment_data.notes,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        
        if result.data:
            appointment_id = result.data[0]["id"]
            
            # Log activity
            background_tasks.add_task(
                log_activity,
                current_user.id,
                "create",
                "appointment",
                appointment_id,
                appointment_data.title or f"{appointment_data.type} appointment"
            )
            
            return {
                "success": True,
                "appointment_id": appointment_id,
                "data": result.data[0]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create appointment")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Invoice Management
@app.post("/api/invoices")
async def create_invoice(
    invoice_data: InvoiceCreate,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """Create a new invoice"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Insert invoice into database
        result = supabase.table("invoices").insert({
            "client_id": invoice_data.client_id,
            "project_id": invoice_data.project_id,
            "title": invoice_data.title,
            "description": invoice_data.description,
            "amount": invoice_data.amount,
            "tax_rate": invoice_data.tax_rate,
            "due_date": invoice_data.due_date.isoformat(),
            "notes": invoice_data.notes,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        
        if result.data:
            invoice_id = result.data[0]["id"]
            
            # Log activity
            background_tasks.add_task(
                log_activity,
                current_user.id,
                "create",
                "invoice",
                invoice_id,
                invoice_data.title
            )
            
            return {
                "success": True,
                "invoice_id": invoice_id,
                "data": result.data[0]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create invoice")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Voice Agent Management
@app.post("/api/voice-agents")
async def create_voice_agent(
    agent_data: VoiceAgentCreate,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """Create a new voice agent"""
    try:
        # Create agent via VAPI
        result = await vapi_service.create_agent(agent_data)
        
        if result["success"]:
            agent_id = result["agent_id"]
            
            # Store agent in database
            if supabase:
                supabase.table("voice_agents").insert({
                    "vapi_agent_id": agent_id,
                    "name": agent_data.name,
                    "phone_number": agent_data.phone_number,
                    "script": agent_data.script,
                    "client_id": agent_data.client_id,
                    "type": agent_data.type,
                    "model": agent_data.model,
                    "voice": agent_data.voice,
                    "max_duration": agent_data.max_duration,
                    "status": "active",
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }).execute()
            
            # Log activity
            background_tasks.add_task(
                log_activity,
                current_user.id,
                "create",
                "voice_agent",
                agent_id,
                agent_data.name
            )
            
            return {
                "success": True,
                "agent_id": agent_id,
                "data": result["data"]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create voice agent")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice-agents/{agent_id}/call")
async def make_voice_call(
    agent_id: str,
    phone_number: str,
    current_user = Depends(get_current_user)
):
    """Make a call using a voice agent"""
    try:
        result = await vapi_service.make_call(agent_id, phone_number)
        
        if result["success"]:
            return {
                "success": True,
                "call_id": result["data"].get("id"),
                "data": result["data"]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to make call")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Payment Management
@app.post("/api/payments")
async def create_payment(
    payment_data: PaymentCreate,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    """Create a new payment"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        # Insert payment into database
        result = supabase.table("payments").insert({
            "invoice_id": payment_data.invoice_id,
            "amount": payment_data.amount,
            "payment_method": payment_data.payment_method,
            "payment_date": payment_data.payment_date.isoformat(),
            "reference_number": payment_data.reference_number,
            "notes": payment_data.notes,
            "status": "completed",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        
        if result.data:
            payment_id = result.data[0]["id"]
            
            # Log activity
            background_tasks.add_task(
                log_activity,
                current_user.id,
                "create",
                "payment",
                payment_id,
                f"Payment of ${payment_data.amount}"
            )
            
            return {
                "success": True,
                "payment_id": payment_id,
                "data": result.data[0]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create payment")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Stripe Integration
@app.post("/api/stripe/payment-intent")
async def create_stripe_payment_intent(
    amount: float,
    currency: str = "usd",
    customer_id: Optional[str] = None,
    metadata: Optional[Dict[str, str]] = None,
    current_user = Depends(get_current_user)
):
    """Create a Stripe payment intent"""
    try:
        result = await stripe_service.create_payment_intent(
            amount=amount,
            currency=currency,
            customer_id=customer_id,
            metadata=metadata
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Google Calendar Integration
@app.get("/api/google-calendar/auth-url")
async def get_google_calendar_auth_url(current_user = Depends(get_current_user)):
    """Get Google Calendar OAuth URL"""
    try:
        auth_url = google_calendar_service.get_auth_url(current_user.id)
        return {
            "success": True,
            "auth_url": auth_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/google-calendar/callback")
async def google_calendar_callback(
    code: str,
    state: str,
    current_user = Depends(get_current_user)
):
    """Handle Google Calendar OAuth callback"""
    try:
        result = await google_calendar_service.exchange_code_for_token(code, state)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics
@app.post("/api/analytics")
async def get_analytics(
    analytics_request: AnalyticsRequest,
    current_user = Depends(get_current_user)
):
    """Get analytics data"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        analytics_data = {}
        
        # Revenue analytics
        if "revenue" in analytics_request.metrics:
            revenue_result = supabase.table("payments").select("amount").gte(
                "payment_date", analytics_request.start_date.isoformat()
            ).lte("payment_date", analytics_request.end_date.isoformat()).execute()
            
            total_revenue = sum(payment["amount"] for payment in revenue_result.data)
            analytics_data["revenue"] = {
                "total": total_revenue,
                "count": len(revenue_result.data)
            }
        
        # Client analytics
        if "clients" in analytics_request.metrics:
            clients_result = supabase.table("clients").select("status").execute()
            client_counts = {}
            for client in clients_result.data:
                status = client["status"]
                client_counts[status] = client_counts.get(status, 0) + 1
            
            analytics_data["clients"] = client_counts
        
        # Project analytics
        if "projects" in analytics_request.metrics:
            projects_result = supabase.table("projects").select("status").execute()
            project_counts = {}
            for project in projects_result.data:
                status = project["status"]
                project_counts[status] = project_counts.get(status, 0) + 1
            
            analytics_data["projects"] = project_counts
        
        # Appointment analytics
        if "appointments" in analytics_request.metrics:
            appointments_result = supabase.table("appointments").select("type").gte(
                "date_time", analytics_request.start_date.isoformat()
            ).lte("date_time", analytics_request.end_date.isoformat()).execute()
            
            appointment_counts = {}
            for appointment in appointments_result.data:
                appointment_type = appointment["type"]
                appointment_counts[appointment_type] = appointment_counts.get(appointment_type, 0) + 1
            
            analytics_data["appointments"] = appointment_counts
        
        return {
            "success": True,
            "data": analytics_data,
            "period": {
                "start": analytics_request.start_date.isoformat(),
                "end": analytics_request.end_date.isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Webhooks
@app.post("/webhooks/vapi")
async def vapi_webhook(payload: WebhookPayload):
    """Handle VAPI webhooks"""
    try:
        # Process VAPI webhook
        print(f"VAPI Webhook: {payload.event_type} - {payload.data}")
        
        # Update database based on webhook data
        if supabase and payload.event_type == "call.ended":
            call_data = payload.data
            # Update call status in database
            # Implement your logic here
        
        return {"success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhooks/stripe")
async def stripe_webhook(payload: Dict[str, Any]):
    """Handle Stripe webhooks"""
    try:
        # Process Stripe webhook
        event_type = payload.get("type")
        print(f"Stripe Webhook: {event_type}")
        
        # Update database based on webhook data
        if supabase and event_type == "payment_intent.succeeded":
            payment_data = payload.get("data", {}).get("object", {})
            # Update payment status in database
            # Implement your logic here
        
        return {"success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Additional endpoints
@app.get("/voice-agents/{agent_id}/logs")
async def get_agent_logs(
    agent_id: str,
    current_user = Depends(get_current_user)
):
    """Get logs for a specific voice agent"""
    try:
        logs = await vapi_service.get_agent_logs(agent_id)
        return {
            "success": True,
            "data": logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sms/send")
async def send_sms(
    to: str,
    message: str,
    current_user = Depends(get_current_user)
):
    """Send SMS via Twilio"""
    try:
        result = await twilio_service.send_sms(to, message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/phone-numbers")
async def get_phone_numbers(current_user = Depends(get_current_user)):
    """Get all Twilio phone numbers"""
    try:
        phone_numbers = await twilio_service.get_phone_numbers()
        return {
            "success": True,
            "data": phone_numbers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/activities")
async def get_recent_activities(
    limit: int = 20,
    offset: int = 0,
    current_user = Depends(get_current_user)
):
    """Get recent user activities"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        result = supabase.table("activities").select("*").eq(
            "user_id", current_user.id
        ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return {
            "success": True,
            "data": result.data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {"error": exc.detail, "status_code": exc.status_code}

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return {"error": "Internal server error", "status_code": 500}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)