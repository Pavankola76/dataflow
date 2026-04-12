"""
DataFlow AI - Synthetically seeds the local Parquet data lake
for Phase 3 NL Analytics testing. No Pandas required.
"""
import duckdb
import os

def seed_lake():
    lake_dir = '/tmp/dataflow/lake'
    os.makedirs(lake_dir, exist_ok=True)
    
    conn = duckdb.connect(':memory:')
    
    print("Generating synthetic `customers` table...")
    conn.execute("""
    CREATE TABLE customers AS
    SELECT
        range AS customer_id,
        'Enterprise_' || range AS company_name,
        'contact_' || range || '@example.com' AS email,
        CASE WHEN RANDOM() > 0.5 THEN 'USA' ELSE 'EMEA' END AS region,
        'Tier_' || ((RANDOM() * 10)::INT % 3 + 1) AS support_tier,
        CURRENT_DATE - CAST((RANDOM() * 1000) AS INT) AS signup_date
    FROM range(1, 1001)
    """)
    conn.execute(f"COPY customers TO '{lake_dir}/customers.parquet' (FORMAT 'parquet')")
    
    print("Generating synthetic `orders` table...")
    conn.execute("""
    CREATE TABLE orders AS
    SELECT
        range AS order_id,
        ((RANDOM() * 1000)::INT % 1000) + 1 AS customer_id,
        (RANDOM() * 15000)::DECIMAL(10,2) AS revenue,
        (RANDOM() * 100)::INT AS licenses,
        CASE WHEN RANDOM() > 0.1 THEN 'Active' ELSE 'Churned' END AS status,
        CURRENT_DATE - CAST((RANDOM() * 365) AS INT) AS invoice_date
    FROM range(1, 5001)
    """)
    conn.execute(f"COPY orders TO '{lake_dir}/orders.parquet' (FORMAT 'parquet')")
    
    print(f"Successfully minted Parquet lake at {lake_dir}/")
    
if __name__ == "__main__":
    seed_lake()
