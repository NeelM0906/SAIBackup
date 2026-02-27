#!/usr/bin/env python3
"""
Formula Judge Performance Analysis and Optimization
Analyze current Formula Judge performance patterns and create recommendations
"""

import json
import statistics
from collections import defaultdict

def analyze_formula_judge_performance():
    """Analyze Formula Judge scoring patterns from recent tournaments"""
    
    # Load tournament data
    tournament_files = [
        '/Users/samantha/Projects/colosseum/v2/data/results/tournament_1771886909.json',
        '/Users/samantha/Projects/colosseum/v2/data/results/tournament_1771884716.json',
        '/Users/samantha/Projects/colosseum/v2/data/results/tournament_1771850887.json'
    ]
    
    all_scores = defaultdict(list)
    feedback_patterns = []
    score_distribution = {
        'self_mastery': [],
        'four_steps': [],
        'twelve_elements': [],
        'four_energies': [],
        'process_mastery': [],
        'overall': []
    }
    
    for file_path in tournament_files:
        try:
            with open(file_path) as f:
                data = json.load(f)
            
            # Extract all Formula Judge scores
            if 'battles' in data:
                for battle in data['battles']:
                    if 'scores' in battle and 'formula_judge' in battle['scores']:
                        judge_score = battle['scores']['formula_judge']
                        
                        # Collect dimensional scores
                        for dimension in score_distribution:
                            if dimension in judge_score:
                                score_distribution[dimension].append(judge_score[dimension])
                        
                        # Collect feedback
                        if 'feedback' in judge_score:
                            feedback_patterns.append(judge_score['feedback'])
                            
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Error loading {file_path}: {e}")
    
    # Calculate statistics
    stats = {}
    for dimension, scores in score_distribution.items():
        if scores:
            stats[dimension] = {
                'mean': statistics.mean(scores),
                'median': statistics.median(scores),
                'stdev': statistics.stdev(scores) if len(scores) > 1 else 0,
                'min': min(scores),
                'max': max(scores),
                'count': len(scores)
            }
    
    return stats, feedback_patterns

def identify_scoring_patterns(stats, feedback_patterns):
    """Identify patterns and potential calibration issues"""
    
    findings = {
        'dimensional_analysis': {},
        'calibration_issues': [],
        'feedback_analysis': {},
        'optimization_opportunities': []
    }
    
    # Analyze dimensional performance
    if stats:
        for dimension, data in stats.items():
            findings['dimensional_analysis'][dimension] = {
                'avg_score': round(data['mean'], 2),
                'consistency': 'High' if data['stdev'] < 0.5 else 'Medium' if data['stdev'] < 1.0 else 'Low',
                'score_range': f"{data['min']:.1f} - {data['max']:.1f}",
                'sample_size': data['count']
            }
            
            # Identify potential calibration issues
            if data['mean'] > 8.5:
                findings['calibration_issues'].append(f"{dimension}: Potentially too generous (avg {data['mean']:.1f})")
            elif data['mean'] < 6.0:
                findings['calibration_issues'].append(f"{dimension}: Potentially too harsh (avg {data['mean']:.1f})")
                
            if data['stdev'] > 1.2:
                findings['calibration_issues'].append(f"{dimension}: High variance ({data['stdev']:.1f}) - inconsistent scoring")
    
    # Analyze feedback patterns
    common_phrases = {}
    key_terms = ['self-mastery', 'tenacity', 'rapport', 'alignment', 'energy', 'process mastery', 'zone action', 'contamination']
    
    for feedback in feedback_patterns:
        for term in key_terms:
            if term.lower() in feedback.lower():
                common_phrases[term] = common_phrases.get(term, 0) + 1
    
    findings['feedback_analysis']['common_terms'] = common_phrases
    
    return findings

