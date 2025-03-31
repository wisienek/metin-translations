data "aws_region" "current" {}

locals {
  region = data.aws_region.current.name

  vpc_name = "uig_internal_vpc_${var.env}"
  azs      = ["${local.region}a", "${local.region}b", "${local.region}c"]
}
