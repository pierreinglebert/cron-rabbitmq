'use strict';

//new Exchange('cron');

function consumer(conn) {
  var ok = conn.createChannel(function(err, ch) {
    if (err != null) bail(err);
    ch.assertQueue(q);
    ch.consume(q, function(msg) {
      if (msg !== null) {
        console.log(msg.content.toString());
        ch.ack(msg);
      }
    });
  });
}


var cluster = require('cluster');


function gracefulStop(worker) {
  worker.send({
    command: 'shutdown'
  });
  worker.disconnect();
  var timeout = setTimeout(function() {
    worker.kill();
  }, 2000);

  worker.on('disconnect', function() {
    clearTimeout(timeout);
  });
}

var max_worker = 0;

if (cluster.isMaster) {

  var worker = cluster.fork();
  // cluster.fork();
  // cluster.fork();
  // cluster.fork();

  

  if(Object.keys(cluster.workers).length < max_worker) {

  }

  for (var id in cluster.workers) {
    cluster.workers[id].isConnected();
  }

} else if (cluster.isWorker) {

  cluster.worker.process.title = 'node WORKER';

  console.log('worker');

  process.on('message', function(msg) {
    if(msg.command === 'shutdown') {
      // initiate graceful close of any connections to server
    }
  });
}
