'use strict';

var Bluebird = require('bluebird');
var childProcess = require('child_process');

function CronConsumer(name, file, options) {
  this.name = name;
	this.file = file;
  this.workers = [];
	this.consumerTag = null;

  options = options || {};
  this.timeout = options.timeout && options.timeout.process || 60 * 1000;
}

CronConsumer.prototype.start = function(channel) {
  this.channel = channel;
	return channel.consume(this.name, function(msg) {
    if (msg !== null) {
			this.consume(channel, msg);
    }
  }.bind(this))
	.then(function(res) {
		this.consumerTag = res.consumerTag;
	}.bind(this));
};

CronConsumer.prototype.stop = function(channel) {
  Bluebird.resolve().then(function() {
    if(this.consumerTag && channel) {
      return channel.cancel(this.consumerTag)
      .then(function() {
        this.consumerTag = null;
      }.bind(this));
    }
  }.bind(this));
};

CronConsumer.prototype.consume = function (channel, msg) {

	var worker = childProcess.fork(this.file, [], {});

  var timeout = setTimeout(function() {
    worker.disconnect();
    timeout = setTimeout(function() {
      worker.kill();
    }, 2000);
  }, this.timeout);

	worker.send(msg.content.toString());

	worker.on('exit', function(code, signal) {
    clearTimeout(timeout);
    this.workers = this.workers.filter(function(aWorker) {
      return worker === aWorker;
    });
		if(code === 0) {
			channel.ack(msg);
		} else {
      if(signal === 'SIGTERM') {
        // it has been killed by timeout
        channel.nack(msg);
      } else {
  			// an error occurred
  			channel.nack(msg);
      }
		}
    console.log(code, signal);
  }.bind(this));

	this.workers.push(worker);
};

module.exports = CronConsumer;
