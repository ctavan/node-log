var assert = require('assert');
var util = require('util');

var getenv = require('getenv');
var sinon = require('sinon');

// Setting env vars for testing
process.env.LOG_LEVEL = 'debug';
process.env.LOG_STACK = 'true';

var log = require('../log');

// Dummydata
var message = 'Some nice testmessage!';
var data = { additional: 'data', foo: 'bar' };

var tests = {};

tests['log.debug()'] = function() {
  log.debug(message);
  log.debug(message, data);
};

tests['log.info()'] = function() {
  log.info(message);
  log.info(message, data);
};

tests['log.warn()'] = function() {
  log.warn(message);
  log.warn(message, data);
};

tests['log.error()'] = function() {
  log.error(message);
  log.error(message, data);
};

tests['log.fatal()'] = function() {
  log.fatal(message);
  log.fatal(message, data);
};

tests['log.XXX() with error stacks'] = function testErrorStacks() {
  sinon.spy(console, 'error');

  log.error('Error: one: %s two: %s',
            new Error('Error one'), new Error('Error two'));

  var call = console.error.getCall(0);
  var message = util.format.apply(null, call.args);
  assert.ok(message.indexOf('testErrorStacks') !== -1);
  assert.ok(message.indexOf('Error one') !== -1);
  assert.ok(message.indexOf('Error two') !== -1);

  console.error.reset();
};

Object.keys(tests).forEach(function(key) {
  console.log('Test: %s', key);
  tests[key]();
});
