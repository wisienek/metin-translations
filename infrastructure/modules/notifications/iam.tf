resource "aws_iam_role" "chatbot_role" {
  name               = "${var.configuration_name}-chatbot-role-${var.env}"
  assume_role_policy = data.aws_iam_policy_document.chatbot_assume_role_policy.json

  tags = merge({}, local.common_tags)
}

data "aws_iam_policy_document" "chatbot_assume_role_policy" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role_policy_attachment" "cloudwatch_readonly_policy_attachment" {
  role       = aws_iam_role.chatbot_role.id
  policy_arn = data.aws_iam_policy.cloudwatch_read_only_policy.arn
}

data "aws_iam_policy" "cloudwatch_read_only_policy" {
  arn = "arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_role_policy_attachment" {
  role       = aws_iam_role.chatbot_role.id
  policy_arn = aws_iam_policy.chatbot_role_policy.arn
}

resource "aws_iam_policy" "chatbot_role_policy" {
  name   = "ChatbotRolePolicy${var.env}"
  policy = data.aws_iam_policy_document.chatbot_required_permissions.json
}

data "aws_iam_policy_document" "chatbot_required_permissions" {
  statement {
    effect    = "Allow"
    resources = ["*"]
    actions = [
      "cloudwatch:Describe*",
      "cloudwatch:Get*",
      "cloudwatch:List*",
      "logs:Get*",
      "logs:List*",
      "logs:Describe*",
      "logs:TestMetricFilter",
      "logs:FilterLogEvents",
      "sns:Get*",
      "sns:List*",
      "chatbot:Describe*",
      "chatbot:UpdateSlackChannelConfiguration",
      "chatbot:CreateSlackChannelConfiguration",
      "chatbot:DeleteSlackChannelConfiguration",
      "chatbot:CreateChimeWebhookConfiguration",
      "chatbot:UpdateChimeWebhookConfiguration"
    ]
  }
}