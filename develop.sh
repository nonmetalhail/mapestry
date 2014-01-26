#!/bin/bash
#
# Creates build/virtualenv, for use when developing
# the app.

set -e

DIR=$(cd $(dirname $0); pwd)

mkdir -p $DIR/build
virtualenv $DIR/build/virtualenv
$DIR/build/virtualenv/bin/pip install -r $DIR/requirements.txt

