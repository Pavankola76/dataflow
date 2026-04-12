#!/bin/bash
set -euo pipefail

echo "=========================================="
echo "  DataFlow AI — Performance Benchmarks"
echo "=========================================="

API_URL="${API_URL:-http://localhost:8000}"

# ---- Ingestion Throughput ----
echo ""
echo "--- Ingestion Throughput ---"
for rows in 10000 100000 1000000; do
  echo -n "  ${rows} rows: "
  start=$(date +%s%N)
  curl -s -X POST "${API_URL}/api/v1/pipelines/benchmark/ingest" \
    -H "Content-Type: application/json" \
    -d "{\"rows\": ${rows}}" > /dev/null
  end=$(date +%s%N)
  elapsed=$(( (end - start) / 1000000 ))
  echo "${elapsed}ms"
done

# ---- Query Latency ----
echo ""
echo "--- Query Latency (DuckDB) ---"
for i in $(seq 1 5); do
  start=$(date +%s%N)
  curl -s -X POST "${API_URL}/api/v1/analytics/query" \
    -H "Content-Type: application/json" \
    -d '{"question":"What are the top 10 products by revenue?"}' > /dev/null
  end=$(date +%s%N)
  elapsed=$(( (end - start) / 1000000 ))
  echo "  Query ${i}: ${elapsed}ms"
done

# ---- Concurrent Users ----
echo ""
echo "--- Concurrent Users ---"
for concurrency in 10 50 100; do
  echo -n "  ${concurrency} users: "
  start=$(date +%s%N)
  seq 1 "$concurrency" | xargs -P "$concurrency" -I{} \
    curl -s "${API_URL}/api/v1/monitoring/health" > /dev/null
  end=$(date +%s%N)
  elapsed=$(( (end - start) / 1000000 ))
  echo "${elapsed}ms total"
done

# ---- AI Agent Response Time ----
echo ""
echo "--- AI Agent Latency ---"
for agent in "suggest-model" "text-to-sql" "classify-columns"; do
  start=$(date +%s%N)
  curl -s -X POST "${API_URL}/api/v1/ai/${agent}" \
    -H "Content-Type: application/json" \
    -d '{"input":"benchmark test"}' > /dev/null
  end=$(date +%s%N)
  elapsed=$(( (end - start) / 1000000 ))
  echo "  ${agent}: ${elapsed}ms"
done

echo ""
echo "✅ Benchmark complete."
