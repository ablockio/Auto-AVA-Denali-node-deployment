#!/bin/bash

#######################################
# Bash script to install dependencies in UBUNTU
# for https://www.avalabs.org/ Nodes
#######################################

echo '### Checking if systemd is supported...'
if systemctl show-environment &> /dev/null ; then
SYSTEMD_SUPPORTED=1
echo 'systemd is available, using it'
else
echo 'systemd is not available on this machine, will use supervisord instead'
fi

echo '### Updating packages...'
sudo apt-get update -y

echo '### Installing Go...'
wget https://dl.google.com/go/go1.13.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.13.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
source ~/.profile
go version


echo '### Installing dependencies...'
sudo apt-get install libssl-dev libuv1-dev cmake make curl g++ -y
sudo apt install git -y
if [ ! -n "$SYSTEMD_SUPPORTED" ]; then
sudo apt install supervisor
fi

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
if [ -n "$SYSTEMD_SUPPORTED" ]; then
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
else
sudo bash -c 'cat <<EOF > /etc/supervisor/conf.d/avanode.conf
[program:avanode]
directory=/home/$SUDO_USER/go/src/github.com/ava-labs/gecko
command=/home/$SUDO_USER/go/src/github.com/ava-labs/gecko/build/ava
user=$SUDO_USER
environment=HOME="/home/$SUDO_USER",USER="$SUDO_USER"
autostart=true
autorestart=true
startsecs=10
startretries=20
stdout_logfile=/var/log/avanode-stdout.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=1
stderr_logfile=/var/log/avanode-stderr.log
stderr_logfile_maxbytes=10MB
stderr_logfile_backups=1
EOF'
fi

echo '### Launching AVA node...'
if [ -n "$SYSTEMD_SUPPORTED" ]; then
sudo systemctl enable avanode
sudo systemctl start avanode
echo 'Type the following command to monitor the AVA node service:'
echo '    sudo systemctl status avanode'
else
sudo service supervisor start
sudo supervisorctl start avanode
echo 'Type the following command to monitor the AVA node service:'
echo '    sudo supervisorctl status avanode'
fi

echo '### Cloning Script directory...'
cd $HOME
sudo rm -R Auto-AVA-Denali-node-deployment/
git clone https://github.com/ablockio/Auto-AVA-Denali-node-deployment.git
cd Auto-AVA-Denali-node-deployment
npm i
