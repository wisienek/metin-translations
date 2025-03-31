locals {
  slack_workspace_id_uig  = "T1XB842AJ"
  slack_workspace_id_test = "T05FQ0SBSPR"

  slack_channel_id_uig  = "C043UFLKDEC"
  slack_channel_id_test = "C05GU88Q4LQ"
}

module "notifications-base" {
  source = "../../modules/notifications"
  env    = local.env

  configuration_name = "test-notifications"

  slack_channel_id   = local.slack_channel_id_test
  slack_workspace_id = local.slack_workspace_id_test
}

module "test-lambda" {
  source = "../../modules/test-lambda"
  env    = local.env

  sns_topic_arn = module.notifications-base.sns_topic_arn
}