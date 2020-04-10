DIRNAME=$(dirname "$0")

node $DIRNAME/load-bus-stops.js
node $DIRNAME/load-bus-services.js
node $DIRNAME/load-bus-service-stops.js
node $DIRNAME/trim-bus-services.js
node $DIRNAME/load-bus-service-loop-points.js
