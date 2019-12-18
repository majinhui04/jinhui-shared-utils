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
  VERSION=$VERSION
  npm run libs

  # commit
  # git add -A
  # git commit -m "docs: $VERSION"
  npm version $VERSION --message " $VERSION"

  # publish
  git push origin master
  git checkout develop
  git rebase master
  git push origin develop
  git push origin --tags

  if [[ $VERSION =~ "beta" ]]
    then
      npm publish --tag beta
    else
      npm publish
    fi
fi
