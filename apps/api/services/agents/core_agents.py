import os
import re
from config import get_settings

def get_llm():
    settings = get_settings()
    
    # Try OpenAI First
    if settings.openai_api_key and settings.openai_api_key != "sk-your-key-here" and settings.openai_api_key != "":
        try:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(model="gpt-4o", temperature=0.1, api_key=settings.openai_api_key)
        except ImportError:
            pass
            
    # Fallback to Google Gemini
    if settings.google_api_key and settings.google_api_key != "":
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1, api_key=settings.google_api_key)
        except ImportError:
            pass
            
    raise ValueError("No valid OPENAI_API_KEY or GOOGLE_API_KEY configured for Data Engine Agents.")

def extract_python_code(text: str) -> str:
    """Extracts python code from a markdown block."""
    match = re.search(r"```python\n(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()

class PySparkGeneratorAgent:
    """Generates data extraction scripts from schema and requirements."""
    
    @classmethod
    async def generate_script(
        cls,
        connection_type: str,
        source_schema: str,
        target_path: str,
        requirements: str = "Clean the data, handle nulls, and format dates.",
        connection_config: dict = None,
    ) -> str:
        # If we have real connection config, always use the deterministic real extractor
        if connection_config and connection_type == "postgresql":
            return cls._build_real_extraction_script(connection_config, source_schema, target_path)
        
        try:
            llm = get_llm()
            from langchain_core.prompts import PromptTemplate
            
            prompt = PromptTemplate.from_template("""
    You are an expert Data Engineer specializing in PySpark.
    Write a robust, executable PySpark Python script that extracts data from the described source, cleans it according to the requirements, and writes the output as a PARQUET file to `{target_path}`.

    Connection Type: {connection_type}
    Source Schema / Details: {source_schema}
    Requirements: {requirements}

    The code must:
    1. Initialize a SparkSession with app_name="DataFlow_AI_Ingestion".
    2. Read from the source (mock the reading step if it's too complex or requires external DB connection, by creating a dummy DataFrame that matches the schema just for demonstration).
    3. Perform the requested data cleaning.
    4. Write the results to `{target_path}` using `df.write.mode("overwrite").parquet(target_path)`.
    5. DO NOT include any explanations, ONLY output the ```python code block.
    """)
            
            chain = prompt | llm
            response = await chain.ainvoke({
                "connection_type": connection_type,
                "source_schema": source_schema,
                "target_path": target_path,
                "requirements": requirements
            })
            
            return extract_python_code(response.content)
        except ValueError:
            # Fallback mock for testing without API keys AND without real connection config
            return f'''
import duckdb
import os

os.makedirs("{target_path}", exist_ok=True)
duckdb.sql("""
    SELECT 
        1 as id, 'Alice' as name, current_timestamp as created_at, 'active' as status, 100.5::FLOAT as amount
    UNION ALL SELECT 2, 'Bob', current_timestamp, 'inactive', 200.75::FLOAT
    UNION ALL SELECT 3, 'Charlie', current_timestamp, 'active', 300.00::FLOAT
""").write_parquet("{target_path}/part-00000.parquet")
print("Mock Data Written to Parquet!")
'''

    @classmethod
    def _build_real_extraction_script(cls, connection_config: dict, source_schema: str, target_path: str) -> str:
        """Build a deterministic DuckDB extraction script that uses postgres_scanner
        to pull real data from the source PostgreSQL database."""
        host = connection_config.get("host", "localhost")
        port = int(connection_config.get("port", 5432))
        database = connection_config.get("database", "postgres")
        username = connection_config.get("username", "postgres")
        password = connection_config.get("password", "")
        schema = connection_config.get("schema", "public")
        
        # Parse table names from source_schema string or use defaults
        tables = []
        if "Tables to extract:" in source_schema:
            tables_str = source_schema.split("Tables to extract:")[1].split(".")[0] if "." not in source_schema else source_schema
            # Parse "public.users, public.orders" style
            import re
            tables = re.findall(r'(?:[\w]+\.)([\w]+)', source_schema)
            if not tables:
                tables = [t.strip() for t in source_schema.split("Tables to extract:")[1].split(",")]
        if not tables:
            tables = ["users"]
        
        # Build the extraction script
        table_extraction_blocks = []
        for table in tables:
            table = table.strip().split(".")[-1]  # Remove schema prefix if present
            table_extraction_blocks.append(f'''
# --- Extract table: {table} ---
print(f"Extracting table '{table}'...")
try:
    row_count = conn.execute(f"SELECT COUNT(*) FROM postgres_scan('{{dsn}}', '{schema}', '{table}')").fetchone()[0]
    print(f"  Found {{row_count}} rows in '{table}'")
    table_dir = os.path.join(target_dir, "{table}")
    os.makedirs(table_dir, exist_ok=True)
    conn.execute(f"""
        COPY (SELECT * FROM postgres_scan('{{dsn}}', '{schema}', '{table}'))
        TO '{{table_dir}}/part-00000.parquet' (FORMAT PARQUET)
    """)
    print(f"  ✅ '{table}' extracted successfully ({{row_count}} rows)")
    total_rows += row_count
    tables_extracted += 1
except Exception as e:
    print(f"  ❌ Failed to extract '{table}': {{e}}")
    failed_tables.append("{table}")
''')
        
        extraction_code = "\n".join(table_extraction_blocks)
        
        return f'''import duckdb
import os
import json
import time

start_time = time.time()

# Connection parameters
dsn = "host={host} port={port} dbname={database} user={username} password={password}"
target_dir = "{target_path}"
os.makedirs(target_dir, exist_ok=True)

print("🔌 Connecting to source PostgreSQL database...")
conn = duckdb.connect()

# Install and load the postgres scanner extension
conn.execute("INSTALL postgres_scanner;")
conn.execute("LOAD postgres_scanner;")

total_rows = 0
tables_extracted = 0
failed_tables = []

{extraction_code}

# Write a metadata summary
duration = round(time.time() - start_time, 2)
summary = {{
    "tables_extracted": tables_extracted,
    "total_rows": total_rows,
    "failed_tables": failed_tables,
    "duration_seconds": duration,
}}
with open(os.path.join(target_dir, "_metadata.json"), "w") as f:
    json.dump(summary, f)

print(f"\\n🏁 Extraction complete! {{tables_extracted}} tables, {{total_rows}} rows in {{duration}}s")
if failed_tables:
    print(f"⚠️  Failed tables: {{', '.join(failed_tables)}}")
'''

class HealingAgent:
    """Heals broken PySpark code using the traceback."""
    
    @classmethod
    async def fix_code(cls, broken_code: str, error_traceback: str) -> str:
        llm = get_llm()
        from langchain_core.prompts import PromptTemplate
        
        prompt = PromptTemplate.from_template("""
You are an expert Data Engineer. 
A PySpark script failed to execute. Here is the code and the traceback.
Fix the code so it executes successfully.

BROKEN SCRIPT:
```python
{broken_code}
```

TRACEBACK:
{error_traceback}

Provide ONLY the fully corrected Python code in a ```python block. 
""")
        
        chain = prompt | llm
        response = await chain.ainvoke({
            "broken_code": broken_code,
            "error_traceback": error_traceback
        })
        
        return extract_python_code(response.content)
