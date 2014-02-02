(function () {
    'use strict';

    /*global require, module, Buffer */

    var async = require('async'),
        fs = require('fs');

    module.exports = function (file, options, lineCallback, endCallback) {
        var length, encoding, lineTerminator;

        if ('function' === typeof options) {
            endCallback = lineCallback;
            lineCallback = options;
            options = { };
        }

        length = 4 * 1024;
        encoding = options.encoding || 'utf8';
        lineTerminator = (options.lineTerminator || '\n').charCodeAt(0);

        fs.open(file, 'r', function (err, fd) {
            var eof, tail, buffer;

            if (err) {
                endCallback(err);
                return;
            }

            eof = false;
            buffer = new Buffer(length);
            tail = null;
            async.whilst(function () { return !eof; }, function (callback) {
                fs.read(fd, buffer, 0, length, null,
                    function (err, bytesRead, buffer) {
                        var idx, offset, byte, lines, line;

                        if (err) {
                            callback(err);
                            return;
                        }

                        if (0 === bytesRead) {
                            eof = true;
                            line = null === tail ? '' : tail.toString(encoding);
                            lineCallback(line, callback);
                            return;
                        }

                        lines = [ ];
                        offset = 0;

                        for (idx = 0; idx < bytesRead; idx += 1) {
                            byte = buffer.readUInt8(idx);

                            if (lineTerminator !== byte) {
                                continue;
                            }

                            if (null === tail) {
                                lines.push(buffer.toString(encoding,
                                    offset, idx));
                            } else {
                                lines.push(Buffer.concat([
                                    tail,
                                    buffer.slice(offset, idx)
                                ]).toString(encoding));
                                tail = null;
                            }
                            offset = idx + 1;
                        }

                        if (offset !== bytesRead) {
                            if (null === tail) {
                                tail = new Buffer(bytesRead - offset);
                                buffer.copy(tail, 0, offset, bytesRead);
                            } else {
                                tail = Buffer.concat([ tail,
                                    buffer.slice(offset, bytesRead) ]);
                            }
                        }

                        async.forEach(lines, lineCallback, callback);
                    });
            }, function (err) {
                fs.close(fd, function () {
                    endCallback(err || null);
                });
            });
        });
    };
}());
