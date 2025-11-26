#!/bin/bash

set -e

echo ""
echo " file: isGitlabContainerAvailable.sh"
echo " description: Verifying if the GitLab container is available."
echo ""

VALUE="$(curl -s -o /dev/null -w '%{http_code}' http://gitlab:8080)"

if [ "$VALUE" = "302" ]; then
    echo "✅ [tty] verification passed: GitLab container is available"
    exit 0
else
    echo "❌ [tty] verification failed: GitLab container is not available"
    exit 1
fi