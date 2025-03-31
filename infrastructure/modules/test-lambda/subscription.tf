### Timeout exception
resource "aws_cloudwatch_log_subscription_filter" "lambda_exception_filter" {
  name            = "lambda_exception_filter"
  log_group_name  = aws_cloudwatch_log_group.timeout_lambda_logs.name
  filter_pattern  = "timed out"
  destination_arn = aws_lambda_function.test_lambda.arn

  depends_on = [aws_lambda_permission.exception_subscription_permission]
}

# Inside exception
resource "aws_cloudwatch_log_subscription_filter" "lambda_error_filter" {
  name            = "lambda_error_filter"
  log_group_name  = aws_cloudwatch_log_group.timeout_lambda_logs.name
  filter_pattern  = "\"[ERROR]\""
  destination_arn = aws_lambda_function.test_lambda.arn

  depends_on = [aws_lambda_permission.exception_subscription_permission]
}

### PErmissions
resource "aws_lambda_permission" "exception_subscription_permission" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.test_lambda.function_name
  principal     = "logs.${local.region}.amazonaws.com"
  source_arn    = "${aws_cloudwatch_log_group.timeout_lambda_logs.arn}:*"
}
