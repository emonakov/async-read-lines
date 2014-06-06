async-read-lines
================

Library for asynchronous line-by-line reading from big text files. Ideal for
iterating over the log file entries.

Installation
------------

    npm install async-read-lines

Example
-------

How to count entries in the server access log file:

    var asyncReadLines = require('async-read-lines');

    var count = 0;

    asyncReadLines('access.log', function (line, callback) {
        count += 1;

        callback();
    }, function (err) {
        console.log(count);
    });

Method
------

Complete signature of the method:

    asyncReadLines(file, [options], lineCallback, doneCallback)

    options := { }
        encoding - 'utf8' (default) or 'ascii',
        lineTerminator - any character represented by single byte in specified
                         encoding, default is '\n'
    lineCallback := function (line, callback) { ... }
    doneCallback := function (err) { ... }

Details
-------

The library reads file chunks one by one and saves them into the buffer. When
the line terminator is detected in the buffer, the content of the buffer is
decoded and the line callback is called. Reading is continued when the callback
resumes reading by calling supplied callback.

This approach allows to control reading process, which is necessary while
reading very big files and execute asynchronous tasks for every line.

The method is safe for the Unicode sequences as the buffer is binary and line is
decoded before calling the callback.

For empty file the method calls lineCallback once with empty string.
