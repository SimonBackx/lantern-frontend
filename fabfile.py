from fabric.api import *
from fabric.contrib.files import exists
from fabric.state import output
from fabric.contrib.project import rsync_project
from fabric.contrib.console import confirm
import yaml

output['running'] = False

env.hosts = ["ubuntu@lantrn.xyz"]

def localDeploy():
    with settings(hide('warnings', 'running', 'stdout')):
        local("rsync -avh ./public/ /etc/lantern/www")

def deploy():
    upload()
    print ("Done.")

def upload():
    print ("Uploading...")
    with settings(hide('warnings', 'running', 'stdout')):
        rsync_project(remote_dir="/etc/lantern/www", local_dir="public/", delete= True)
