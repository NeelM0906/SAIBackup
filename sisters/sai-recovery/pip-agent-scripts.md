# SAI BD-PIP Agent - Operational Scripts & Tools

## 🔧 PROSPECTING AUTOMATION SCRIPTS

### Lead Research Automation

#### Script 1: NJ/NY Medical Practice Finder
```bash
#!/bin/bash
# pip-practice-finder.sh
# Searches for emergency medicine and orthopedic practices in target areas

echo "SAI BD-PIP Practice Finder"
echo "=========================="

# Target cities in NJ
NJ_CITIES=("Newark" "Jersey City" "Paterson" "Elizabeth" "Edison" "Woodbridge" "Lakewood" "Toms River" "Hamilton" "Trenton")

# Target cities in NY  
NY_CITIES=("New York" "Buffalo" "Rochester" "Yonkers" "Syracuse" "Albany" "New Rochelle" "Mount Vernon" "Schenectady" "Utica")

# Practice types
SPECIALTIES=("Emergency Medicine" "Orthopedic Surgery" "Urgent Care" "Sports Medicine" "Pain Management")

echo "Searching for target practices..."

for state in "NJ" "NY"; do
    if [ "$state" = "NJ" ]; then
        cities=("${NJ_CITIES[@]}")
    else
        cities=("${NY_CITIES[@]}")
    fi
    
    for city in "${cities[@]}"; do
        for specialty in "${SPECIALTIES[@]}"; do
            echo "Searching: $specialty in $city, $state"
            # Web search automation would go here
            # Output to CSV format for CRM import
        done
    done
done

echo "Practice search completed. Results saved to prospects-$(date +%Y%m%d).csv"
```

#### Script 2: PIP Claims Volume Estimator
```python
#!/usr/bin/env python3
# pip_volume_estimator.py
# Estimates PIP claim volume based on practice characteristics

import json
import requests
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class PracticeProfile:
    name: str
    specialty: str
    location: str
    size_tier: str  # Small, Medium, Large, Health System
    trauma_level: Optional[str] = None
    estimated_pip_volume: Optional[int] = None
    priority_score: Optional[int] = None

class PIPVolumeCalculator:
    
    # Base volume multipliers by specialty
    SPECIALTY_MULTIPLIERS = {
        "Emergency Medicine": 8.5,
        "Orthopedic Surgery": 6.2,
        "Urgent Care": 4.1,
        "Sports Medicine": 3.8,
        "Pain Management": 5.5
    }
    
    # Size tier multipliers
    SIZE_MULTIPLIERS = {
        "Small": 1.0,
        "Medium": 2.8,
        "Large": 5.2,
        "Health System": 12.5
    }
    
    # Geographic multipliers (auto accident rates)
    GEO_MULTIPLIERS = {
        # NJ Cities (high traffic density)
        "Newark, NJ": 1.8,
        "Jersey City, NJ": 1.6,
        "Paterson, NJ": 1.4,
        "Elizabeth, NJ": 1.5,
        # NY Cities
        "New York, NY": 2.1,
        "Buffalo, NY": 1.3,
        "Rochester, NY": 1.2,
        "Yonkers, NY": 1.4
    }
    
    def calculate_volume(self, practice: PracticeProfile) -> PracticeProfile:
        """Calculate estimated monthly PIP volume"""
        
        base_volume = 15  # Base monthly auto accident cases
        
        # Apply multipliers
        specialty_mult = self.SPECIALTY_MULTIPLIERS.get(practice.specialty, 1.0)
        size_mult = self.SIZE_MULTIPLIERS.get(practice.size_tier, 1.0)
        geo_mult = self.GEO_MULTIPLIERS.get(practice.location, 1.0)
        
        # Trauma level bonus for emergency medicine
        trauma_bonus = 1.0
        if practice.specialty == "Emergency Medicine" and practice.trauma_level:
            trauma_bonus = {"Level I": 2.5, "Level II": 2.0, "Level III": 1.5}.get(practice.trauma_level, 1.0)
        
        estimated_volume = int(base_volume * specialty_mult * size_mult * geo_mult * trauma_bonus)
        practice.estimated_pip_volume = estimated_volume
        
        # Calculate priority score (0-100)
        priority_score = min(100, estimated_volume * 2)
        practice.priority_score = priority_score
        
        return practice
    
    def batch_calculate(self, practices: List[PracticeProfile]) -> List[PracticeProfile]:
        """Calculate volumes for multiple practices"""
        return [self.calculate_volume(practice) for practice in practices]

# Example usage
if __name__ == "__main__":
    calculator = PIPVolumeCalculator()
    
    sample_practices = [
        PracticeProfile(
            name="Emergency Medical Associates", 
            specialty="Emergency Medicine",
            location="Newark, NJ",
            size_tier="Health System",
            trauma_level="Level I"
        ),
        PracticeProfile(
            name="Metro Orthopedic Group",
            specialty="Orthopedic Surgery", 
            location="New York, NY",
            size_tier="Large"
        )
    ]
    
    results = calculator.batch_calculate(sample_practices)
    
    for practice in results:
        print(f"{practice.name}: {practice.estimated_pip_volume} cases/month (Priority: {practice.priority_score})")
```

