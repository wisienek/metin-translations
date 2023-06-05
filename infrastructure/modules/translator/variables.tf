variable "env" {
  type        = string
  description = "Environment name"

  validation {
    condition     = contains(["stage", "prod", "dev"], var.env)
    error_message = "Invalid environment name!"
  }
}

variable "lambda_image" {
  type        = string
  description = "Translator lambda ecr image name"

  validation {
    condition     = length(var.lambda_image) > 0
    error_message = "Invalid ecr image name!"
  }
}