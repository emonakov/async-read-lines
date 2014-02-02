(function () {
    'use strict';

    /*global require, describe, it, expect, __dirname, __filename */

    var asyncReadLines = require('./..'),
        fs = require('fs');

    describe('library', function () {
        it('reads non-existing file', function (done) {
            asyncReadLines(__dirname + '/files/ghost.txt',
                function (line, callback) {
                    expect(false).toBe(true);
                    callback();
                }, function (err) {
                    expect(err).not.toBe(null);
                    if (null !== err) {
                        expect(err.errno).toBe(34);
                        expect(err.code).toBe('ENOENT');
                    }
                    done();
                });
        });

        it('reads empty file', function (done) {
            var count = 0;

            asyncReadLines(__dirname + '/files/empty.txt',
                function (line, callback) {
                    expect(line).toBe('');
                    count += 1;
                    callback();
                }, function (err) {
                    expect(err).toBe(null);
                    expect(count).toBe(1);
                    done();
                });
        });

        it('reads newline file', function (done) {
            var count = 0;

            asyncReadLines(__dirname + '/files/newline.txt',
                function (line, callback) {
                    expect(line).toBe('');
                    count += 1;
                    callback();
                }, function (err) {
                    expect(err).toBe(null);
                    expect(count).toBe(2);
                    done();
                });
        });

        it('reads this file', function (done) {
            var actual, expected;

            expected = fs.readFileSync(__filename, 'utf8').trim()
                .replace(/\r?\n/g, '\n');

            actual = '';
            asyncReadLines(__filename,
                function (line, callback) {
                    actual += line + '\n';
                    callback();
                }, function (err) {
                    expect(err).toBe(null);

                    actual = actual.trim().replace(/\r?\n/g, '\n');

                    expect(actual).toBe(expected);

                    done();
                });
        });
    });
}());
