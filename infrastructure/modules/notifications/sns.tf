resource "aws_sns_topic" "chatbot_sns_topic" {
  name = "${local.chat_name}-sns-topic"
  #  kms_master_key_id = "alias/aws/sns"

  tags = merge({}, local.common_tags)
}

data "aws_iam_policy_document" "sns-topic-policy" {
  policy_id = "__default_policy_ID"

  statement {
    sid    = "__default_sns_statement-${aws_sns_topic.chatbot_sns_topic.name}-${var.env}"
    effect = "Allow"

    actions = [
      "sns:Subscribe",
      "sns:SetTopicAttributes",
      "sns:RemovePermission",
      "sns:Receive",
      "sns:Publish",
      "sns:ListSubscriptionsByTopic",
      "sns:GetTopicAttributes",
      "sns:DeleteTopic",
      "sns:AddPermission",
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceOwner"
      values   = [local.accountId]
    }

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    resources = [aws_sns_topic.chatbot_sns_topic.arn]
  }

  statement {
    sid     = "PublishSNSMessages-${aws_sns_topic.chatbot_sns_topic.name}-${var.env}"
    effect  = "Allow"
    actions = ["sns:Publish"]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    resources = [aws_sns_topic.chatbot_sns_topic.arn]
  }
}

resource "aws_sns_topic_policy" "cw_event_permissions" {
  arn    = aws_sns_topic.chatbot_sns_topic.arn
  policy = data.aws_iam_policy_document.sns-topic-policy.json
}