#!/bin/sh
# vercel runs this at build time, writes the key out of the env var into the file the pages load

if [ -z "$GOOGLE_PLACES_KEY" ]; then
  echo 'const GOOGLE_PLACES_KEY = "";' > js/database/google-config.js
else
  echo "const GOOGLE_PLACES_KEY = \"$GOOGLE_PLACES_KEY\";" > js/database/google-config.js
fi
