variable "env" {
  type        = string
  description = "Environment name"

  validation {
    condition     = contains(["stage", "prod", "dev"], var.env)
    error_message = "Invalid environment name!"
  }
}

variable "sns_topic_arn" {
  type        = string
  description = "SNS topic ARN"

  validation {
    condition     = length(var.sns_topic_arn) > 0
    error_message = "Invalid sns topic arn!"
  }
}