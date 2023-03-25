#!/bin/bash

#download node and npm
sudo yum install -y gcc-c++ make 
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node
sudo rm -R /var/cache/yum/x86_64/2/nodesource/
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs

#create our working directory if it doesnt exist
DIR="/home/ec2-user/agora-main"
if [ -d "$DIR" ]; then
  echo "${DIR} exists"
else
  echo "Creating ${DIR} directory"
  mkdir ${DIR}
fi

#import env
cd /home/ec2-user/agora-main
touch .env
echo MONGODB=$(aws ssm get-parameter --region us-east-2 --name "MONGODB" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env
echo SECRET_KEY=$(aws ssm get-parameter --region us-east-2 --name "SECRET_KEY" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env
echo ADMIN_SERVER_URL=$(aws ssm get-parameter --region us-east-2 --name "ADMIN_SERVER_URL" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env
echo HMS_APP_ACCESS_KEY=$(aws ssm get-parameter --region us-east-2 --name "HMS_APP_ACCESS_KEY" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env
echo NODE_ENV=$(aws ssm get-parameter --region us-east-2 --name "NODE_ENV" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env
echo HMS_DISCOURSE_TEMPLATE=$(aws ssm get-parameter --region us-east-2 --name "HMS_DISCOURSE_TEMPLATE" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env
echo HMS_URI=$(aws ssm get-parameter --region us-east-2 --name "HMS_URI" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env
echo ADMIN_SERVER_TOKEN=$(aws ssm get-parameter --region us-east-2 --name "ADMIN_SERVER_TOKEN" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env
echo LP_KEY=$(aws ssm get-parameter --region us-east-2 --name "LP_KEY" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env
echo LP_BASE_URL=$(aws ssm get-parameter --region us-east-2 --name "LP_BASE_URL" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env
echo HMS_BEAM_URL=$(aws ssm get-parameter --region us-east-2 --name "HMS_BEAM_URL" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env
echo HMS_DOMAIN=$(aws ssm get-parameter --region us-east-2 --name "HMS_DOMAIN" --query "Parameter.Value" --output text) >> /home/ec2-user/agora-main/.env




