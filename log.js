// Copyright 2011-2012 mbr targeting GmbH. All Rights Reserved.

const util = require('util');

const getenv = require('getenv');
const isError = require('lodash.iserror');
const isString = require('lodash.isstring');

const logLevels = ['fatal', 'error', 'warn', 'info', 'debug'];

const logStack = getenv.bool('LOG_STACK', true);
function forward(target, prefix) {
  return (format, ...args_) => {
    const placeholders = isString(format) ?
      (format.match(/%[sdifjoO%]/g) || [])
        .filter((placeholder) => placeholder !== '%%')
        .length :
      0;
    const args = args_.slice(0, placeholders);

    const errors = (logStack ? args_ : [])
      .filter(isError)
      .map((error) => util.inspect(error, false, 3));

    console[target]('%s', util.format(prefix + format, ...args) +
                          ['', ...errors].join('\n'));
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
