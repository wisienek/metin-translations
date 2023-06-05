resource "aws_s3_bucket" "translations_bucket" {
  bucket = "kosa-translated-files-${var.env}"
}

resource "aws_s3_bucket_ownership_controls" "translations_bucket_ownership" {
  bucket = aws_s3_bucket.translations_bucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "translations_bucket_access_block" {
  bucket = aws_s3_bucket.translations_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "translations_bucket_acl" {
  depends_on = [
    aws_s3_bucket_ownership_controls.translations_bucket_ownership,
    aws_s3_bucket_public_access_block.translations_bucket_access_block,
  ]

  bucket = aws_s3_bucket.translations_bucket.id
  acl    = "public-read"
}