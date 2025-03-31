data "aws_region" "current" {}

locals {
  region = data.aws_region.current.name

  db_config = {
    id              = "uig-internal-${var.env}"
    dbs             = ["lab_strapi", "studio_strapi", "holidays"]
    master_username = "uig_internal"
  }

  db_instance_params = {
    engine         = "mysql"
    engine_version = "8.0"
  }
}
