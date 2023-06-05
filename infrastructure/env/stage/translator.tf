module "ecr" {
  source = "../../modules/translator"
  env    = local.env

  lambda_image = "kosa-translator-lambda-ecr"
}