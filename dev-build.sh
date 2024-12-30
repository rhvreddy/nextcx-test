#!/bin/sh
#changing node version
source ~/.nvm/nvm.sh
nvm use 16

#read -p "Did you point baseURL in auth-skil.interceptor properly? (Y/N): " baseURLCheck
# shellcheck disable=SC2034
baseURLCheck='Y'

git pull origin DEV-01

#git add --all


#git commit -m "$1"

#git push origin DEV-01

#patch version until we release other stuff....!
npm version patch

#git add --all

#git commit -m "$1"

#git push origin DEV-01


yarn install

git checkout .


# shellcheck disable=SC2028
echo "\nGood job on taking care of every minute details...Cheers \n "

echo  "🍺 🍺 🍺 🍺 🍺 🍺 🍺 🍺 🍺 🍺  "
   # shellcheck disable=SC2028
   echo "\nThank you, will proceed with build\n"
      npm run build




if [ $? -ne 0 ]; then
   #There were errors, automatically answer "Y"
  echo "Any build errors? (Y/N): Y"
  echo "Build failed"
  echo "\n\n Please fix the build errors and re build again \n\n"
else
  # There were no errors, automatically answer "N"
  echo "Any build errors? (Y/N): N"
  echo "Build successful"


        sh ./dev-deploy.sh

   fi
#else
   #echo "\n Please change it and re deploy again \n\n"##
#fi
