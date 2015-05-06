'use strict';

var fs = require('fs'),
  StringDecoder = require('string_decoder').StringDecoder;

function createTextReader(file, options, done) {
  var length, encoding, separator;

  length = 4 * 1024;
  encoding = options.encoding || 'utf8';
  separator = (options.separator || '\n');

  fs.open(file, 'r', (err, fd) => {
    var eof, tail, buffer, decoder, lines;

    if (err) {
      done(err);
      return;
    }

    eof = false;
    buffer = new Buffer(length);
    tail = '';
    lines = [];

    decoder = new StringDecoder(encoding);

    done(null, {
      readLine : done => {
        var line;
        if (lines.length > 0) {
          line = lines.shift();
          done(null, line);
        } else if (eof) {
          done(null, null);
        } else {
          (function read() {
            fs.read(fd, buffer, 0, length, null,
              function (err, bytesRead, buffer) {
                var index, position;

                if (bytesRead === 0) {
                  eof = true;
                  done(null, tail);
                } else {
                  tail = tail + decoder.write(buffer.slice(0, bytesRead));
                  index = -1;
                  while (-1 !== (position = tail.indexOf(separator, index))) {
                    lines.push(tail.substring(index, position));
                    index = position + separator.length;
                  }
                  tail = tail.substring(index);
                  if (lines.length === 0) {
                    read();
                  } else {
                    line = lines.shift();
                    done(null, line);
                  }
                }
              });
          }());
        }
      },
      close : done => {
        fs.close(fd, () => {
          if (done) {
            done(err || null);
          }
        });
      }
    });
  });
}

function asyncWhile(context, criteria, iteration, done) {
  criteria.call(context, (err, value) => {
    if (err) {
      done.call(context, err);
    } else {
      if (value === undefined || value === null || value === false) {
        done.call(context, null);
      } else {
        iteration.call(context, value, err => {
          if (err) {
            done.call(context, err);
          } else {
            setImmediate(() => asyncWhile(context, criteria, iteration, done));
          }
        });
      }
    }
  });
}

module.exports = function (file, options, lineCallback, endCallback) {
  if ('function' === typeof options) {
    endCallback = lineCallback;
    lineCallback = options;
    options = { };
  }
  createTextReader(file, options, function (err, reader) {
    if (err) {
      endCallback(err);
    } else {
      asyncWhile(reader, done => this.readLine(done), lineCallback,
        (err) => {
          if (err) {
            endCallback(err);
          } else {
            this.close(endCallback);
          }
        });
    }
  });
};
