terraform {
  required_providers {
    mysql = {
      # https://registry.terraform.io/providers/petoju/mysql/latest/docs
      source  = "petoju/mysql"
      version = "3.0.37"
    }
  }
}