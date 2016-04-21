#!/usr/bin/env bash

# Install Docker.
wget -qO- https://get.docker.com/ | sudo sh
#sudo docker run hello-world

# Install Docker autocomplete.
sudo apt-get install -y jq socat
sudo curl -ksSL https://raw.githubusercontent.com/docker/docker/$(docker --version | awk 'NR==1{print $NF}')/contrib/completion/bash/docker | sudo tee /etc/bash_completion.d/docker
sudo curl -o ~/.docker-complete https://raw.githubusercontent.com/nicferrier/docker-bash-completion/master/docker-complete
source ~/.docker-complete
sudo cat ~/.docker-complete >> ~/.bashrc
