#!/bin/bash
#
# Creates build/virtualenv, for use when developing
# the app.

set -e

DIR=$(cd $(dirname $0); pwd)

if which virtualenv-2.7 &>/dev/null
then
   VIRTUALENV=virtualenv-2.7
else
   VIRTUALENV=virtualenv
fi

mkdir -p $DIR/build
$VIRTUALENV $DIR/build/virtualenv
$DIR/build/virtualenv/bin/pip install -r $DIR/requirements.txt

