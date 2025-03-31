locals {
  cf_name = replace(local.chat_name, "_", "-")
}

data "local_file" "cloudformation_template" {
  filename = "${path.module}/chatbot-cf.yml"
}

resource "aws_cloudformation_stack" "chatbot_slack_configuration" {
  name = "${local.cf_name}-slack"

  template_body = data.local_file.cloudformation_template.content

  parameters = {
    ConfigurationNameParameter = local.cf_name
    IamRoleArnParameter        = aws_iam_role.chatbot_role.arn
    LoggingLevelParameter      = var.logging_level
    SlackChannelIdParameter    = var.slack_channel_id
    SlackWorkspaceIdParameter  = var.slack_workspace_id
    SnsTopicArnsParameter      = aws_sns_topic.chatbot_sns_topic.arn
  }

  tags = merge({}, local.common_tags)
}