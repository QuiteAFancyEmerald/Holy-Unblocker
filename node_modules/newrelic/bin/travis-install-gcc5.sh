#! /bin/bash

set -x # echo commands as executed

sudo apt-get install -qq gcc-5 g++-5
sudo update-alternatives \
  --install /usr/bin/gcc gcc /usr/bin/gcc-5 60 \
  --slave /usr/bin/g++ g++ /usr/bin/g++-5
sudo update-alternatives --auto gcc
export CXX="g++-5" CC="gcc-5"
