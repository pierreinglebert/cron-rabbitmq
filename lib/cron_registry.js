'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var amqp = require('amqplib');
var Bluebird = require('bluebird');

var Cron = require('./cron');

function CronRegistry(url, exchange) {
	this.url = url;
	this.exchange = exchange;
	this.consuming = false;
	this.publishing = false;
  this.channel = null;
  this.crons = {};
}

util.inherits(CronRegistry, EventEmitter);

CronRegistry.prototype.init = function() {
	return amqp.connect(this.url)
	.then(function(conn) {
	  return conn.createChannel();
	}.bind(this))
	.then(function(channel) {
		this.channel = channel;
	  return channel.assertExchange(this.exchange.name, this.exchange.type, this.exchange.options);
	}.bind(this))
	.then(function() {
	  return this.channel.prefetch(1);
	}.bind(this))
	.then(function() {
		return Bluebird.all(
			Object.keys(this.crons).map(function(name) {
				return this.crons[name].init(this.channel);
			}.bind(this))
		);
	}.bind(this));
};

/**
 * name : job name, must be unique
 * file : file exposing a function that will be called
 * options :
 *   timeout :
 *     queue : time job will be waiting for a consumer
 *     process: processing max time
 *   max: maximum concurrent cron
 */
CronRegistry.prototype.register = function(cronOptions) {
	return Bluebird.resolve().then(function () {
		if(this.crons[cronOptions.name]) {
			throw new Error('Cron already registred');
		}
		var cron = new Cron(cronOptions.name, cronOptions.file, cronOptions.time, cronOptions.options);
		this.crons[cron.name] = cron;

	  if(this.channel) {
	    return cron.init(this.channel)
			.then(function() {
				if(this.consuming) {
					return cron.startConsuming();
				}
			}.bind(this))
			.then(function() {
				if(this.publishing) {
					return cron.startPublishing();
				}
			}.bind(this));
	  }
	}.bind(this));
};

CronRegistry.prototype.startConsuming = function () {
	this.consuming = true;
	return Bluebird.all(
		Object.keys(this.crons).map(function(name) {
			return this.crons[name].startConsuming();
		}.bind(this))
	);
};

CronRegistry.prototype.startPublishing = function () {
	this.publishing = true;
	return Bluebird.all(
		Object.keys(this.crons).map(function(name) {
			return this.crons[name].startPublishing();
		}.bind(this))
	);
};

module.exports = CronRegistry;
