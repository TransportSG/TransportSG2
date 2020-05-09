DIRNAME=$(dirname "$0")

$DIRNAME/update-data.sh

node $DIRNAME/load-file.js SBS
node $DIRNAME/load-file.js SMB
node $DIRNAME/load-file.js SG
node $DIRNAME/load-file.js TIB

node $DIRNAME/sgwiki-update.js
