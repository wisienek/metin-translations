terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.4.0"
    }
  }
}

provider "aws" {
  region  = "eu-central-1"
  profile = "kosa-corporation"

  default_tags {
    tags = {
      terraform = "true"
    }
  }
}

#resource "aws_s3_bucket" "terraform_state" {
#  bucket = "kosa-corporation-tf-state"
#}
#
#resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
#  bucket = aws_s3_bucket.terraform_state.id
#
#  rule {
#    apply_server_side_encryption_by_default {
#      sse_algorithm = "AES256"
#    }
#  }
#}
#
#resource "aws_s3_bucket_versioning" "versioning_example" {
#  bucket = aws_s3_bucket.terraform_state.id
#  versioning_configuration {
#    status = "Enabled"
#  }
#}
#
#
#resource "aws_dynamodb_table" "terraform_locks" {
#  name         = "new-terraform-locks"
#  billing_mode = "PAY_PER_REQUEST"
#  hash_key     = "LockID"
#  attribute {
#    name = "LockID"
#    type = "S"
#  }
#}
