#!/bin/bash
set -ev
set -o pipefail

target_version="~2.1"

echo "releasing codepush for ios"
code-push release-react AllAboutOlaf-iOS ios -d release --targetBinaryVersion "$target_version"

echo "releasing codepush for android"
code-push release-react AllAboutOlaf-Android android -d release --targetBinaryVersion "$target_version"
