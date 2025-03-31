variable "env" {
  type        = string
  description = "Environment name"

  validation {
    condition     = contains(["stage", "prod", "dev"], var.env)
    error_message = "Invalid environment name!"
  }
}

variable "slack_channel_id" {
  type        = string
  description = "Slack channel id"

  validation {
    condition     = length(var.slack_channel_id) > 0
    error_message = "Invalid slack channel id!"
  }
}

variable "configuration_name" {
  type        = string
  description = "The name of the configuration/slack channel. Must satisfy regular expression pattern: [a-zA-Z][-a-zA-Z0-9]*"

  validation {
    condition     = length(var.configuration_name) > 0
    error_message = "Invalid configuration name!"
  }
}

variable "slack_workspace_id" {
  type        = string
  description = "The ID of the Slack workspace authorized with AWS Chatbot."

  validation {
    condition     = length(var.slack_workspace_id) > 0
    error_message = "Invalid slack workspace id!"
  }
}

variable "logging_level" {
  type        = string
  description = "Specifies the logging level for this configuration."
  default     = "INFO"

  validation {
    condition     = contains(["ERROR", "INFO", "NONE"], var.logging_level)
    error_message = "Invalid logging level!"
  }
}
