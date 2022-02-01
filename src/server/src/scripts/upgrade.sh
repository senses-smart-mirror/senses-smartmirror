#!/bin/bash

function log() { echo "$1"; }
log "[Smart Mirror] - Update started..."

mkdir backup
cp config/saved-config.json backup/saved-config.json
cp config/stored-components.json backup/stored-components.json
cp config/backup-config.json backup/backup-config.json

# copy profile files
find . -name "*-profile.json" -exec mv '{}' backup/ \;

# backup custom widgets
cp -r server/widgets backup/widgets

log "[Mirror Update] - Downloading the Smart Mirror software."
curl -s -o smart-mirror.zip https://github.com/senses-smart-mirror/senses-smartmirror/releases/latest/download/senses-smartmirror.zip

FOUND=false
[ -f smart-mirror.zip ] && FOUND=true || FOUND=false

if $FOUND;
  then
   log "[Mirror Update] - Package downloaded.."
  else
    log "[Mirror Update] - ERROR: Something went wrong, package is not downloaded!"
    exit
fi

log "[Mirror Update] - Unzipping..."
unzip -q -o smart-mirror.zip
cp -f -r smart-mirror/* .

log "[Mirror Update] - Restore saved files & configuration"
cp backup/saved-config.json config/saved-config.json
cp backup/stored-components.json config/stored-components.json
cp backup/backup-config.json config/backup-config.json

cd backup
find . -name "*-profile.json" -exec mv '{}' ../config/ \;
cd ../

FOUND=false
[ -f config/saved-config.json ] && FOUND=true || FOUND=false

if $FOUND;
  then
   log "[Mirror Update] - Configuration restored."
  else
    log "[Mirror Update] - ERROR: Something went wrong, configuration is not restored."
fi

log "[Mirror Update] - Removing node_module folders!"

rm -rf node_modules

cd server

rm -rf node_modules

cd ../

log "[Mirror Update] - Install npm packages.."

if npm ci --quiet --no-progress --silent;
  then
    log "[Mirror Update] - Installed npm packages for launcher."
  else
    log "[Mirror Update] - Installed npm packages for launcher failed."
fi

cd server
if npm ci --quiet --no-progress --silent;
  then
    log "[Mirror Update] - Installed npm packages for server"
  else
    log "[Mirror Update] - Installed npm packages for server failed.."
fi

cd ../
log "[Mirror Update] - Cleanup started.."
rm smart-mirror.zip
rm -rf smart-mirror/

log "[Mirror Update] - Cleanup process finished."
log "[Mirror Update] - Restarting Smart Mirror."
