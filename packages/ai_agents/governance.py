import re
from typing import Dict, Any, List

def classify_columns(schema_metadata: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Simulates a Governance AI scanning columns for sensitive information
    and deterministically flagging PII levels.
    """
    classified_schema = []
    
    # Regex heuristics for PII
    email_regex = re.compile(r'email|e-mail', re.IGNORECASE)
    phone_regex = re.compile(r'phone|mobile|cell', re.IGNORECASE)
    ssn_regex = re.compile(r'ssn|social_security|socialsecurity', re.IGNORECASE)
    financial_regex = re.compile(r'credit_card|cc_number|salary|income|revenue', re.IGNORECASE)
    name_regex = re.compile(r'first_name|last_name|full_name', re.IGNORECASE)
    
    for column in schema_metadata:
        col_name = column.get('name', '')
        
        classification = "None"
        confidence = 0.95
        masking_recommended = None
        
        if ssn_regex.search(col_name) or financial_regex.search(col_name):
            classification = "Highly Restricted (Financial/SSN)"
            confidence = 0.99
            masking_recommended = "SHA-256 Hash"
        elif email_regex.search(col_name) or phone_regex.search(col_name):
            classification = "PII (Contact Info)"
            confidence = 0.90
            masking_recommended = "Tokenization"
        elif name_regex.search(col_name):
            classification = "PII (Identifier)"
            confidence = 0.85
            masking_recommended = "Partial Masking"
            
        classified_col = {
            **column,
            "classification": classification,
            "ai_confidence": confidence,
            "masking_policy": masking_recommended
        }
        classified_schema.append(classified_col)
        
    return classified_schema
