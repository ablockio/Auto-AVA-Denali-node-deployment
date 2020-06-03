#!/bin/bash

#######################################
# Bash script to install dependencies in UBUNTU
# for https://www.avalabs.org/ Nodes
#######################################

echo '### Updating packages...'
sudo apt-get update -y

echo '### Installing Go...'
wget https://dl.google.com/go/go1.13.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.13.linux-amd64.tar.gz
echo "export PATH=/usr/local/go/bin:$PATH" >> $HOME/.profile
source $HOME/.profile
go version


echo '### Installing dependencies...'
sudo apt-get install libssl-dev libuv1-dev cmake make curl g++ -y
sudo apt install git -y


echo '### Installing nodejs...'
sudo apt-get update -y
# sudo apt upgrade
sudo apt-get -y install curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install gcc g++ make
sudo apt-get -y install nodejs
sudo apt-get -y install npm

echo '### Cloning gecko directory...'
cd $HOME
go get -v -d github.com/ava-labs/gecko/...

cd go/src/github.com/ava-labs/gecko

echo '### Building AVA node...'
./scripts/build.sh

echo '### Creating AVA node service...'
sudo USER=$USER bash -c 'cat <<EOF > /etc/systemd/system/avanode.service
[Unit]
Description=AVA Node service
After=network.target

[Service]
User=$USER
Group=$USER

WorkingDirectory=$HOME/go/src/github.com/ava-labs/gecko
ExecStart=$HOME/go/src/github.com/ava-labs/gecko/build/ava

Restart=always
PrivateTmp=true
TimeoutStopSec=60s
TimeoutStartSec=10s
StartLimitInterval=120s
StartLimitBurst=5

[Install]
WantedBy=multi-user.target
EOF'

echo '### Launching AVA node...'
sudo systemctl enable avanode
sudo systemctl start avanode

echo '### Cloning Script directory...'
cd $HOME
sudo rm -R Auto-AVA-Denali-node-deployment/
git clone https://github.com/ablockio/Auto-AVA-Denali-node-deployment.git
cd Auto-AVA-Denali-node-deployment
npm i
