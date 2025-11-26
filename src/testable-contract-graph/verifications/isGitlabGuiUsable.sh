#!/bin/bash

set -e

echo ""
echo " file: isGitlabGuiUsable.sh"
echo " description: Verifying if the GitLab GUI is usable."
echo ""
echo " Please perform the following in another terminal:"
echo " 1. Go to http://gitlab:8080/ and log in with the new credentials."
echo ""
echo " Send OK if login succeeded, press ENTER if login failed."
read VALUE

if [ -n "$VALUE" ]; then
    echo "✅ [tty] verification passed: GitLab GUI is usable"
    exit 0
else
    echo "❌ [tty] verification failed: GitLab GUI is not usable"
    exit 1
fi