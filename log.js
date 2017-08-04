// Copyright 2011-2012 mbr targeting GmbH. All Rights Reserved.

const util = require('util');

const getenv = require('getenv');

const logLevels = ['fatal', 'error', 'warn', 'info', 'debug'];

function findErrors(args) {
  return args.filter((arg) => arg instanceof Error);
}

const logStack = getenv.bool('LOG_STACK', true);
function formatErrors(errors) {
  if (!logStack) {
    return '';
  }

  const output = [''];
  errors.forEach((error) => {
    output.push(error.stack);

    const object = util.inspect(error, true, 3);
    output.push(object);
  });
  return output.join('\n');
}

function forward(target, prefix) {
  return (format, ...args) => {
    const errors = findErrors(args);

    console[target]('%s%s',
                    util.format(prefix + format, ...args),
                    formatErrors(errors));
  };
}

exports.fatal = forward('error', 'FATAL: ');
exports.error = forward('error', 'ERROR: ');
exports.warn = forward('warn', 'WARN : ');
exports.info = forward('log', 'INFO : ');
exports.debug = forward('log', 'DEBUG: ');

const logLevel = getenv.string('LOG_LEVEL', 'debug');
const index = logLevels.indexOf(logLevel);
if (index === -1) {
  throw new Error('Log.InvalidLogLevel: ' + logLevel + ', set LOG_LEVEL');
}
logLevels.forEach(function(level, cur) {
  if (cur > index) {
    exports[level] = function() {};
  }
});
