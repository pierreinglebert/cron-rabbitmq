'use strict';

var CronConsumer = require('../../lib/cron_consumer');

describe('CronConsumer', function(arguments) {
	describe('constructor', function () {
		CronConsumer;
	});
	function CronConsumer(name, file, options) {
	  this.name = name;
		this.file = file;
	  this.workers = [];

		this.consumerTag = null;

	  options = options || {};
	  this.timeout = options.timeout && options.timeout.process || 60 * 1000;
	}

});