### CRM Integration Scripts

#### Script 3: Prospect Data Enrichment
```python
#!/usr/bin/env python3
# prospect_enricher.py
# Enriches prospect data with public information

import requests
import json
from typing import Dict, Optional

class ProspectEnricher:
    
    def __init__(self):
        self.apis = {
            "npi_registry": "https://npiregistry.cms.hhs.gov/api/",
            "state_licensing": {
                "NJ": "https://www.njconsumeraffairs.gov/medical/",
                "NY": "https://www.op.nysed.gov/prof/med/"
            }
        }
    
    def enrich_practice(self, practice_name: str, state: str) -> Dict:
        """Enrich practice data with public information"""
        
        enriched_data = {
            "practice_name": practice_name,
            "state": state,
            "npi_numbers": [],
            "physician_count": 0,
            "specialties": [],
            "locations": [],
            "board_certifications": [],
            "licensing_status": "Unknown",
            "malpractice_history": "No data",
            "estimated_revenue": None
        }
        
        # NPI Registry lookup
        npi_data = self._lookup_npi(practice_name)
        if npi_data:
            enriched_data.update(npi_data)
        
        # State licensing verification
        licensing_data = self._verify_licensing(practice_name, state)
        if licensing_data:
            enriched_data.update(licensing_data)
        
        # Revenue estimation
        enriched_data["estimated_revenue"] = self._estimate_revenue(enriched_data)
        
        return enriched_data
    
    def _lookup_npi(self, practice_name: str) -> Optional[Dict]:
        """Look up practice in NPI registry"""
        # Implementation would call actual NPI API
        return {
            "npi_numbers": ["1234567890"],
            "physician_count": 5,
            "specialties": ["Emergency Medicine"]
        }
    
    def _verify_licensing(self, practice_name: str, state: str) -> Optional[Dict]:
        """Verify licensing status"""
        # Implementation would call state licensing APIs
        return {
            "licensing_status": "Active",
            "board_certifications": ["Emergency Medicine", "Internal Medicine"]
        }
    
    def _estimate_revenue(self, practice_data: Dict) -> Optional[int]:
        """Estimate annual revenue based on practice characteristics"""
        physician_count = practice_data.get("physician_count", 0)
        specialties = practice_data.get("specialties", [])
        
        if not physician_count:
            return None
        
        # Revenue per physician by specialty
        revenue_multipliers = {
            "Emergency Medicine": 650000,  # Average annual revenue per EM physician
            "Orthopedic Surgery": 750000,
            "Urgent Care": 400000
        }
        
        base_revenue = physician_count * 500000  # Default multiplier
        
        for specialty in specialties:
            if specialty in revenue_multipliers:
                base_revenue = physician_count * revenue_multipliers[specialty]
                break
        
        return base_revenue
```

## 📞 OUTREACH AUTOMATION TOOLS

### Email Campaign Management

