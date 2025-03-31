resource "aws_cloudwatch_event_rule" "ecs_serice_actions" {
  name        = "ecs-service-action-change-rule-${var.env}"
  description = "Notifies when service errors: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_cwe_events.html#ecs_service_events"

  event_pattern = <<PATTERN
{
    "source": [
        "aws.ecs",
        "aws.batch"
    ],
    "detail-type": [
        "ECS Deployment State Change",
        "Batch Job State Change"
    ]
}
PATTERN
}

resource "aws_sqs_queue" "subscription_error_queue" {
  name                       = "subscription_error_queue"
  visibility_timeout_seconds = 300
  delay_seconds              = 0
  message_retention_seconds  = 86400
  max_message_size           = 262144
  receive_wait_time_seconds  = 0

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "ecs_service_actions_caught" {
  name              = "/aws/events/${aws_cloudwatch_event_rule.ecs_serice_actions.name}"
  retention_in_days = 3
}

resource "aws_cloudwatch_event_target" "ecs_service_action_sns" {
  rule      = aws_cloudwatch_event_rule.ecs_serice_actions.name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.chatbot_sns_topic.arn

  dead_letter_config {
    arn = aws_sqs_queue.subscription_error_queue.arn
  }
}

resource "aws_cloudwatch_event_target" "logs_target" {
  arn       = aws_cloudwatch_log_group.ecs_service_actions_caught.arn
  target_id = "SendToCloudwatch"
  rule      = aws_cloudwatch_event_rule.ecs_serice_actions.name

  dead_letter_config {
    arn = aws_sqs_queue.subscription_error_queue.arn
  }
}