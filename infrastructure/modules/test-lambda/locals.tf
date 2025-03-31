data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

locals {
  accountId = data.aws_caller_identity.current.account_id
  region    = data.aws_region.current.name

  common_tags = {
    "Project" = "TestLambda"
    "Module"  = "testlambda"
  }
}