#### Script 4: Personalized Email Generator
```python
#!/usr/bin/env python3
# email_personalizer.py
# Generates personalized outreach emails

import json
from string import Template
from typing import Dict, List
from datetime import datetime, timedelta

class EmailPersonalizer:
    
    def __init__(self):
        self.templates = self._load_templates()
        self.personalization_data = {}
    
    def _load_templates(self) -> Dict[str, Template]:
        """Load email templates"""
        
        templates = {
            "pain_point_focus": Template("""
Subject: $practice_name - Are PIP payment delays affecting your auto accident revenue?

$first_name,

I noticed $practice_name treats a significant number of auto accident patients in $location. Are you experiencing the same PIP payment delays that are affecting 73% of $state emergency medicine groups?

Our specialized PIP recovery team has helped practices like yours:
• Recover $$2.3M in delayed PIP payments (avg case)
• Reduce arbitration time from 180 to 45 days  
• Achieve 94% success rate in contested claims

$custom_insight

Would you be open to a 15-minute conversation about guaranteeing your PIP recovery?

Best regards,
$agent_name
Callagy Recovery - PIP Specialists
Direct: $phone_number
"""),
            
            "market_update": Template("""
Subject: $state Fee Schedule Changes - Impact on Your PIP Revenue

$first_name,

With the $year $state PIP fee schedule updates, many practices are concerned about revenue impact.

We're hosting a complimentary briefing for $region medical practices on:
• New fee schedule implications
• Protecting revenue during transition  
• Arbitration strategy updates

$call_to_action

Worth 15 minutes of your time?

$agent_name
Callagy Recovery
"""),
            
            "success_story": Template("""
Subject: How $similar_practice recovered $$recovery_amount in delayed PIP claims

$first_name,

$similar_practice in $similar_location was struggling with $problem_duration PIP arbitration delays until we implemented our guarantee system.

Results in 90 days:
• $$recovery_amount recovered from backlogged claims
• 45-day average arbitration resolution
• Zero cost until recovery

$specific_benefit

Would you be interested in a brief call to see if we can achieve similar results for $practice_name?

$agent_name
""")
        }
        
        return templates
    
    def generate_email(self, prospect: Dict, template_type: str) -> str:
        """Generate personalized email for prospect"""
        
        if template_type not in self.templates:
            raise ValueError(f"Unknown template type: {template_type}")
        
        template = self.templates[template_type]
        
        # Build personalization context
        context = self._build_context(prospect, template_type)
        
        # Generate email
        email_content = template.safe_substitute(context)
        
        return email_content
    
    def _build_context(self, prospect: Dict, template_type: str) -> Dict:
        """Build personalization context for prospect"""
        
        base_context = {
            "first_name": prospect.get("first_name", ""),
            "practice_name": prospect.get("practice_name", ""),
            "location": prospect.get("location", ""),
            "state": prospect.get("state", ""),
            "agent_name": "SAI Recovery Agent",
            "phone_number": "(555) 123-4567",
            "year": datetime.now().year
        }
        
        # Template-specific context
        if template_type == "pain_point_focus":
            base_context.update({
                "custom_insight": self._generate_custom_insight(prospect)
            })
        
        elif template_type == "success_story":
            success_story = self._select_success_story(prospect)
            base_context.update(success_story)
        
        return base_context
    
    def _generate_custom_insight(self, prospect: Dict) -> str:
        """Generate custom insight based on prospect characteristics"""
        
        specialty = prospect.get("specialty", "")
        estimated_volume = prospect.get("estimated_pip_volume", 0)
        
        if "Emergency" in specialty and estimated_volume > 50:
            return "Given your high-volume emergency department, you're likely seeing $200K+ in delayed PIP payments monthly."
        
        elif "Orthopedic" in specialty:
            return "Complex orthopedic PIP cases often face 2x more denials - we specialize in these challenging recoveries."
        
        return "Based on your practice profile, we estimate you have $75K-$150K in recoverable PIP claims."
    
    def _select_success_story(self, prospect: Dict) -> Dict:
        """Select relevant success story for prospect"""
        
        # Match success story to prospect characteristics
        stories = {
            "Emergency Medicine": {
                "similar_practice": "Metro Emergency Associates",
                "similar_location": "Trenton",
                "recovery_amount": "1.8M",
                "problem_duration": "6-month",
                "specific_benefit": "Emergency departments see immediate impact due to high claim volume."
            },
            "Orthopedic Surgery": {
                "similar_practice": "Garden State Orthopedics", 
                "similar_location": "Princeton",
                "recovery_amount": "950K",
                "problem_duration": "4-month",
                "specific_benefit": "Orthopedic cases often yield higher recovery amounts due to treatment complexity."
            }
        }
        
        specialty = prospect.get("specialty", "Emergency Medicine")
        return stories.get(specialty, stories["Emergency Medicine"])

# Example usage
if __name__ == "__main__":
    personalizer = EmailPersonalizer()
    
    sample_prospect = {
        "first_name": "Dr. Smith",
        "practice_name": "Metro Emergency Group", 
        "location": "Newark, NJ",
        "state": "NJ",
        "specialty": "Emergency Medicine",
        "estimated_pip_volume": 85
    }
    
    email = personalizer.generate_email(sample_prospect, "pain_point_focus")
    print(email)
```

### Call Management System

