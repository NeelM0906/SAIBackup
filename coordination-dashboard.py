#!/usr/bin/env python3
"""
MAC MINI COORDINATION SYSTEM - Real-time Dashboard
Monitors operator assignments, domain coverage, and system health
"""

import json
import time
import subprocess
import sys
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional
import threading
import signal

@dataclass
class OperatorStatus:
    name: str
    machine: str
    primary_domains: List[str]
    secondary_domains: List[str]
    health: str  # "online", "degraded", "offline"
    load: float
    last_activity: str
    active_processes: int

@dataclass
class DomainCoverage:
    domain: str
    primary_operator: str
    secondary_operator: str
    machine: str
    status: str  # "active", "maintenance", "failed"
    current_load: float
    tasks_running: int

class CoordinationDashboard:
    def __init__(self):
        self.operators = {}
        self.domains = {}
        self.running = True
        self.last_update = None
        
        # Define the assignment matrix
        self.assignment_matrix = {
            "MM01": {
                "operator": "Nadav",
                "primary_domains": ["ai-ml", "backend", "performance"],
                "backup_operator": "Keerthi"
            },
            "MM02": {
                "operator": "Nick Roy", 
                "primary_domains": ["devops", "security", "data-eng"],
                "backup_operator": "Sabeen"
            },
            "MM03": {
                "operator": "Adam Gugino",
                "primary_domains": ["frontend", "mobile", "testing"],
                "backup_operator": "Aiko"
            },
            "MM04": {
                "operator": "Keerthi",
                "primary_domains": ["data-eng", "ai-ml", "backend"],
                "backup_operator": "Nadav"
            },
            "MM05": {
                "operator": "Sabeen",
                "primary_domains": ["security", "blockchain", "backend"],
                "backup_operator": "Nick Roy"
            }
        }
        
        # Floating specialist
        self.floating_specialist = {
            "operator": "Aiko",
            "role": "Research & Innovation",
            "machines": ["MM01", "MM02", "MM03", "MM04", "MM05"],
            "focus_domains": ["research", "mobile", "emerging-tech"]
        }

    def get_machine_status(self, machine: str, operator: str) -> Dict:
        """Get real-time status from a specific machine"""
        try:
            # SSH command to get machine metrics
            cmd = f"ssh {operator.lower().replace(' ', '')}@{machine.lower()}.forge.local"
            health_cmd = f"{cmd} './colosseum-health.sh --json' 2>/dev/null"
            
            result = subprocess.run(health_cmd, shell=True, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                try:
                    return json.loads(result.stdout)
                except json.JSONDecodeError:
                    pass
            
            # Fallback to basic ping test
            ping_cmd = f"ping -c 1 {machine.lower()}.forge.local"
            ping_result = subprocess.run(ping_cmd, shell=True, capture_output=True, timeout=5)
            
            return {
                "health": "online" if ping_result.returncode == 0 else "offline",
                "load": 0.0,
                "processes": 0,
                "last_activity": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "health": "offline",
                "load": 0.0,
                "processes": 0,
                "last_activity": "unknown",
                "error": str(e)
            }

    def update_operator_status(self):
        """Update status for all operators"""
        for machine, config in self.assignment_matrix.items():
            operator = config["operator"]
            status_data = self.get_machine_status(machine, operator)
            
            self.operators[operator] = OperatorStatus(
                name=operator,
                machine=machine,
                primary_domains=config["primary_domains"],
                secondary_domains=[],  # Would be filled from actual monitoring
                health=status_data.get("health", "unknown"),
                load=status_data.get("load", 0.0),
                last_activity=status_data.get("last_activity", "unknown"),
                active_processes=status_data.get("processes", 0)
            )
        
        # Update floating specialist
        aiko_health = "online"  # Would check across machines
        self.operators["Aiko"] = OperatorStatus(
            name="Aiko",
            machine="Floating",
            primary_domains=self.floating_specialist["focus_domains"],
            secondary_domains=["support-all"],
            health=aiko_health,
            load=0.0,  # Would aggregate across machines
            last_activity=datetime.now().isoformat(),
            active_processes=0
        )

    def update_domain_coverage(self):
        """Update domain coverage status"""
        all_domains = [
            "ai-ml", "backend", "frontend", "devops", "data-eng",
            "security", "mobile", "blockchain", "research", "performance"
        ]
        
        for domain in all_domains:
            # Find primary operator for this domain
            primary_op = None
            primary_machine = None
            
            for machine, config in self.assignment_matrix.items():
                if domain in config["primary_domains"]:
                    primary_op = config["operator"]
                    primary_machine = machine
                    break
            
            # Check if this is a floating domain (research)
            if domain in self.floating_specialist["focus_domains"]:
                primary_op = "Aiko"
                primary_machine = "Floating"
            
            self.domains[domain] = DomainCoverage(
                domain=domain,
                primary_operator=primary_op or "Unassigned",
                secondary_operator="Auto-failover",
                machine=primary_machine or "N/A",
                status="active",
                current_load=0.0,
                tasks_running=0
            )

    def print_dashboard(self):
        """Print the coordination dashboard"""
        print("\033[2J\033[H")  # Clear screen and move to top
        print("=" * 80)
        print("🚀 MAC MINI COORDINATION SYSTEM - LIVE DASHBOARD")
        print("=" * 80)
        print(f"Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S EST')}")
        print()
        
        # Operator Status Section
        print("👥 OPERATOR STATUS")
        print("-" * 80)
        print(f"{'Operator':<15} {'Machine':<10} {'Health':<10} {'Load':<8} {'Domains':<25} {'Processes':<10}")
        print("-" * 80)
        
        for operator in self.operators.values():
            health_icon = "✅" if operator.health == "online" else "❌" if operator.health == "offline" else "⚠️"
            domains_str = ", ".join(operator.primary_domains[:3])  # Show first 3
            if len(operator.primary_domains) > 3:
                domains_str += "..."
            
            print(f"{operator.name:<15} {operator.machine:<10} {health_icon} {operator.health:<7} {operator.load:<8.1f} {domains_str:<25} {operator.active_processes:<10}")
        
        print()
        
        # Domain Coverage Section
        print("🎯 DOMAIN COVERAGE MATRIX")
        print("-" * 80)
        print(f"{'Domain':<18} {'Primary Operator':<15} {'Machine':<10} {'Status':<10} {'Load':<8} {'Tasks':<8}")
        print("-" * 80)
        
        for domain in self.domains.values():
            status_icon = "🟢" if domain.status == "active" else "🔴" if domain.status == "failed" else "🟡"
            
            print(f"{domain.domain:<18} {domain.primary_operator:<15} {domain.machine:<10} {status_icon} {domain.status:<7} {domain.current_load:<8.1f} {domain.tasks_running:<8}")
        
        print()
        
        # Summary Section
        print("📊 SYSTEM SUMMARY")
        print("-" * 80)
        
        online_ops = sum(1 for op in self.operators.values() if op.health == "online")
        total_ops = len(self.operators)
        active_domains = sum(1 for d in self.domains.values() if d.status == "active")
        total_domains = len(self.domains)
        
        print(f"Operators Online: {online_ops}/{total_ops}")
        print(f"Active Domains: {active_domains}/{total_domains}")
        print(f"Coverage: {(active_domains/total_domains)*100:.1f}%")
        
        # Quick Commands
        print()
        print("🔧 QUICK COMMANDS")
        print("-" * 80)
        print("./deployment-automation.sh health          - Run health check")
        print("./deployment-automation.sh all             - Redeploy all operators")
        print("./deployment-automation.sh nadav           - Redeploy specific operator")
        print("openclaw message send --target=war-room --message='Status check'")
        print()
        print("Press Ctrl+C to exit dashboard")

    def export_status(self, format="json"):
        """Export current status to file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        status_data = {
            "timestamp": timestamp,
            "operators": {name: asdict(op) for name, op in self.operators.items()},
            "domains": {name: asdict(domain) for name, domain in self.domains.items()},
            "summary": {
                "total_operators": len(self.operators),
                "online_operators": sum(1 for op in self.operators.values() if op.health == "online"),
                "total_domains": len(self.domains),
                "active_domains": sum(1 for d in self.domains.values() if d.status == "active")
            }
        }
        
        filename = f"coordination_status_{timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(status_data, f, indent=2)
        
        print(f"Status exported to {filename}")
        return filename

    def run_dashboard(self, refresh_interval=30):
        """Run the live dashboard with auto-refresh"""
        def signal_handler(signum, frame):
            self.running = False
            print("\nShutting down dashboard...")
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        
        while self.running:
            try:
                self.update_operator_status()
                self.update_domain_coverage()
                self.print_dashboard()
                self.last_update = datetime.now()
                
                # Wait for next update
                time.sleep(refresh_interval)
                
            except KeyboardInterrupt:
                self.running = False
                break
            except Exception as e:
                print(f"Error updating dashboard: {e}")
                time.sleep(5)

def main():
    dashboard = CoordinationDashboard()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "export":
            dashboard.update_operator_status()
            dashboard.update_domain_coverage()
            filename = dashboard.export_status()
            print(f"Status exported to {filename}")
            
        elif command == "once":
            dashboard.update_operator_status()
            dashboard.update_domain_coverage()
            dashboard.print_dashboard()
            
        elif command == "help":
            print("MAC MINI COORDINATION SYSTEM Dashboard")
            print("Usage:")
            print("  python3 coordination-dashboard.py         - Run live dashboard")
            print("  python3 coordination-dashboard.py once    - Show status once")
            print("  python3 coordination-dashboard.py export  - Export status to JSON")
            print("  python3 coordination-dashboard.py help    - Show this help")
            
        else:
            print(f"Unknown command: {command}")
            print("Run 'python3 coordination-dashboard.py help' for usage")
    else:
        # Run live dashboard
        print("Starting MAC MINI COORDINATION SYSTEM Dashboard...")
        dashboard.run_dashboard()

if __name__ == "__main__":
    main()