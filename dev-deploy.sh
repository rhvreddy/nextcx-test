#!/bin/sh

#git pull origin DEV-01

git pull origin DEV-01

pm2 list

pm2 delete nextcx-ai-react-app-dev

pm2 start npm --name "nextcx-ai-react-app-dev" -- start

#pm2 logs
