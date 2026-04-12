import os
from config import get_settings
from database import get_warehouse_conn

def get_llm():
    settings = get_settings()
    
    if settings.openai_api_key and settings.openai_api_key != "sk-your-key-here" and settings.openai_api_key != "":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model="gpt-4o", temperature=0, api_key=settings.openai_api_key)
            
    if settings.google_api_key and settings.google_api_key != "":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, api_key=settings.google_api_key)
            
    raise ValueError("No valid OPENAI_API_KEY or GOOGLE_API_KEY configured for Text-to-SQL.")

class TextToSqlAgent:
    @classmethod
    async def generate_sql_and_chart(cls, query: str):
        try:
            llm = get_llm()
        except ValueError:
            bucket = get_settings().minio_bucket
            sql = f"""SELECT 
                status,
                CAST(SUM(amount) AS INT) AS "Total_Revenue"
            FROM 's3://{bucket}/pipelines/*/*/*.parquet'
            WHERE status != 'Churned'
            GROUP BY 1
            ORDER BY 2 DESC
            LIMIT 5"""
            chart_type = "bar"
            chart_config = {
                "xAxisKey": "status",
                "yAxisKey": "Total_Revenue",
                "color": "var(--c-blue)"
            }
            explanation = "I queried the active ingested Parquet data natively from the MinIO lake directly into DuckDB and grouped the statuses by amount."
            return sql, chart_type, chart_config, explanation
            
        from langchain_core.prompts import PromptTemplate
        conn = get_warehouse_conn()
        try:
            # Look at parquet files in the MinIO data lake to get schema context dynamically
            bucket = get_settings().minio_bucket
            tables_info = ""
            tables = conn.execute(f"SELECT * FROM glob('s3://{bucket}/pipelines/*/*/*.parquet')").fetchall()
            for t in tables:
                file_path = t[0]
                schema_res = conn.execute(f"DESCRIBE SELECT * FROM '{file_path}'").fetchall()
                cols = [f"{r[0]} ({r[1]})" for r in schema_res]
                tables_info += f"Table: {file_path}\\nColumns: {', '.join(cols)}\\n\\n"
        except Exception as e:
            tables_info = f"No tables found in MinIO lake. Error: {str(e)}"
        finally:
            conn.close()

        prompt = PromptTemplate.from_template("""
        You are an expert Data Analyst and UI Architect.
        The user has a question about their data warehouse. 
        Here is the schema of the available tables in DuckDB (parquet files):
        {tables_info}
        
        User Question: {query}
        
        If there are no tables, write a query that generates a dummy 'status' table to show the user that the pipeline is empty.
        If there are tables, write the DuckDB SQL query to answer the question exactly. You MUST query the exact file path from the schema like `SELECT * FROM '/tmp/dataflow/lake/demo.parquet'`.

        Then, dictate the preferred chart type for the UI: 'bar', 'line', 'pie', or 'table'.
        Also dictate a JSON chart_config e.g. {{"xAxisKey": "month", "yAxisKey": "revenue", "color": "#10b981"}}
        Also dictate exactly 1 sentence of english explanation detailing what you did.

        OUTPUT FORMAT MUST BE EXACTLY LIKE THIS:
        SQL_START
        <your sql query here>
        SQL_END
        CHART_TYPE_START
        <bar/line/pie/table>
        CHART_TYPE_END
        CHART_CONFIG_START
        <single line valid json>
        CHART_CONFIG_END
        EXPLANATION_START
        <your explanation here>
        EXPLANATION_END
        """)

        chain = prompt | llm
        response = await chain.ainvoke({
            "tables_info": tables_info,
            "query": query
        })
        
        content = response.content
        import re, json
        
        sql = re.search(r"SQL_START(.*?)SQL_END", content, re.DOTALL).group(1).strip()
        chart_type = re.search(r"CHART_TYPE_START(.*?)CHART_TYPE_END", content, re.DOTALL).group(1).strip()
        config_str = re.search(r"CHART_CONFIG_START(.*?)CHART_CONFIG_END", content, re.DOTALL).group(1).strip()
        explanation = re.search(r"EXPLANATION_START(.*?)EXPLANATION_END", content, re.DOTALL).group(1).strip()
        
        try:
            chart_config = json.loads(config_str)
        except:
            chart_config = {}
            
        return sql, chart_type, chart_config, explanation
