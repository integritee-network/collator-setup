#!/bin/bash
set -euo pipefail

# simply executes yarn sync with our integritee config and pipe the output to a log file
# because there is a lot of output when executing the cmd.

eval `ssh-agent`
ssh-add ~/.ssh/intgeritee_rsa

yarn sync -c config/integritee-kusama.json 2>&1 | tee ./log/yarn_sync.log
