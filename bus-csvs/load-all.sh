DIRNAME=$(dirname "$0")

$DIRNAME/update-data.sh

node $DIRNAME/load-file.js SBS
node $DIRNAME/load-file.js SMB
node $DIRNAME/load-file.js SG
node $DIRNAME/load-file.js TIB

node $DIRNAME/load-file.js PA
node $DIRNAME/load-file.js PC
node $DIRNAME/load-file.js CB
node $DIRNAME/load-file.js PD
node $DIRNAME/load-file.js PH
node $DIRNAME/load-file.js PZ
node $DIRNAME/load-file.js SH
node $DIRNAME/load-file.js RU
node $DIRNAME/load-file.js RD
node $DIRNAME/load-file.js WB
node $DIRNAME/load-file.js WC
node $DIRNAME/load-file.js YN
node $DIRNAME/load-file.js XD

node $DIRNAME/sgwiki-update.js
