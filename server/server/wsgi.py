"""
WSGI config for server project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/wsgi/
"""

import os
import subprocess
import datetime

from configparser import ConfigParser
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# Connect to the GitHub repository for pushing epub files
config_file = 'config.ini'
config = ConfigParser()
config.read(config_file)
mode = config.get('github_settings', 'mode')
# If set to 'production' pushing to GitHub will be enabled
if mode == "production":
    access_token = config.get('github_settings', 'github_token')
    email = config.get('github_settings', 'email')
    real_name = config.get('github_settings', 'real_name')
    github_name = config.get('github_settings', 'github_name')
    repository_name = config.get('github_settings', 'repository_name')

    print("\nGithub setup:\n")

    subprocess.run(["git", "init"])

    subprocess.run(["git", "config", "user.email", email])
    subprocess.run(["git", "config", "user.name", real_name])

    branch_name = f"{datetime.date.today()}"
    subprocess.run(["git", "branch", "-m", branch_name])

    subprocess.run(["git", "add", "test-books/"])
    subprocess.run(["git", "commit", "--quiet", "-m", "Server start"])

    server = f"https://{github_name}:{access_token}@github.com/{github_name}/{repository_name}.git"
    subprocess.run(["git", "remote", "add", "origin", server])

    subprocess.run(["git", "config", "pull.rebase", "false"])
    subprocess.run(["git", "pull", "--quiet", "--allow-unrelated-histories", server, branch_name])
    subprocess.run(["git", "push", "-u", server, branch_name])

    print("Git setup finished!")
application = get_wsgi_application()
