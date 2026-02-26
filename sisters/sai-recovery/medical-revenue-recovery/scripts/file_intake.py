#!/usr/bin/env python3
"""
Medical Revenue Recovery - Automated File Intake System
Extracts key data from medical billing files and routes for processing.
"""

import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd

class MedicalFileProcessor:
    def __init__(self):
        self.payer_patterns = {
            'medicare': r'medicare|cms|centers for medicare',
            'medicaid': r'medicaid|state health|welfare',
            'commercial': r'aetna|anthem|cigna|humana|united|bcbs|blue cross',
            'workers_comp': r'workers comp|work comp|wc\b',
            'pip': r'personal injury|no fault|pip\b|auto insurance'
        }
        
    def extract_patient_data(self, file_content: str) -> Dict:
        """Extract key patient information from file content."""
        patient_data = {}
        
        # Patient name extraction (various formats)
        name_patterns = [
            r'patient[:\s]+([A-Za-z\s,]+)',
            r'name[:\s]+([A-Za-z\s,]+)',
            r'last[,\s]*first[:\s]+([A-Za-z\s,]+)'
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, file_content, re.IGNORECASE)
            if match:
                patient_data['name'] = match.group(1).strip()
                break
        
        # Date of birth
        dob_patterns = [
            r'dob[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',
            r'date of birth[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',
            r'born[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})'
        ]
        
        for pattern in dob_patterns:
            match = re.search(pattern, file_content, re.IGNORECASE)
            if match:
                patient_data['dob'] = match.group(1)
                break
                
        # Member/Policy ID
        id_patterns = [
            r'member id[:\s]+([A-Za-z0-9\-]+)',
            r'policy[:\s]+([A-Za-z0-9\-]+)',
            r'subscriber id[:\s]+([A-Za-z0-9\-]+)'
        ]
        
        for pattern in id_patterns:
            match = re.search(pattern, file_content, re.IGNORECASE)
            if match:
                patient_data['member_id'] = match.group(1).strip()
                break
                
        return patient_data
    
    def identify_payer_type(self, file_content: str) -> str:
        """Identify the primary payer type from file content."""
        content_lower = file_content.lower()
        
        for payer_type, pattern in self.payer_patterns.items():
            if re.search(pattern, content_lower):
                return payer_type
                
        return 'unknown'
    
    def extract_claim_amounts(self, file_content: str) -> Dict:
        """Extract financial information from the file."""
        amounts = {}
        
        # Billed amount patterns
        billed_patterns = [
            r'billed[:\s]+\$?([\d,]+\.?\d*)',
            r'charges[:\s]+\$?([\d,]+\.?\d*)',
            r'amount billed[:\s]+\$?([\d,]+\.?\d*)'
        ]
        
        for pattern in billed_patterns:
            match = re.search(pattern, file_content, re.IGNORECASE)
            if match:
                amounts['billed'] = float(match.group(1).replace(',', ''))
                break
        
        # Paid amount patterns
        paid_patterns = [
            r'paid[:\s]+\$?([\d,]+\.?\d*)',
            r'payment[:\s]+\$?([\d,]+\.?\d*)',
            r'reimbursed[:\s]+\$?([\d,]+\.?\d*)'
        ]
        
        for pattern in paid_patterns:
            match = re.search(pattern, file_content, re.IGNORECASE)
            if match:
                amounts['paid'] = float(match.group(1).replace(',', ''))
                break
        
        # Calculate outstanding amount
        if 'billed' in amounts and 'paid' in amounts:
            amounts['outstanding'] = amounts['billed'] - amounts['paid']
            
        return amounts
    
    def calculate_file_age(self, file_content: str) -> Optional[int]:
        """Calculate days since service date."""
        service_patterns = [
            r'service date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',
            r'dos[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})',
            r'date of service[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})'
        ]
        
        for pattern in service_patterns:
            match = re.search(pattern, file_content, re.IGNORECASE)
            if match:
                try:
                    # Parse date and calculate age
                    date_str = match.group(1)
                    # Handle different date formats
                    for date_format in ['%m/%d/%Y', '%m-%d-%Y', '%m/%d/%y', '%m-%d-%y']:
                        try:
                            service_date = datetime.strptime(date_str, date_format)
                            if service_date.year < 2000:
                                service_date = service_date.replace(year=service_date.year + 2000)
                            age_days = (datetime.now() - service_date).days
                            return age_days
                        except ValueError:
                            continue
                except:
                    pass
        return None
    
    def determine_priority_score(self, file_data: Dict) -> int:
        """Calculate priority score for file routing (1-10, 10 = highest)."""
        score = 5  # Base score
        
        # Amount-based scoring
        if 'amounts' in file_data and 'outstanding' in file_data['amounts']:
            outstanding = file_data['amounts']['outstanding']
            if outstanding > 50000:
                score += 3
            elif outstanding > 20000:
                score += 2
            elif outstanding > 5000:
                score += 1
            elif outstanding < 1000:
                score -= 1
        
        # Age-based scoring (older = higher priority within reason)
        if 'age_days' in file_data:
            age = file_data['age_days']
            if 30 <= age <= 180:  # Sweet spot for recovery
                score += 2
            elif 180 < age <= 365:
                score += 1
            elif age > 365:
                score -= 1  # Very old files are harder
            elif age < 30:
                score -= 1  # Too fresh
        
        # Payer-based scoring
        payer_priority = {
            'commercial': 2,
            'workers_comp': 1,
            'medicare': 0,
            'medicaid': -1,
            'pip': 1
        }
        
        if 'payer_type' in file_data:
            score += payer_priority.get(file_data['payer_type'], 0)
        
        return max(1, min(10, score))  # Clamp between 1-10
    
    def process_file(self, file_content: str, filename: str = None) -> Dict:
        """Main processing function for a single file."""
        result = {
            'filename': filename,
            'processed_at': datetime.now().isoformat(),
            'patient_data': self.extract_patient_data(file_content),
            'payer_type': self.identify_payer_type(file_content),
            'amounts': self.extract_claim_amounts(file_content),
            'age_days': self.calculate_file_age(file_content),
            'status': 'processed'
        }
        
        result['priority_score'] = self.determine_priority_score(result)
        
        # Determine routing
        result['routing'] = self.determine_routing(result)
        
        return result
    
    def determine_routing(self, file_data: Dict) -> str:
        """Determine which processing track the file should follow."""
        priority = file_data['priority_score']
        payer_type = file_data['payer_type']
        
        if priority >= 8:
            return 'expedited'
        elif payer_type == 'workers_comp':
            return 'workers_comp_specialist'
        elif payer_type == 'pip':
            return 'pip_specialist'
        elif priority <= 3:
            return 'low_priority_batch'
        else:
            return 'standard_processing'

# Example usage
if __name__ == "__main__":
    processor = MedicalFileProcessor()
    
    # Sample file content for testing
    sample_content = """
    Patient: Smith, John
    DOB: 03/15/1975
    Member ID: ABC123456
    
    Service Date: 01/15/2024
    Provider: Emergency Associates
    
    Charges: $15,500.00
    Insurance: Aetna PPO
    Paid: $8,200.00
    
    Claim denied for: Missing prior authorization
    """
    
    result = processor.process_file(sample_content, "sample_claim.txt")
    print(json.dumps(result, indent=2))