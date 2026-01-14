# Terraform configuration for Todo Task AWS Infrastructure
# This is an example - adjust based on your needs

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# VPC (if using private subnets)
# data "aws_vpc" "default" {
#   default = true
# }

# ============================================
# Option A: RDS MySQL Instance (Free Tier Eligible)
# ============================================
# Uncomment this section if using RDS MySQL
resource "aws_db_instance" "todo_task" {
  identifier           = "todo-task-db"
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = "db.t3.micro" # Free Tier eligible
  allocated_storage    = 20 # Free Tier includes 20 GB
  storage_type         = "gp3"
  storage_encrypted    = true
  db_name              = "TodoTaskDB"
  username             = var.db_username
  password             = var.db_password
  db_subnet_group_name = aws_db_subnet_group.todo_task.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible  = true # Set to false if using VPC endpoints
  backup_retention_period = 7
  backup_window        = "03:00-04:00"
  maintenance_window   = "mon:04:00-mon:05:00"
  skip_final_snapshot  = true # Set to false for production
  deletion_protection  = false # Set to true for production
  
  # Free Tier considerations
  performance_insights_enabled = false
  monitoring_interval         = 0
  auto_minor_version_upgrade  = true
  
  tags = {
    Name = "Todo Task Database"
    Environment = "Production"
  }
}

# ============================================
# Option B: Aurora Serverless v2 Cluster
# ============================================
# Uncomment this section if using Aurora Serverless v2
# resource "aws_rds_cluster" "todo_task" {
#   cluster_identifier      = "todo-task-cluster"
#   engine                  = "aurora-mysql"
#   engine_version          = "8.0.mysql_aurora.3.04.0"
#   database_name           = "TodoTaskDB"
#   master_username         = var.db_username
#   master_password         = var.db_password
#   backup_retention_period = 7
#   preferred_backup_window = "03:00-04:00"
#   db_subnet_group_name    = aws_db_subnet_group.todo_task.name
#   vpc_security_group_ids  = [aws_security_group.rds.id]
#   enabled_cloudwatch_logs_exports = ["audit", "error", "general", "slowquery"]
#   storage_encrypted       = true
#
#   serverlessv2_scaling_configuration {
#     min_capacity = 0.5
#     max_capacity = 16
#   }
# }
#
# resource "aws_rds_cluster_instance" "todo_task" {
#   identifier         = "todo-task-instance"
#   cluster_identifier = aws_rds_cluster.todo_task.id
#   instance_class     = "db.serverless"
#   engine             = aws_rds_cluster.todo_task.engine
#   engine_version     = aws_rds_cluster.todo_task.engine_version
# }

resource "aws_db_subnet_group" "todo_task" {
  name       = "todo-task-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "Todo Task DB Subnet Group"
  }
}

# Security Group for Lambda
resource "aws_security_group" "lambda" {
  name        = "todo-task-lambda-sg"
  description = "Security group for Todo Task Lambda functions"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Todo Task Lambda Security Group"
  }
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "todo-task-rds-sg"
  description = "Security group for Todo Task RDS MySQL instance"

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id] # Allow from Lambda security group
  }

  # Temporary: Allow public access for testing (remove in production)
  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow MySQL from anywhere (temporary for testing)"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Todo Task RDS Security Group"
  }
}

# Lambda Function
resource "aws_lambda_function" "todo_task_api" {
  filename         = "lambda-deployment.zip"
  function_name    = "TodoTaskAPI"
  role            = aws_iam_role.lambda.arn
  handler         = "TodoTask.API::TodoTask.API.LambdaEntryPoint::FunctionHandlerAsync"
  runtime         = "provided.al2023" # or "dotnet8" if available
  timeout         = 30
  memory_size     = 512

  environment {
    variables = {
      ASPNETCORE_ENVIRONMENT = "Production"
    }
  }

  vpc_config {
    subnet_ids         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda" {
  name = "TodoTaskLambdaRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# API Gateway
resource "aws_apigatewayv2_api" "todo_task" {
  name          = "TodoTaskAPI"
  protocol_type = "HTTP"
  description   = "Todo Task Application API"
}

# EventBridge Rule
resource "aws_cloudwatch_event_rule" "daily_reminder" {
  name                = "DailyReminderCheck"
  description         = "Trigger reminder job daily"
  schedule_expression = "rate(1 day)"
}

resource "aws_cloudwatch_event_target" "reminder_job" {
  rule      = aws_cloudwatch_event_rule.daily_reminder.name
  target_id = "ReminderJobTarget"
  arn       = aws_lambda_function.reminder_job.arn
}

# SNS Topic
resource "aws_sns_topic" "reminders" {
  name = "TodoTaskReminders"
}

# Outputs
output "api_gateway_url" {
  value = aws_apigatewayv2_api.todo_task.api_endpoint
}

# For RDS MySQL (Option A)
output "rds_endpoint" {
  value = aws_db_instance.todo_task.endpoint
}

output "rds_address" {
  value = aws_db_instance.todo_task.address
}

# For Aurora Serverless v2 (Option B) - uncomment if using Aurora
# output "aurora_cluster_endpoint" {
#   value = aws_rds_cluster.todo_task.endpoint
# }
#
# output "aurora_reader_endpoint" {
#   value = aws_rds_cluster.todo_task.reader_endpoint
# }

