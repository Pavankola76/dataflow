resource "aws_msk_cluster" "dataflow_kafka" {
  cluster_name           = "dataflow-kafka-${var.environment}"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = [] # Populated from VPC module outputs
    security_groups = []

    storage_info {
      ebs_storage_info {
        volume_size = 100
      }
    }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  configuration_info {
    arn      = aws_msk_configuration.dataflow_kafka_config.arn
    revision = aws_msk_configuration.dataflow_kafka_config.latest_revision
  }

  tags = {
    Name        = "DataFlow AI Kafka Cluster"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_msk_configuration" "dataflow_kafka_config" {
  name              = "dataflow-kafka-config-${var.environment}"
  kafka_versions    = ["3.5.1"]

  server_properties = <<PROPERTIES
auto.create.topics.enable=true
default.replication.factor=3
min.insync.replicas=2
num.partitions=6
log.retention.hours=168
PROPERTIES
}