#### Script 5: Call Tracking & Follow-up
```python
#!/usr/bin/env python3
# call_tracker.py
# Tracks calls and manages follow-up sequences

import json
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict

class CallOutcome(Enum):
    CONNECTED = "connected"
    VOICEMAIL = "voicemail"  
    NO_ANSWER = "no_answer"
    BUSY = "busy"
    WRONG_NUMBER = "wrong_number"
    SCHEDULED_CALLBACK = "scheduled_callback"
    NOT_INTERESTED = "not_interested"
    QUALIFIED = "qualified"

@dataclass
class CallRecord:
    prospect_id: str
    call_date: datetime
    outcome: CallOutcome
    duration_seconds: int
    notes: str
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None
    qualification_score: Optional[int] = None
    
class CallTracker:
    
    def __init__(self, data_file: str = "call_records.json"):
        self.data_file = data_file
        self.call_records = self._load_records()
    
    def _load_records(self) -> List[CallRecord]:
        """Load call records from file"""
        try:
            with open(self.data_file, 'r') as f:
                data = json.load(f)
                return [CallRecord(**record) for record in data]
        except FileNotFoundError:
            return []
    
    def save_records(self):
        """Save call records to file"""
        data = []
        for record in self.call_records:
            record_dict = asdict(record)
            # Convert datetime objects to strings
            record_dict['call_date'] = record.call_date.isoformat()
            if record.next_action_date:
                record_dict['next_action_date'] = record.next_action_date.isoformat()
            data.append(record_dict)
        
        with open(self.data_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def log_call(self, prospect_id: str, outcome: CallOutcome, duration: int, notes: str) -> CallRecord:
        """Log a call outcome"""
        
        call_record = CallRecord(
            prospect_id=prospect_id,
            call_date=datetime.now(),
            outcome=outcome,
            duration_seconds=duration,
            notes=notes
        )
        
        # Auto-schedule next action based on outcome
        call_record.next_action, call_record.next_action_date = self._determine_next_action(outcome)
        
        # Calculate qualification score if qualified
        if outcome == CallOutcome.QUALIFIED:
            call_record.qualification_score = self._calculate_qualification_score(notes)
        
        self.call_records.append(call_record)
        self.save_records()
        
        return call_record
    
    def _determine_next_action(self, outcome: CallOutcome) -> tuple[Optional[str], Optional[datetime]]:
        """Determine next action based on call outcome"""
        
        actions = {
            CallOutcome.NO_ANSWER: ("retry_call", datetime.now() + timedelta(hours=4)),
            CallOutcome.BUSY: ("retry_call", datetime.now() + timedelta(hours=2)),
            CallOutcome.VOICEMAIL: ("follow_up_email", datetime.now() + timedelta(hours=1)),
            CallOutcome.SCHEDULED_CALLBACK: ("scheduled_call", None),  # Date set separately
            CallOutcome.QUALIFIED: ("send_proposal", datetime.now() + timedelta(hours=2)),
            CallOutcome.NOT_INTERESTED: ("nurture_sequence", datetime.now() + timedelta(days=90)),
            CallOutcome.WRONG_NUMBER: ("update_contact_info", datetime.now())
        }
        
        return actions.get(outcome, (None, None))
    
    def _calculate_qualification_score(self, notes: str) -> int:
        """Calculate qualification score based on call notes"""
        
        # Simple keyword-based scoring
        score_keywords = {
            "payment delays": 15,
            "arbitration": 10,
            "denied claims": 10,
            "high volume": 15,
            "interested": 20,
            "decision maker": 15,
            "budget": 10,
            "timeline": 5
        }
        
        score = 0
        notes_lower = notes.lower()
        
        for keyword, points in score_keywords.items():
            if keyword in notes_lower:
                score += points
        
        return min(100, score)  # Cap at 100
    
    def get_due_actions(self) -> List[Dict]:
        """Get actions due now"""
        
        now = datetime.now()
        due_actions = []
        
        for record in self.call_records:
            if (record.next_action and 
                record.next_action_date and 
                record.next_action_date <= now):
                
                due_actions.append({
                    "prospect_id": record.prospect_id,
                    "action": record.next_action,
                    "due_date": record.next_action_date,
                    "last_call": record.call_date,
                    "last_outcome": record.outcome.value
                })
        
        return sorted(due_actions, key=lambda x: x["due_date"])
    
    def get_prospect_history(self, prospect_id: str) -> List[CallRecord]:
        """Get call history for specific prospect"""
        return [record for record in self.call_records if record.prospect_id == prospect_id]
    
    def get_call_statistics(self) -> Dict:
        """Get call performance statistics"""
        
        if not self.call_records:
            return {}
        
        total_calls = len(self.call_records)
        outcomes = {}
        
        for record in self.call_records:
            outcome = record.outcome.value
            outcomes[outcome] = outcomes.get(outcome, 0) + 1
        
        # Calculate rates
        connect_rate = (outcomes.get("connected", 0) / total_calls) * 100
        qualification_rate = (outcomes.get("qualified", 0) / total_calls) * 100
        
        return {
            "total_calls": total_calls,
            "outcome_breakdown": outcomes,
            "connect_rate": round(connect_rate, 2),
            "qualification_rate": round(qualification_rate, 2),
            "average_call_duration": sum(r.duration_seconds for r in self.call_records) / total_calls
        }

# Example usage
if __name__ == "__main__":
    tracker = CallTracker()
    
    # Log a sample call
    tracker.log_call(
        prospect_id="practice_001",
        outcome=CallOutcome.QUALIFIED,
        duration=420,  # 7 minutes
        notes="Spoke with practice manager. High volume ER, 80+ auto accidents/month. Experiencing 4-6 month payment delays. Very interested in arbitration guarantee. Decision maker, can move quickly."
    )
    
    # Check due actions
    due_actions = tracker.get_due_actions()
    print("Due Actions:", due_actions)
    
    # Get statistics
    stats = tracker.get_call_statistics()
    print("Call Stats:", stats)
```

