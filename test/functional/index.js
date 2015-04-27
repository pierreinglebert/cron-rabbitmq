'use strict';

var CronRegistry = require('../../lib/cron_registry');

var exchange = {
  name: 'cron',
  type: 'topic',
  options: {
    durable: true
  }
};

var path = require('path');

describe('CronRegistry', function() {
	it('should', function(done) {
		var registry = new CronRegistry('amqp://localhost', exchange);
		registry.init()
		.then(function() {
		  return registry.startConsuming();
		})
		.then(function() {
		  return registry.startPublishing();
		})
		.then(function() {
		  return registry.register({
		    name: 'test',
		    file: path.join(__dirname, '../fixtures/worker.js'),
		    time: '* * * * * *',
		    options: {
		      timeout: {
		        queue: 60 * 1000,
		        process: 2 * 1000
		      },
		      max: 1
		    }
		  });
		})
		.then(function() {
			done();
		});
	});
});
