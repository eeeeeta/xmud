var FileDB = require(__dirname + '/../filedb.js');
var fdb = new FileDB(__dirname + '/fdb');
var fs = require('fs');
describe('FileDB', function() {
    it('should write an object correctly with _writeObject', function(done) {
        fdb._writeObject('test.json', {a: 1}).then(function() {
            fs.readFile(__dirname + '/fdb/test.json', {encoding: 'utf8'}, function(err, data) {
                if (err) {
                    throw err;
                };
                if (JSON.parse(data).a == 1) {
                    done();
                }
                else {
                    done(new Error('data failed to verify'));
                };
            });
        }).catch(function(err) {
            throw err;
        });
    });
    it('should read an object correctly with _readObject', function(done) {
        fdb._readObject('test.json').then(function(data) {
            if (data.a == 1) {
                done();
            }
            else {
                done(new Error('data failed to verify'));
            }
        });
    });
    it('should make a pfile correctly', function(done) {
        fdb.mkpfile({name: 'testname'}).then(function(id) {
            fdb._readObject(id + '.json').then(function(data) {
                if (data.name == 'testname') {
                    done();
                }
                else {
                    done(new Error('data failed to verify'));
                }
            }).catch(function(error) {
                throw error;
            });
        });
    });
});
