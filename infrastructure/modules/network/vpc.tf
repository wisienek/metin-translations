module "uig_vpc" {
  source = "registry.terraform.io/terraform-aws-modules/vpc/aws"

  name = local.vpc_name

  cidr             = "10.0.0.0/16"
  azs              = local.azs
  public_subnets   = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets  = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]
  database_subnets = ["10.0.7.0/24", "10.0.8.0/24", "10.0.9.0/24"]
  intra_subnets    = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]

  enable_nat_gateway     = false
  single_nat_gateway     = true
  one_nat_gateway_per_az = false

  enable_vpn_gateway = false

  enable_dns_support   = true
  enable_dns_hostnames = true

  create_database_subnet_group = true
}

output "vpc_id" {
  value = module.uig_vpc.vpc_id
}

output "private_subnets" {
  value = module.uig_vpc.private_subnets
}

output "public_subnets" {
  value = module.uig_vpc.public_subnets
}

output "database_subnets" {
  value = module.uig_vpc.database_subnets
}
