# Static

resource "aws_ssm_parameter" "uig_db_host" {
  name  = "/${var.env}/db/host"
  type  = "SecureString"
  value = aws_db_instance.uig_db.address
}

resource "aws_ssm_parameter" "uig_db_port" {
  name  = "/${var.env}/db/port"
  type  = "SecureString"
  value = aws_db_instance.uig_db.port
}

resource "aws_ssm_parameter" "uig_db_name" {
  name  = "/${var.env}/db/name"
  type  = "SecureString"
  value = aws_db_instance.uig_db.db_name
}

resource "aws_ssm_parameter" "uig_db_username" {
  name  = "/${var.env}/db/username"
  type  = "SecureString"
  value = aws_db_instance.uig_db.username
}

resource "aws_ssm_parameter" "uig_db_password" {
  name  = "/${var.env}/db/password"
  type  = "SecureString"
  value = aws_db_instance.uig_db.password
}

resource "aws_ssm_parameter" "uig_db_version" {
  name  = "/${var.env}/db/version"
  type  = "SecureString"
  value = aws_db_instance.uig_db.engine_version
}

# dynamic

resource "aws_ssm_parameter" "uig_child_db_name" {
  count = length(local.db_config.dbs)

  name  = "/${var.env}/db/${local.db_config.dbs[count.index]}/name"
  type  = "SecureString"
  value = mysql_database.databases[count.index].name
}

resource "aws_ssm_parameter" "uig_child_db_username" {
  count = length(local.db_config.dbs)

  name  = "/${var.env}/db/${local.db_config.dbs[count.index]}/username"
  type  = "SecureString"
  value = mysql_user.db_user[count.index].user
}

resource "aws_ssm_parameter" "uig_child_db_password" {
  count = length(local.db_config.dbs)

  name  = "/${var.env}/db/${local.db_config.dbs[count.index]}/password"
  type  = "SecureString"
  value = mysql_user.db_user[count.index].password
}