resource "aws_elasticache_cluster" "dataflow_redis" {
  cluster_id           = "dataflow-redis-${var.environment}"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t3.medium"
  num_cache_nodes      = 1
  port                 = 6379
  parameter_group_name = "default.redis7"

  tags = {
    Name        = "DataFlow AI Redis Cache"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_elasticache_subnet_group" "dataflow_redis_subnet" {
  name       = "dataflow-redis-subnet-${var.environment}"
  subnet_ids = [] # Populated from VPC module outputs

  tags = {
    Name = "DataFlow Redis Subnet Group"
  }
}
