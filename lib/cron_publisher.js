'use strict';

var Bluebird = require('bluebird');
var CronJob = require('cron').CronJob;

function CronPublisher(name, time, options) {
  this.name = name;
  this.time = time;
	this.workers = [];

	this.state = 'stopped';
	this.consumerTag = null;

  options = options || {};
}

/**
 * Returns Promise
 */
CronPublisher.prototype.publish = function (channel, msg) {
	return channel.sendToQueue(this.name, new Buffer(msg || ''));
};

CronPublisher.prototype.start = function(channel) {
  return Bluebird.resolve()
  .then(function() {
    if(this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.cronJob = new CronJob(this.time, function() {
    	this.publish(channel);
  	}.bind(this), true, false);

    this.cronJob.start();
  }.bind(this));
};

CronPublisher.prototype.stop = function() {
  return Bluebird.resolve()
  .then(function() {
    this.cronJob.stop();
  }.bind(this));
};

module.exports = CronPublisher;
