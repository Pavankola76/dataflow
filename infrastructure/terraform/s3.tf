resource "aws_s3_bucket" "dataflow_lake" {
  bucket = "dataflow-ai-lake-${var.environment}"

  tags = {
    Name        = "DataFlow AI Data Lake"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "lake_versioning" {
  bucket = aws_s3_bucket.dataflow_lake.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "lake_encryption" {
  bucket = aws_s3_bucket.dataflow_lake.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "lake_lifecycle" {
  bucket = aws_s3_bucket.dataflow_lake.id

  rule {
    id     = "bronze_retention"
    status = "Enabled"
    filter {
      prefix = "bronze/"
    }
    expiration {
      days = 90
    }
  }
}
