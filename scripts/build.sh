#!/bin/bash

echo "🔍 Checking git branch: $VERCEL_GIT_COMMIT_REF"

if [ "$VERCEL_GIT_COMMIT_REF" != "master" ]; then
  echo "⏭️ Ignorando build porque no es master"
  exit 0
fi

echo "✅ Building master branch"
npm run build
