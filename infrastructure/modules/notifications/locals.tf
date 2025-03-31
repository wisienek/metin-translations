data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

locals {
  accountId = data.aws_caller_identity.current.account_id
  region    = data.aws_region.current.name

  common_tags = {
    "Project" = "Notifications"
    "Module"  = "notifications"
  }

  chat_name = "${var.configuration_name}-${var.slack_workspace_id}-${var.slack_channel_id}"
}