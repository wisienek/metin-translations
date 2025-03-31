resource "aws_sqs_queue" "error_queue" {
  name                       = "error_queue"
  visibility_timeout_seconds = 300
  delay_seconds              = 0
  message_retention_seconds  = 86400
  max_message_size           = 262144
  receive_wait_time_seconds  = 0

  tags = local.common_tags
}

resource "aws_lambda_event_source_mapping" "lambda_dql_source_mapping" {
  event_source_arn = aws_sqs_queue.error_queue.arn
  enabled          = true
  function_name    = aws_lambda_function.test_lambda.arn
  batch_size       = 1
}