## 📊 PERFORMANCE TRACKING TOOLS

### Script 6: KPI Dashboard Generator
```python
#!/usr/bin/env python3
# kpi_dashboard.py
# Generates performance dashboard for BD-PIP agent

import json
from datetime import datetime, timedelta
from typing import Dict, List
import matplotlib.pyplot as plt
import pandas as pd

class PIPAgentDashboard:
    
    def __init__(self):
        self.data_sources = {
            "prospects": "prospects.json",
            "calls": "call_records.json", 
            "emails": "email_campaigns.json",
            "clients": "client_pipeline.json"
        }
        self.kpis = {}
    
    def generate_dashboard(self) -> Dict:
        """Generate complete KPI dashboard"""
        
        self.kpis = {
            "lead_generation": self._calculate_lead_metrics(),
            "conversion": self._calculate_conversion_metrics(), 
            "revenue": self._calculate_revenue_metrics(),
            "activity": self._calculate_activity_metrics(),
            "client_success": self._calculate_client_metrics()
        }
        
        return self.kpis
    
    def _calculate_lead_metrics(self) -> Dict:
        """Calculate lead generation KPIs"""
        
        # Sample calculation - would integrate with actual data
        return {
            "prospects_contacted_month": 205,
            "target_prospects_month": 200,
            "qualified_leads_month": 52,
            "target_qualified_month": 50,
            "qualification_rate": 25.4,
            "target_qualification_rate": 25.0,
            "quality_score_avg": 73,
            "trend_qualified_leads": "+8.3%"
        }
    
    def _calculate_conversion_metrics(self) -> Dict:
        """Calculate conversion KPIs"""
        
        return {
            "consultations_scheduled": 31,
            "target_consultations": 30,
            "consultation_show_rate": 87.1,
            "proposals_delivered": 26,
            "proposal_close_rate": 73.1,
            "new_clients_month": 19,
            "target_new_clients": 12,
            "client_acquisition_cost": 2450,
            "conversion_velocity_days": 18.5
        }
    
    def _calculate_revenue_metrics(self) -> Dict:
        """Calculate revenue KPIs"""
        
        return {
            "new_client_revenue_month": 684000,
            "target_new_revenue_month": 480000,
            "pipeline_value_current": 1820000,
            "target_pipeline_value": 1440000,
            "avg_client_value": 36000,
            "revenue_per_client_annual": 216000,
            "pipeline_velocity_days": 42.3,
            "win_probability_avg": 78.5
        }
    
    def _calculate_activity_metrics(self) -> Dict:
        """Calculate activity KPIs"""
        
        return {
            "outbound_calls_day": 43,
            "target_calls_day": 40,
            "emails_sent_week": 185,
            "email_response_rate": 12.4,
            "linkedin_connections_week": 67,
            "meetings_booked_week": 14,
            "follow_ups_completed": 156,
            "activity_score": 92
        }
    
    def _calculate_client_metrics(self) -> Dict:
        """Calculate client success KPIs"""
        
        return {
            "avg_recovery_rate": 91.7,
            "target_recovery_rate": 90.0,
            "avg_recovery_timeline_days": 47,
            "target_recovery_timeline": 60,
            "client_satisfaction": 4.6,
            "arbitration_win_rate": 94.2,
            "client_retention_rate": 96.8,
            "referrals_generated": 23
        }
    
    def export_dashboard(self, filename: str = None):
        """Export dashboard to file"""
        
        if not filename:
            filename = f"pip_agent_dashboard_{datetime.now().strftime('%Y%m%d')}.json"
        
        dashboard_data = {
            "generated_at": datetime.now().isoformat(),
            "period": "Current Month",
            "kpis": self.kpis,
            "summary": self._generate_summary()
        }
        
        with open(filename, 'w') as f:
            json.dump(dashboard_data, f, indent=2)
        
        print(f"Dashboard exported to {filename}")
    
    def _generate_summary(self) -> Dict:
        """Generate executive summary"""
        
        return {
            "status": "Exceeding Targets",
            "key_wins": [
                "58% above new client target (19 vs 12)",
                "42.5% above revenue target ($684K vs $480K)", 
                "Quality leads trending up 8.3%"
            ],
            "areas_for_improvement": [
                "Email response rate below industry avg",
                "Pipeline velocity could be faster"
            ],
            "recommendations": [
                "Optimize email messaging for higher response",
                "Implement faster proposal delivery process",
                "Expand referral program for qualified leads"
            ]
        }
    
    def create_visual_dashboard(self):
        """Create visual dashboard charts"""
        
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        
        # Chart 1: Monthly Progress vs Targets
        metrics = ['Prospects', 'Qualified', 'Clients', 'Revenue']
        actual = [205, 52, 19, 684]
        target = [200, 50, 12, 480]
        
        x = range(len(metrics))
        ax1.bar([i-0.2 for i in x], actual, 0.4, label='Actual', color='green', alpha=0.7)
        ax1.bar([i+0.2 for i in x], target, 0.4, label='Target', color='blue', alpha=0.7)
        ax1.set_xticks(x)
        ax1.set_xticklabels(metrics)
        ax1.set_title('Monthly Performance vs Targets')
        ax1.legend()
        
        # Chart 2: Conversion Funnel
        funnel_stages = ['Contacts', 'Qualified', 'Consultations', 'Proposals', 'Closed']
        funnel_values = [205, 52, 31, 26, 19]
        
        ax2.plot(funnel_stages, funnel_values, marker='o', linewidth=3, markersize=8)
        ax2.fill_between(funnel_stages, funnel_values, alpha=0.3)
        ax2.set_title('Conversion Funnel')
        ax2.tick_params(axis='x', rotation=45)
        
        # Chart 3: Client Success Metrics
        success_metrics = ['Recovery\nRate %', 'Timeline\nDays', 'Satisfaction', 'Arbitration\nWin %']
        success_values = [91.7, 47, 4.6, 94.2]
        targets = [90.0, 60, 4.5, 90.0]
        
        ax3.bar(success_metrics, success_values, color='purple', alpha=0.7)
        ax3.set_title('Client Success Metrics')
        ax3.tick_params(axis='x', rotation=45)
        
        # Chart 4: Revenue Trend (simulated)
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        revenue_trend = [320, 450, 580, 640, 684, 720]
        
        ax4.plot(months, revenue_trend, marker='o', color='green', linewidth=3)
        ax4.fill_between(months, revenue_trend, alpha=0.3, color='green')
        ax4.set_title('Monthly Revenue Trend ($K)')
        ax4.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(f"pip_agent_dashboard_{datetime.now().strftime('%Y%m%d')}.png", dpi=300, bbox_inches='tight')
        plt.show()

# Example usage
if __name__ == "__main__":
    dashboard = PIPAgentDashboard()
    kpis = dashboard.generate_dashboard()
    
    print("SAI BD-PIP Agent Dashboard")
    print("==========================")
    
    for category, metrics in kpis.items():
        print(f"\n{category.upper()}")
        for metric, value in metrics.items():
            print(f"  {metric}: {value}")
    
    dashboard.export_dashboard()
    dashboard.create_visual_dashboard()
```

