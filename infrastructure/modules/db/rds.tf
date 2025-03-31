resource "aws_db_subnet_group" "db_subnets" {
  name       = "uig-db-subnets-${var.env}"
  subnet_ids = var.network.database_subnets
}

resource "random_password" "db_password" {
  count = length(local.db_config.dbs) + 1

  length  = 32
  special = false
  keepers = {
    pass_version = 1
  }
}

resource "aws_db_instance" "uig_db" {
  identifier = local.db_config.id

  allocated_storage = length(local.db_config.dbs) * 8
  storage_encrypted = false

  engine         = local.db_instance_params.engine
  engine_version = local.db_instance_params.engine_version
  instance_class = var.instance_class.db
  db_name        = "main"

  username = local.db_config.master_username
  password = random_password.db_password[0].result

  enabled_cloudwatch_logs_exports = ["error"]

  apply_immediately   = true
  skip_final_snapshot = true

  multi_az               = false
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  vpc_security_group_ids = [module.db_security_group.security_group_id]

  publicly_accessible = var.initial_setup
}

# Dynamic

provider "mysql" {
  endpoint = aws_db_instance.uig_db.address
  username = aws_db_instance.uig_db.username
  password = aws_db_instance.uig_db.password
}

resource "mysql_user" "db_user" {
  count = length(local.db_config.dbs)

  user     = local.db_config.dbs[count.index]
  password = random_password.db_password[count.index + 1].result

  depends_on = [
    aws_db_instance.uig_db,
    aws_vpc_security_group_ingress_rule.all
  ]
}

resource "mysql_database" "databases" {
  count = length(local.db_config.dbs)

  name = local.db_config.dbs[count.index]

  depends_on = [
    aws_db_instance.uig_db
  ]
}

resource "mysql_grant" "sql_grant" {
  count = length(local.db_config.dbs)

  database = local.db_config.dbs[count.index]
  user     = mysql_user.db_user[count.index].user

  privileges = ["ALL"]

  depends_on = [
    mysql_user.db_user,
    mysql_database.databases
  ]
}


