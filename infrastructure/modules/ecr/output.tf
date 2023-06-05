output "lambda_translator_ecr_arn" {
  value       = data.aws_ecr_repository.lambda_image_transcoder_ecr.arn
  description = "Lambda translator ECR repository ARN"
}

output "all_ecr_repositories" {
  value = [
    data.aws_ecr_repository.lambda_image_transcoder_ecr
  ]

  description = "All ECR repositories"
}