DIRNAME=$(dirname "$0")

$DIRNAME/bus/load-all.sh
node $DIRNAME/mrt/load-stations.js
