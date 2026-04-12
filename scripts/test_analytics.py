import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api")))
from routers.analytics import execute_nl_query, AnalyticsQueryRequest

async def test():
    print("Submitting User NLP Query directly via API router...")
    req = AnalyticsQueryRequest(query="Show me a breakdown of order statuses")
    res = await execute_nl_query(req)
    print("====================")
    print("--- Analytics UI Widget Payload ---")
    print(f"Generated S3 SQL:\\n{res.generated_sql}")
    print(f"Chart Type: {res.chart_type}")
    print(f"Data Rows: {len(res.results)}")
    if res.results:
        print(f"Data Stream:")
        for r in res.results:
            print(r)

if __name__ == "__main__":
    asyncio.run(test())
