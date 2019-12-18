#!/usr/bin/env sh
set -e

git checkout master
git merge develop

VERSION=`npx select-version-cli`
read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Releasing $VERSION ..."

  # build
  VERSION=$VERSION npm run dist

  # commit
  git add -A
  git commit -m "[build] $VERSION"
  npm version $VERSION --message "[release] $VERSION"

  # publish
  git push origin master
  git checkout develop
  git rebase master
  #git push github dev
  git push origin develop
  git push origin --tags

  if [[ $VERSION =~ "beta" ]]
    then
      npm publish --tag beta
    else
      npm publish
    fi
fi
