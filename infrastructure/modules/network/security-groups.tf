module "ssh_security_group" {
  source  = "registry.terraform.io/terraform-aws-modules/security-group/aws//modules/ssh"
  version = "~> 4.0"

  name                = "ssh-sg-${var.env}"
  vpc_id              = module.uig_vpc.vpc_id
  ingress_cidr_blocks = ["0.0.0.0/0"]
}

module "http_security_group" {
  source  = "registry.terraform.io/terraform-aws-modules/security-group/aws//modules/http-80"
  version = "~> 4.0"

  name                = "http-sg-${var.env}"
  vpc_id              = module.uig_vpc.vpc_id
  ingress_cidr_blocks = ["0.0.0.0/0"]
}

module "https_security_group" {
  source  = "registry.terraform.io/terraform-aws-modules/security-group/aws//modules/https-443"
  version = "~> 4.0"

  name                = "https-sg-${var.env}"
  vpc_id              = module.uig_vpc.vpc_id
  ingress_cidr_blocks = ["0.0.0.0/0"]
}

output "ssh_security_group" {
  value = module.ssh_security_group.security_group_id
}

output "http_security_group" {
  value = module.http_security_group.security_group_id
}

output "https_security_group" {
  value = module.https_security_group.security_group_id
}
