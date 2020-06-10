#!/bin/bash

#######################################
# Bash script to install dependencies in UBUNTU
# for https://www.avalabs.org/ Nodes
#######################################
echo '   _________   _________              ________  ___________ _______      _____  .____    .___ '
echo '  /  _  \   \ /   /  _  \             \______ \ \_   _____/ \      \    /  _  \ |    |   |   |'
echo ' /  /_\  \   Y   /  /_\  \    ______   |    |  \ |    __)_  /   |   \  /  /_\  \|    |   |   |'
echo '/    |    \     /    |    \  /_____/   |    `   \|        \/    |    \/    |    \    |___|   |'
echo '\____|__  /\___/\____|__  /           /_______  /_______  /\____|__  /\____|__  /_______ \___|'
echo '        \/              \/ script powered by  \/ ablock \/         \/         \/        \/   '
echo 'If you want to help us, contact us on contact@ablock.io'

AVA_VERSION='0.5.5'
echo '### Starting update of AVA Node to '$AVA_VERSION'...'

echo '### Stopping existing AVA node if launched manually ...'
if [  -f "/etc/systemd/system/avanode.service" ]; then
SYSTEMD_INSTALLED=1
echo '### systemd is used'
sudo systemctl stop avanode
elif [  -f "/etc/supervisor/conf.d/avanode.conf" ]; then
echo '### supervisor is used'
sudo supervisorctl stop avanode
else
echo '### nohup is used'
NOHUP_USED=1
PID=`ps -ef | grep build/ava | grep root | tr -s ' ' | cut -d ' ' -f2`
echo $PID
sudo kill -9 $PID
fi


echo '### Checking if systemd is supported...'
if systemctl show-environment &> /dev/null ; then
SYSTEMD_SUPPORTED=1
echo 'systemd is available, using it'
else
echo 'systemd is not available on this machine, will use supervisord instead'
fi

if [ -n "$NOHUP_USED" ]; then
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
fi


echo '### Downloading latest version...'
wget https://github.com/ava-labs/gecko/releases/download/v$AVA_VERSION/gecko-linux-$AVA_VERSION.tar.gz
tar -xvf gecko-linux-$AVA_VERSION.tar.gz
cd gecko-$AVA_VERSION
mv ava $HOME/go/src/github.com/ava-labs/gecko/build/
mv plugins/evm $HOME/go/src/github.com/ava-labs/gecko/build/plugins


echo '   _________   _________              ________  ___________ _______      _____  .____    .___ '
echo '  /  _  \   \ /   /  _  \             \______ \ \_   _____/ \      \    /  _  \ |    |   |   |'
echo ' /  /_\  \   Y   /  /_\  \    ______   |    |  \ |    __)_  /   |   \  /  /_\  \|    |   |   |'
echo '/    |    \     /    |    \  /_____/   |    `   \|        \/    |    \/    |    \    |___|   |'
echo '\____|__  /\___/\____|__  /           /_______  /_______  /\____|__  /\____|__  /_______ \___|'
echo '        \/              \/ script powered by  \/ ablock \/         \/         \/        \/   '
echo 'If you want to help us, contact us on contact@ablock.io'

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
