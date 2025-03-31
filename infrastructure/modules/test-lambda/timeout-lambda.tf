#### TIMEOUT LAMBDA
resource "aws_lambda_function" "timeout_lambda" {
  function_name = "timeout_lambda"
  role          = aws_iam_role.timeout_lambda_role.arn
  handler       = "lambda_handler.lambda_handler"
  runtime       = "python3.8"
  timeout       = 5
  memory_size   = 128

  filename         = "lambda_function_2.zip"
  source_code_hash = data.archive_file.timeout_python_lambda_package.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  dead_letter_config {
    target_arn = aws_sqs_queue.error_queue.arn
  }

  tags = merge({}, local.common_tags)
}

data "archive_file" "timeout_python_lambda_package" {
  type        = "zip"
  source_file = "${path.module}/lambda_function_2/lambda_handler.py"
  output_path = "lambda_function_2.zip"
}


resource "aws_cloudwatch_log_group" "timeout_lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.timeout_lambda.function_name}"
  retention_in_days = 1
}

resource "aws_iam_role" "timeout_lambda_role" {
  name               = "timeout_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.timeout_lambda_assume_role_policy.json
}

data "aws_iam_policy_document" "timeout_lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com", "logs.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "timeout_lambda_policy" {
  name   = "timeout_lambda_policy"
  policy = data.aws_iam_policy_document.timeout_lambda_policy.json
}

resource "aws_iam_role_policy_attachment" "timeout_lambda_policy_attachment" {
  role       = aws_iam_role.timeout_lambda_role.name
  policy_arn = aws_iam_policy.timeout_lambda_policy.arn
}

data "aws_iam_policy_document" "timeout_lambda_policy" {
  statement {
    effect    = "Allow"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "timeout_lambda_sqs_policy" {
  name        = "timeout_lambda_sqs_policy"
  description = "IAM policy for timeout_lambda to send messages to SQS queue"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:*"
        ]
        Resource = aws_sqs_queue.error_queue.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "timeout_lambda_sqs_attachment" {
  role       = aws_iam_role.timeout_lambda_role.name
  policy_arn = aws_iam_policy.timeout_lambda_sqs_policy.arn
}
