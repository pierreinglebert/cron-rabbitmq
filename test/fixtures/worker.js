'use strict';

process.on('message', function(m) {
  console.log('CHILD got message:', m);

  process.on('disconnect', function() {
    console.log('disconnect');
  });

  setTimeout(function() {
    console.log('not called');
  }, 4000);

	//process.exit(0);
});

process.send({ foo: 'bar' });

console.log('prout');
