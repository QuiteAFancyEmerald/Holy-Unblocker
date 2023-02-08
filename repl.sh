##### Script for repl.it since it doesn't use the latest version of node.js ###

NVM_HOME="$PWD/nvm" # Changing the installation directory
echo " NVM_HOME='$NVM_HOME'
$(wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh)" | sed -E 's/\$(HOME|\{HOME\})/$NVM_HOME/g' | bash # Installing with the specified directory

export NVM_DIR="$NVM_HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# --lts would be your desired version, i.e. 10, 12, --latest-npm. --lts is (obviously) the LTS version.
nvm install 16

npm install

node --max_old_space_size=2560 ./backend.js
