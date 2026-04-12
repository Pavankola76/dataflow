"""
Data Lineage Parser
Parses execution graphs and logical dependencies to construct a 
directed acyclic graph (DAG) representing data provenance.
"""

from typing import Dict, Any, List

def parse_lineage(table_id: str) -> Dict[str, Any]:
    """
    Given a table name, it traverses upstream and downstream to build the lineage graph.
    For the MVP, we use statically mapped derivations representing the typical e-commerce flow.
    """
    
    # Mock knowledge graph of the data warehouse
    lineage_map = {
        "ecommerce_postgres": {"downstream": ["stg_orders", "stg_customers", "stg_products"], "layer": "source"},
        "stg_orders": {"upstream": ["ecommerce_postgres"], "downstream": ["fact_orders"], "layer": "silver"},
        "stg_customers": {"upstream": ["ecommerce_postgres"], "downstream": ["dim_customers"], "layer": "silver"},
        "stg_products": {"upstream": ["ecommerce_postgres"], "downstream": ["dim_products"], "layer": "silver"},
        
        "fact_orders": {"upstream": ["stg_orders", "dim_customers", "dim_products"], "downstream": ["mrt_revenue_dashboard"], "layer": "gold"},
        "dim_customers": {"upstream": ["stg_customers"], "downstream": ["fact_orders"], "layer": "gold"},
        "dim_products": {"upstream": ["stg_products"], "downstream": ["fact_orders"], "layer": "gold"},
        
        "mrt_revenue_dashboard": {"upstream": ["fact_orders"], "downstream": [], "layer": "presentation"}
    }
    
    nodes = []
    edges = []
    visited_nodes = set()

    def traverse(current_node: str):
        if current_node in visited_nodes or current_node not in lineage_map:
            return
            
        visited_nodes.add(current_node)
        info = lineage_map[current_node]
        
        # Add Node
        nodes.append({
            "id": current_node,
            "data": {
                "label": current_node, 
                "layer": info["layer"]
            }
        })
        
        # Add Downstream Edges and recursively traverse downstream
        for child in info.get("downstream", []):
            edges.append({"id": f"e-{current_node}-{child}", "source": current_node, "target": child})
            traverse(child)
            
        # Add Upstream Edges and recursively traverse upstream
        for parent in info.get("upstream", []):
            edges.append({"id": f"e-{parent}-{current_node}", "source": parent, "target": current_node})
            traverse(parent)

    traverse(table_id)
    
    # Deduplicate edges just in case (e.g if undirected traversal caused loops)
    unique_edges = {}
    for edge in edges:
        unique_edges[edge["id"]] = edge

    return {
        "nodes": nodes,
        "edges": list(unique_edges.values())
    }
