'use strict';

var Consumer = require('./cron_consumer');
var Publisher = require('./cron_publisher');

function Cron(name, file, time, options) {
	this.name = name;
	this.file = file;
	this.channel = null;
	this.time = time;
	this.options = options;

	this.connected = false;

	this.consumer = new Consumer(name, file, options);
	this.publisher = new Publisher(name, time, options);
}

Cron.prototype.init = function(channel) {
	this.channel = channel;
	var options = this.options;
	return this.channel.assertQueue(this.name, {
    durable: false,
		autoDelete: true,
    messageTtl: options.timeout && options.timeout.queue,
    maxLength: options.max
  })
	.then(function(res) {
		this.connected = true;
	}.bind(this));
};

Cron.prototype.startConsuming = function() {
	return this.consumer.start(this.channel);
};

Cron.prototype.stopConsuming = function() {
	return this.consumer.stop(this.channel);
};

Cron.prototype.startPublishing = function() {
	return this.publisher.start(this.channel);
};

Cron.prototype.stopPublishing = function() {
	return this.publisher.stop(this.channel);
};

module.exports = Cron;
