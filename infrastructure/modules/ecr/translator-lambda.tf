data "aws_ecr_repository" "lambda_image_transcoder_ecr" {
  name = "kosa-translator-lambda-ecr"

  depends_on = [
    aws_ecr_repository.__lambda_image_transcoder_ecr
  ]
}

resource "aws_ecr_repository" "__lambda_image_transcoder_ecr" {
  name = "kosa-translator-lambda-ecr"

  tags = merge(local.common_tags, {})
}
