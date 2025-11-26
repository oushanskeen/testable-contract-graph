#!/bin/bash

set -e

echo ""
echo " file: isCredentialsKnown.sh"
echo " description: Verifying if valid credentials are available."
echo ""
echo " Please run the following command(s) in another terminal:"
echo " 1. docker exec -it gitlab /opt/gitlab/bin/gitlab-rails runner \"u = User.find_by(username: 'root'); u.password = 'AnotherPassword'; u.password_confirmation = 'AnotherPassword'; u.save!\""
echo ""
echo " Send OK if login succeeded, press ENTER if login failed."
read VALUE

if [ -n "$VALUE" ]; then
    echo "✅ [tty] verification passed: GitLab GUI password is determined"
    exit 0
else
    echo "❌ [tty] verification failed: GitLab GUI password is not determined"
    exit 1
fi