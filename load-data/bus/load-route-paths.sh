DIRNAME=$(dirname "$0")

node $DIRNAME/load-bus-route-paths.js
node $DIRNAME/load-remaining-route-paths-onemap.js
node $DIRNAME/load-remaining-route-paths-trim-parent.js
