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