## 🤖 AGENT ORCHESTRATION

### Script 7: Main BD-PIP Agent Controller
```python
#!/usr/bin/env python3
# pip_agent_controller.py
# Main orchestration script for SAI BD-PIP agent

import asyncio
import schedule
import time
from datetime import datetime, timedelta
from typing import Dict, List
import logging

# Import our custom modules
from email_personalizer import EmailPersonalizer
from call_tracker import CallTracker, CallOutcome
from kpi_dashboard import PIPAgentDashboard

class SAIBDPIPAgent:
    """Main SAI BD-PIP Agent Controller"""
    
    def __init__(self):
        self.agent_name = "SAI BD-PIP"
        self.version = "1.0.0"
        self.start_time = datetime.now()
        
        # Initialize components
        self.email_personalizer = EmailPersonalizer()
        self.call_tracker = CallTracker()
        self.dashboard = PIPAgentDashboard()
        
        # Agent state
        self.active = False
        self.daily_targets = {
            "outbound_calls": 40,
            "emails_sent": 25, 
            "qualified_leads": 2,
            "consultations_booked": 1
        }
        
        self.current_metrics = {
            "outbound_calls": 0,
            "emails_sent": 0,
            "qualified_leads": 0,
            "consultations_booked": 0
        }
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('pip_agent.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    async def start_agent(self):
        """Start the BD-PIP agent"""
        
        self.logger.info(f"Starting {self.agent_name} Agent v{self.version}")
        self.active = True
        
        # Setup daily schedules
        self._setup_schedules()
        
        # Daily startup routine
        await self.morning_routine()
        
        # Main execution loop
        while self.active:
            await self.execute_daily_cycle()
            await asyncio.sleep(3600)  # Check every hour
    
    def _setup_schedules(self):
        """Setup automated schedules"""
        
        # Daily routines
        schedule.every().day.at("09:00").do(self.morning_routine)
        schedule.every().day.at("12:00").do(self.midday_check)
        schedule.every().day.at("17:00").do(self.end_of_day_routine)
        
        # Hourly tasks
        schedule.every().hour.do(self.process_due_actions)
        
        # Weekly tasks
        schedule.every().monday.at("10:00").do(self.weekly_planning)
        schedule.every().friday.at("16:00").do(self.weekly_review)
    
    async def morning_routine(self):
        """Execute morning startup routine"""
        
        self.logger.info("Executing morning routine...")
        
        # Reset daily metrics
        self.current_metrics = {k: 0 for k in self.daily_targets.keys()}
        
        # Check due actions from yesterday
        due_actions = self.call_tracker.get_due_actions()
        if due_actions:
            self.logger.info(f"Found {len(due_actions)} due actions")
            await self.process_action_list(due_actions[:10])  # Process top 10
        
        # Generate daily prospect list
        daily_prospects = await self.generate_daily_prospect_list()
        self.logger.info(f"Daily prospect list: {len(daily_prospects)} prospects")
        
        # Send morning performance summary
        await self.send_performance_update("morning")
    
    async def execute_daily_cycle(self):
        """Execute main daily work cycle"""
        
        current_hour = datetime.now().hour
        
        if 9 <= current_hour <= 17:  # Business hours
            
            # Morning prospecting block (10-12)
            if 10 <= current_hour <= 11:
                await self.prospecting_block()
            
            # Afternoon client work (13-16) 
            elif 13 <= current_hour <= 16:
                await self.client_work_block()
            
            # End of day wrap-up (17)
            elif current_hour == 17:
                await self.end_of_day_routine()
    
    async def prospecting_block(self):
        """Execute 2-hour prospecting block"""
        
        self.logger.info("Starting prospecting block...")
        
        # Get prospect list for calls
        prospects_to_call = await self.get_call_prospects(20)  # 20 prospects
        
        # Make outbound calls
        for prospect in prospects_to_call:
            if self.current_metrics["outbound_calls"] < self.daily_targets["outbound_calls"]:
                await self.make_outbound_call(prospect)
                await asyncio.sleep(60)  # 1 minute between calls
        
        # Send follow-up emails
        email_prospects = await self.get_email_prospects(15)  # 15 prospects
        for prospect in email_prospects:
            if self.current_metrics["emails_sent"] < self.daily_targets["emails_sent"]:
                await self.send_prospecting_email(prospect)
                await asyncio.sleep(30)  # 30 seconds between emails
    
    async def make_outbound_call(self, prospect: Dict):
        """Make an outbound call to prospect"""
        
        self.logger.info(f"Calling {prospect['practice_name']}")
        
        # Simulate call (in real implementation, would integrate with phone system)
        call_duration = 180  # 3 minutes average
        
        # Determine outcome (simplified simulation)
        import random
        outcomes = [
            CallOutcome.CONNECTED,
            CallOutcome.VOICEMAIL, 
            CallOutcome.NO_ANSWER,
            CallOutcome.QUALIFIED
        ]
        weights = [0.25, 0.35, 0.35, 0.05]  # Realistic outcome probabilities
        
        outcome = random.choices(outcomes, weights=weights)[0]
        
        # Generate call notes based on outcome
        notes = self._generate_call_notes(prospect, outcome)
        
        # Log the call
        self.call_tracker.log_call(
            prospect_id=prospect['id'],
            outcome=outcome,
            duration=call_duration,
            notes=notes
        )
        
        # Update metrics
        self.current_metrics["outbound_calls"] += 1
        if outcome == CallOutcome.QUALIFIED:
            self.current_metrics["qualified_leads"] += 1
        
        self.logger.info(f"Call completed: {outcome.value}")
    
    def _generate_call_notes(self, prospect: Dict, outcome: CallOutcome) -> str:
        """Generate realistic call notes"""
        
        base_notes = f"Called {prospect['practice_name']} - {prospect['location']}"
        
        outcome_notes = {
            CallOutcome.CONNECTED: "Spoke with office manager. Practice handles 30+ auto accidents monthly. Interested in learning more about payment guarantees. Scheduled follow-up call.",
            CallOutcome.VOICEMAIL: "Left detailed voicemail explaining PIP recovery guarantee. Mentioned specific benefits for emergency medicine practices.",
            CallOutcome.NO_ANSWER: "No answer. Will try again in 4 hours.",
            CallOutcome.QUALIFIED: "Excellent call! Practice administrator confirmed 50+ auto accident cases monthly, experiencing 90+ day payment delays. Ready to discuss partnership. High qualification score."
        }
        
        return f"{base_notes}. {outcome_notes.get(outcome, 'Standard call outcome')}"
    
    async def send_prospecting_email(self, prospect: Dict):
        """Send personalized prospecting email"""
        
        # Select appropriate template based on prospect characteristics
        if prospect.get("estimated_pip_volume", 0) > 50:
            template_type = "pain_point_focus"
        elif "Orthopedic" in prospect.get("specialty", ""):
            template_type = "success_story" 
        else:
            template_type = "market_update"
        
        # Generate personalized email
        email_content = self.email_personalizer.generate_email(prospect, template_type)
        
        # Send email (in real implementation, would integrate with email system)
        self.logger.info(f"Sent {template_type} email to {prospect['practice_name']}")
        
        # Update metrics
        self.current_metrics["emails_sent"] += 1
    
    async def process_due_actions(self):
        """Process actions that are due"""
        
        due_actions = self.call_tracker.get_due_actions()
        
        if not due_actions:
            return
        
        self.logger.info(f"Processing {len(due_actions)} due actions")
        
        for action in due_actions[:5]:  # Process top 5 due actions
            await self.execute_action(action)
    
    async def execute_action(self, action: Dict):
        """Execute a specific action"""
        
        action_type = action["action"]
        prospect_id = action["prospect_id"]
        
        if action_type == "retry_call":
            # Add to call list
            self.logger.info(f"Added {prospect_id} to retry call list")
        
        elif action_type == "follow_up_email":
            # Send follow-up email
            self.logger.info(f"Sending follow-up email to {prospect_id}")
        
        elif action_type == "send_proposal":
            # Generate and send proposal
            self.logger.info(f"Generating proposal for {prospect_id}")
            
    async def weekly_review(self):
        """Execute weekly performance review"""
        
        self.logger.info("Executing weekly review...")
        
        # Generate comprehensive dashboard
        kpis = self.dashboard.generate_dashboard()
        
        # Export dashboard
        self.dashboard.export_dashboard()
        
        # Log key metrics
        self.logger.info("Weekly KPIs:")
        for category, metrics in kpis.items():
            self.logger.info(f"  {category}: {metrics}")
        
        # Generate performance insights
        insights = self._generate_performance_insights(kpis)
        self.logger.info(f"Performance insights: {insights}")
    
    def _generate_performance_insights(self, kpis: Dict) -> List[str]:
        """Generate actionable performance insights"""
        
        insights = []
        
        # Check lead generation performance
        qualified_rate = kpis["lead_generation"].get("qualification_rate", 0)
        if qualified_rate < 20:
            insights.append("Qualification rate below target - review prospect targeting criteria")
        
        # Check conversion performance  
        close_rate = kpis["conversion"].get("proposal_close_rate", 0)
        if close_rate < 70:
            insights.append("Proposal close rate below target - review value proposition messaging")
        
        # Check activity levels
        activity_score = kpis["activity"].get("activity_score", 0)
        if activity_score < 85:
            insights.append("Activity levels below optimal - increase outbound volume")
        
        return insights
    
    def stop_agent(self):
        """Stop the BD-PIP agent"""
        
        self.logger.info(f"Stopping {self.agent_name} Agent")
        self.active = False

# Example usage and startup
if __name__ == "__main__":
    agent = SAIBDPIPAgent()
    
    try:
        # Start the agent
        asyncio.run(agent.start_agent())
    except KeyboardInterrupt:
        agent.logger.info("Agent stopped by user")
        agent.stop_agent()
```

---

## 🚀 IMPLEMENTATION CHECKLIST

### Immediate Setup (Week 1)
- [ ] Deploy prospect research scripts
- [ ] Set up CRM integration workflows
- [ ] Configure email templates and automation
- [ ] Initialize call tracking system
- [ ] Create performance dashboard

### System Integration (Week 2)
- [ ] Test all automation scripts
- [ ] Validate data flows
- [ ] Configure monitoring and alerts
- [ ] Train team on new tools
- [ ] Launch pilot prospecting campaign

### Optimization (Week 3-4)
- [ ] Analyze initial performance data
- [ ] Refine targeting criteria
- [ ] Optimize messaging based on response rates
- [ ] Scale successful processes
- [ ] Document best practices

---

*These operational scripts provide the technical foundation for the SAI BD-PIP Agent to systematically identify, engage, and convert emergency medicine and orthopedic practices in the NJ/NY market, driving the growth from 300 to 500 files per month.*