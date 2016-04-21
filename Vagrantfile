# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.define 'jskernel' do |c|
    c.vm.box = 'ubuntu'
	c.vm.box_url = 'http://cloud-images.ubuntu.com/vagrant/trusty/20160127/trusty-server-cloudimg-amd64-vagrant-disk1.box'
	c.vm.host_name = 'jskernel'
    c.vm.network 'public_network', ip: '192.168.1.153'
    c.vm.synced_folder "", "/share"
    c.vm.provider "virtualbox" do |v|
      v.memory = 1048
      v.cpus = 2
    end
  end
end
