variable "env" {
  type = string
}

variable "network" {
  type = object({
    vpc_id : string
    database_subnets : list(string)
  })
}

variable "security" {
  type = object({
    ecs_sg_id : string
  })
}

variable "instance_class" {
  type = object({
    db : string
  })

  default = {
    db : "db.t3.micro"
  }
}

variable "initial_setup" {
  type    = bool
  default = false

  description = "Creates initial resources for setting up db"
}
