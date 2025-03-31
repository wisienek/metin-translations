module "db_security_group" {
  source  = "registry.terraform.io/terraform-aws-modules/security-group/aws"
  version = "~> 4.0"

  name                = "db-sg-${var.env}"
  vpc_id              = var.network.vpc_id
  ingress_cidr_blocks = ["0.0.0.0/0"]
  egress_cidr_blocks  = ["0.0.0.0/0"]

  ingress_with_source_security_group_id = [
    {
      rule                     = "mysql-tcp"
      source_security_group_id = var.security.ecs_sg_id
      description              = "Allow from ECS Cluster"
    }
  ]
}

resource "aws_vpc_security_group_ingress_rule" "all" {
  count = var.initial_setup ? 1 : 0

  security_group_id = module.db_security_group.security_group_id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 3306
  to_port     = 3306
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "all" {
  count = var.initial_setup ? 1 : 0

  security_group_id = module.db_security_group.security_group_id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 3306
  to_port     = 3306
  ip_protocol = "tcp"
}

output "db_sg_id" {
  value = module.db_security_group.security_group_id
}