resource "aws_iam_role" "translator-lambda-role" {
  name        = "TranslatorLambdaRole${title(var.env)}"
  description = "Role for lambda which is used for translating"

  assume_role_policy = data.aws_iam_policy_document.assume-translator-lambda-role.json

  inline_policy {
    name   = "TranslatorLambdaPolicy"
    policy = data.aws_iam_policy_document.lambda-policy-doc.json
  }

  depends_on = [
    data.aws_iam_policy_document.lambda-policy-doc
  ]
}

data "aws_iam_policy_document" "assume-translator-lambda-role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "lambda-policy-doc" {
  statement {
    sid = "AllowLogging"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["*"]
  }

  statement {
    sid = "AllowSQSAccess"
    actions = [
      "sqs:SendMessage",
      "sqs:ReceiveMessage",
      "sqs:GetQueueAttributes",
      "sqs:DeleteMessage"
    ]
    resources = [
      aws_sqs_queue.translator_queue.arn,
      aws_sqs_queue.dead_letter_queue.arn,
    ]
  }

  statement {
    sid = "AllowS3Access"
    actions = [
      "s3:*"
    ]

    resources = ["${aws_s3_bucket.translations_bucket.arn}/*"]
  }
}