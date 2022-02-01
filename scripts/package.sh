#!/bin/bash

function log() { echo "##" "$1"; }

dir=$PWD

printf "\n\n"
log "----------------------- ## "
log "Start Build & Packaging ##"
log "----------------------- ##"
printf "\n"

mkdir target

# run installs and builds
for i in "gui" "app"; do
  cd $dir/src
  log "Start: [$i] -> npm install\n"
  cd $i || exit
  log "Path:"
  pwd

  npm ci --quiet --no-progress

  log "[$i] -> npm run build\n"
  npm run build

  if [ -d "dist" ]; then
    log "[$i] -> Copying Directory\n"
    cp -r dist $dir/target/$i
  else
    log "Finished: $i -> No dist folder..\n"
  fi
done

log "[Mirror Server] -> Build \n"

cd $dir/src/server || exit
log "Start: Server -> npm install\n"
log "Path:"
pwd

npm ci --quiet --no-progress

log "[Server] -> npm run build\n"
npm run build:js

if [ -d "dist" ]; then
  log "[Server] -> Copying Directory\n"
  cp -r dist $dir/target/server
else
  log "Finished: Server -> No dist folder..\n"
fi

# copy npm package files
log "[Mirror Server] -> Copying NPM files..\n"
cp -r package.json $dir/target/server
cp -r package-lock.json $dir/target/server
cp -r src/scripts $dir/target/server

# copy app folder to server folder
log "[Mirror App] - Copy UI (app) to server"
cd $dir/src/app || exit
mkdir $dir/target/server/public
cp -r dist/* $dir/target/server/public
if [ -f $dir/target/server/public/index.html ];
  then
    log "[Smart Mirror] - Copy success!"
  else
    log "[Smart Mirror] - ERROR: Failed to copy UI to server. Please try again."
    exit
fi

# remove original app
log "[Mirror App] -> Remove already copied app folder\n"
cd $dir/src
rm -rf app

log "[Mirror Config] -> Copying Directory\n"
cd $dir/src || exit
cp -r config $dir/target

log "[Mirror Launcher] -> Copying Directory\n"
cd $dir/src || exit
cp -r package.json $dir/target
cp -r senses.js $dir/target

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

log "[Smart Mirror] -> Zip"
cd $dir

mv target smart-mirror
zip -q senses-smartmirror.zip -r smart-mirror

# zip check
if [ -f $dir/senses-smartmirror.zip ]; then
  log "[Smart Mirror] -> All files zipped!"
else
  log "[Smart Mirror] -> zip failed"
fi

# script copy
log "[Smart Mirror] -> Copying Files"
cd $dir/scripts || exit
cp install.sh /var/www/downloadmirror.nl/html/scripts
cp preinstall.sh /var/www/downloadmirror.nl/html/scripts

if [ -d "/var/www/downloadmirror.nl/html/scripts" ]; then
  log "[Smart Mirror] -> Copy scripts success"
else
  log "[Smart Mirror] -> Copy scripts failed"
fi

# copy zip file
log "[Smart Mirror] -> Copy"
cp $dir/senses-smartmirror.zip /var/www/downloadmirror.nl/html

# create version file
cd /var/www/downloadmirror.nl/html/version
rm version.txt
echo -e "{\"version\": \"$PACKAGE_VERSION\"}" >> version.txt

# version file check
if [ -f /var/www/downloadmirror.nl/html/version/version.txt ]; then
  log "[Smart Mirror] -> Version file created."
else
  log "[Smart Mirror] -> Failed to create version file."
fi

# final check
if [ -f /var/www/downloadmirror.nl/html/senses-smartmirror.zip ]; then
  log "[Smart Mirror] -> All done!"
else
  log "[Smart Mirror] -> copy failed"
fi
