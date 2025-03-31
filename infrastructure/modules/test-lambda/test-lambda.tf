resource "aws_lambda_function" "test_lambda" {
  function_name = "test_lambda"
  role          = aws_iam_role.test_lambda_role.arn
  handler       = "lambda_handler.lambda_handler"
  runtime       = "python3.8"
  timeout       = 120
  memory_size   = 128

  filename         = "lambda_function.zip"
  source_code_hash = data.archive_file.notifications_handler_python_lambda_package.output_base64sha256

  environment {
    variables = {
      snsARN = var.sns_topic_arn
    }
  }

  tags = merge({}, local.common_tags)
}

data "archive_file" "notifications_handler_python_lambda_package" {
  type        = "zip"
  source_file = "${path.module}/lambda_function/lambda_handler.py"
  output_path = "lambda_function.zip"
}


### IAM
resource "aws_iam_role" "test_lambda_role" {
  name               = "test_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.test_lambda_assume_role_policy.json
}

data "aws_iam_policy_document" "test_lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com", "logs.amazonaws.com"]
    }
  }
}

# Logs
resource "aws_iam_role_policy_attachment" "test_lambda_logs_attachment" {
  policy_arn = aws_iam_policy.test_lambda_logs_policy.arn
  role       = aws_iam_role.test_lambda_role.name
}

resource "aws_iam_policy" "test_lambda_logs_policy" {
  name   = "AllowLogs"
  policy = data.aws_iam_policy_document.test_lambda_logs_policy_doc.json
}

data "aws_iam_policy_document" "test_lambda_logs_policy_doc" {
  statement {
    effect    = "Allow"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["*"]
  }
}
# SQS iam
resource "aws_iam_role_policy_attachment" "sqs_attachment" {
  policy_arn = aws_iam_policy.allow_all_sqs.arn
  role       = aws_iam_role.test_lambda_role.name
}

resource "aws_iam_policy" "allow_all_sqs" {
  name   = "AllowAllSqs"
  policy = data.aws_iam_policy_document.allow_all_sqs.json
}

data "aws_iam_policy_document" "allow_all_sqs" {
  statement {
    effect    = "Allow"
    actions   = ["sqs:*"]
    resources = ["*"]
  }
}
# self invoke
resource "aws_iam_role_policy_attachment" "self_invoke_attachment" {
  policy_arn = aws_iam_policy.self_invoke_policy.arn
  role       = aws_iam_role.test_lambda_role.name
}

resource "aws_iam_policy" "self_invoke_policy" {
  name   = "AllowSelfInvoke"
  policy = data.aws_iam_policy_document.self_invoke_policy_doc.json
}

data "aws_iam_policy_document" "self_invoke_policy_doc" {
  statement {
    effect    = "Allow"
    actions   = ["lambda:InvokeFunction"]
    resources = [aws_lambda_function.test_lambda.arn]
  }
}
# Send sns topics
resource "aws_iam_role_policy_attachment" "send_sns_topic_attachment" {
  policy_arn = aws_iam_policy.send_sns_policy.arn
  role       = aws_iam_role.test_lambda_role.name
}

resource "aws_iam_policy" "send_sns_policy" {
  name   = "AllowSendSNS"
  policy = data.aws_iam_policy_document.send_sns_policy_doc.json
}

data "aws_iam_policy_document" "send_sns_policy_doc" {
  statement {
    effect    = "Allow"
    actions   = ["sns:Publish"]
    resources = [var.sns_topic_arn]
  }
}
