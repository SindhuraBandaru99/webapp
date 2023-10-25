packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.0.0"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-06db4d78cb1d3bbf9"
}

variable "ssh_username" {
  type    = string
  default = "admin"
}

variable "subnet_id" {
  type    = string
  default = "subnet-0b715170798cb04be"
}

variable "aws_profile" {
  type    = string
  default = "github"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "ami_users" {
  type = list(string)
  default = [
    "902069452795"
  ]
}

variable "ami_regions" {
  type = list(string)
  default = [
    "us-east-1"
  ]
}

# https://www.packer.io/plugins/builders/amazon/ebs
source "amazon-ebs" "my-ami" {
  region          = "${var.aws_region}"
  profile         = "${var.aws_profile}"
  ami_name        = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_users       = "${var.ami_users}"
  ami_description = "AMI for CSYE 6225"
  ami_regions     = "${var.ami_regions}"

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  instance_type = "${var.instance_type}"
  source_ami    = "${var.source_ami}"
  ssh_username  = "${var.ssh_username}"
  subnet_id     = "${var.subnet_id}"

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp2"
  }
}

build {
  sources = ["source.amazon-ebs.my-ami"]

  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1"
    ]
    inline = [
      "sudo groupadd csye6225",
      "sudo useradd -s /bin/false -g csye6225 -d /opt/csye6225 -m csye6225",
      "sudo apt update",
      // "sudo apt install -y mariadb-server",
      // "sudo systemctl start mariadb",
      // "sudo systemctl enable mariadb",
      // "sudo mysql -u root <<EOF",
      // "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Vani@1972';",
      // "FLUSH PRIVILEGES;",
      // "EOF",
      // "sudo apt update",
      "sudo apt install -y nodejs npm",
      "node -v",
      "npm -v",
      "mkdir -p webapp/build"
    ]
  }
  provisioner "file" {
    //source      = "package.json"  
    source      = "package.json"                    # Local path to the files to be copied
    destination = "/home/admin/webapp/package.json" # Destination path on the AMI
  }
  provisioner "file" {
    //source      = "dist/main.js"  
    source      = fileexists("build/artifact.js") ? "build/artifact.js" : "/" # Local path to the files to be copied
    destination = "/home/admin/webapp/build/artifact.js"                      # Destination path on the AMI
  }
  provisioner "file" {
    //source      = ".env" 
    source      = fileexists(".env") ? ".env" : "/" # Local path to the files to be copied
    destination = "/home/admin/webapp/.env"         # Destination path on the AMI
  }
  provisioner "file" {
    //source      = ".env" 
    source      = fileexists("users.csv") ? "users.csv" : "/" # Local path to the files to be copied
    destination = "/home/admin/users.csv"                     # Destination path on the AMI
  }

  provisioner "file" {
    source      = fileexists("web-app.service") ? "web-app.service" : "/" # Local path to the files to be copied
    destination = "/home/admin/web-app.service"                           # Destination path on the AMI
  }

  provisioner "shell" {
    inline = [
      "sudo mv users.csv /opt/",
      "sudo mv web-app.service /etc/systemd/system",
      "cd webapp",
      "npm install",
      "sudo mv webapp /opt/csye6225/",
      "sudo chown -R csye6225:csye6225 /opt/",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable web-app",
      "sudo systemctl start web-app"
    ]
  }
}