def generate_optimization_recommendations():
    """Generate specific optimization recommendations for Formula Judge"""
    
    recommendations = {
        'calibration_adjustments': [
            {
                'area': 'Self Mastery Scoring',
                'issue': 'Potential over-generosity in self-mastery assessment',
                'recommendation': 'Recalibrate to more strictly assess navigation of Destroyers. Look for specific evidence of fear confrontation, not just confidence.',
                'implementation': 'Add explicit destroyer detection criteria: Did being acknowledge/navigate specific fears? Did it show actual tenacity or just confidence?'
            },
            {
                'area': 'Four Steps Precision',
                'issue': 'Generic assessment of influence mastery steps',
                'recommendation': 'Require explicit identification of each step execution, not general influence quality.',
                'implementation': 'Score each step separately: Step 1 (rapport building), Step 2 (truth to pain), Step 3 (agreement), Step 4 (causing yes). Identify specific missing steps.'
            },
            {
                'area': 'Zone Action Detection',
                'issue': 'Conflation of process mention with actual zone action',
                'recommendation': 'Distinguish between talking ABOUT process mastery vs demonstrating actual 0.8% identification.',
                'implementation': 'Score lower unless being identifies specific 0.8% move. Mentioning "time blocking" ≠ zone action mastery.'
            }
        ],
        'prompt_enhancements': [
            {
                'enhancement': 'Destroyer-Specific Assessment',
                'details': 'Add explicit checklist for 7 Destroyers detection in self-mastery scoring',
                'implementation': 'Does response show navigation of: 1) Unclear values, 2) Identity confusion, 3) Avoidance, 4) Fear of rejection, 5) Fear of failure, 6) Scarcity mindset, 7) Perfectionism?'
            },
            {
                'enhancement': 'Contamination Sensitivity',
                'details': 'Increase sensitivity to corporate-speak and generic AI patterns that contaminate formula application',
                'implementation': 'Score lower for: generic consulting language, "stakeholder alignment," "strategic planning," "let me know if," question endings, lists without opinions'
            },
            {
                'enhancement': 'Energy Calibration',
                'details': 'More precise assessment of 4 Energies appropriateness for situation',
                'implementation': 'Score context-appropriateness: Is Fun energy appropriate here? Is Zeus containment needed? Is Goddess nurturing called for? Is Aspirational vision-raising optimal?'
            }
        ],
        'knowledge_base_integration': [
            {
                'source': 'Pinecone - ublib2',
                'application': 'Query for specific destroyer patterns and zone action examples to calibrate scoring',
                'query_examples': [
                    '"fear rejection navigation tenacity curve possibility"',
                    '"zone action 0.8% vs busy work contamination"',
                    '"influence mastery four steps specific execution"'
                ]
            }
        ]
    }
    
    return recommendations

def main():
    print("🔍 FORMULA JUDGE CALIBRATION ANALYSIS")
    print("=" * 50)
    
    # Analyze current performance
    stats, feedback_patterns = analyze_formula_judge_performance()
    findings = identify_scoring_patterns(stats, feedback_patterns)
    recommendations = generate_optimization_recommendations()
    
    print("\n📊 DIMENSIONAL PERFORMANCE ANALYSIS")
    for dimension, analysis in findings['dimensional_analysis'].items():
        print(f"\n{dimension.upper()}")
        print(f"  Average Score: {analysis['avg_score']}")
        print(f"  Consistency: {analysis['consistency']}")
        print(f"  Range: {analysis['score_range']}")
        print(f"  Sample Size: {analysis['sample_size']}")
    
    print("\n⚠️  CALIBRATION ISSUES DETECTED")
    for issue in findings['calibration_issues']:
        print(f"  • {issue}")
    
    print("\n🎯 FEEDBACK PATTERN ANALYSIS")
    print("Most common terms in Formula Judge feedback:")
    for term, count in sorted(findings['feedback_analysis']['common_terms'].items(), key=lambda x: x[1], reverse=True):
        print(f"  • {term}: {count} mentions")
    
    print("\n🚀 OPTIMIZATION RECOMMENDATIONS")
    
    print("\n1. CALIBRATION ADJUSTMENTS")
    for rec in recommendations['calibration_adjustments']:
        print(f"\nArea: {rec['area']}")
        print(f"Issue: {rec['issue']}")
        print(f"Recommendation: {rec['recommendation']}")
        print(f"Implementation: {rec['implementation']}")
    
    print("\n2. PROMPT ENHANCEMENTS")
    for enh in recommendations['prompt_enhancements']:
        print(f"\nEnhancement: {enh['enhancement']}")
        print(f"Details: {enh['details']}")
        print(f"Implementation: {enh['implementation']}")
    
    print("\n3. KNOWLEDGE BASE INTEGRATION")
    for kb in recommendations['knowledge_base_integration']:
        print(f"\nSource: {kb['source']}")
        print(f"Application: {kb['application']}")
        print("Query Examples:")
        for query in kb['query_examples']:
            print(f"  • {query}")
    
    return findings, recommendations

if __name__ == "__main__":
    main()