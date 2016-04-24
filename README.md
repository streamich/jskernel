## jskernel

The Node.js exokernel dream.

There are already two projects: [NodeOS](https://node-os.com/) and [runtime.js](http://runtimejs.org/) that work
towards creating Node.js operating system, or kernel. See [architecture comparison](./docs/exokernels.md)
with jskernel proposal.


## Development

If you don't have Docker yet:

    vagrant up
    vagrant ssh
    sudo /share/install.sh
    
Start a Docker container:
    
    sudo docker build -t jskernel /share/
    sudo docker run -it -v /share:/share --name myjskernel jskernel /bin/bash
    cd /share
    npm install -g npm@latest
    npm install -g node-gyp n typescript tsd mocha
    tsd install node
    
Next time just do:

    sudo docker start -i myjskernel
    
    
    
    