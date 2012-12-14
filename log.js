// Copyright 2011-2012 mbr targeting GmbH. All Rights Reserved.

var os = require('os');
var util = require('util');

var getenv = require('getenv');


var logLevels = ['fatal', 'error', 'warn', 'info', 'debug'];

function findErrors(args) {
  return args.filter(function(arg) {
    return arg instanceof Error;
  });
}

var logStack = getenv.bool('LOG_STACK', true);
function formatErrors(errors) {
  if (!logStack) {
    return '';
  }

  var output = [''];
  errors.forEach(function(error) {
    output.push(error.stack);

    var object = util.inspect(error, true, 3);
    output.push(object);
  });
  return output.join('\n');
}

function forward(target, prefix) {
  return function(format) {
    format = prefix + format;

    var args = Array.prototype.slice.call(arguments);

    var errors = findErrors(args);

    console[target]('%s%s',
        util.format.apply(null, args),
        formatErrors(errors));
  };
}

exports.fatal = forward('error', 'FATAL: ');
exports.error = forward('error', 'ERROR: ');
exports.warn = forward('warn', 'WARN : ');
exports.info = forward('log', 'INFO : ');
exports.debug = forward('log', 'DEBUG: ');

var logLevel = getenv.string('LOG_LEVEL', 'debug');
var index = logLevels.indexOf(logLevel);
if (index === -1) {
  throw new Error('Log.InvalidLogLevel: ' + logLevel + ', set LOG_LEVEL');
}
logLevels.forEach(function(level, cur) {
  if (cur > index) {
    exports[level] = function() {};
  }
});
