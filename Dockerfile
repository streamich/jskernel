FROM node:4.4.3

RUN apt-get update && apt-get upgrade -y

# Standard stuff. (Install `nodejs` here as well, so it fetches all necessary dependencies.)
RUN apt-get install -y -q --no-install-recommends \
        apt-transport-https \
        software-properties-common \
        build-essential \
        libssl-dev \
        ca-certificates \
        curl \
        wget \
        git \
        g++ \
        make \
        python-software-properties \
        python

# Global `npm` packages.
#RUN npm install -g npm@latest
#RUN npm install -g node-gyp n typescript tsd mocha
