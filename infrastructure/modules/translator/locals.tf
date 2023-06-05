data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

locals {
  accountId = data.aws_caller_identity.current.account_id
  region    = data.aws_region.current.name

  common_tags = {
    "Project" = "Lambda"
    "Module"  = "lambda"
  }

  lambda_image        = "${local.accountId}.dkr.ecr.${local.region}.amazonaws.com/${var.lambda_image}:${var.env}"
  s3_event_queue_name = "kosa-translator-${var.env}-s3-event-queue"
}
