output "sns_topic_arn" {
  value       = aws_sns_topic.chatbot_sns_topic.arn
  description = "Generated topic arn"
}