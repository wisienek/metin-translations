resource "aws_lambda_function" "translator" {
  function_name = "kosa-translator-${var.env}"
  architectures = ["x86_64"]
  package_type  = "Image"
  image_uri     = local.lambda_image
  role          = aws_iam_role.translator-lambda-role.arn
  timeout       = 10

  environment {
    variables = {
      "REGION"                    = local.region
      "SQS_DEAD_LETTER_QUEUE_URL" = aws_sqs_queue.dead_letter_queue.url
    }
  }

  tags = merge({}, local.common_tags)
}

resource "aws_lambda_event_source_mapping" "mime-checker-sqs-trigger" {
  event_source_arn = aws_sqs_queue.translator_queue.arn
  enabled          = true
  function_name    = aws_lambda_function.translator.function_name
  batch_size       = 1
}
