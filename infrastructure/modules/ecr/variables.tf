variable "env" {
  type        = string
  description = "Environment name"

  validation {
    condition     = contains(["stage", "prod", "dev"], var.env)
    error_message = "Invalid environment name!"
  }
}