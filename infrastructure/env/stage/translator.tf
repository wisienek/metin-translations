#module "ecr" {
#  source = "../../modules/translator"
#  env    = local.env
#
#  lambda_image = "kosa-translator-lambda-ecr"
#}

module "network" {
  source = "../../modules/network"
  env    = local.env
}

module "db" {
  source = "../../modules/db"
  env    = local.env

  network = {
    vpc_id           = module.network.vpc_id
    database_subnets = module.network.public_subnets
  }

  security = {
    ecs_sg_id = module.network.ssh_security_group
  }

  initial_setup = true
}