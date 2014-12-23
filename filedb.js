/*jslint node: true, esnext: true*/
// xMUD: a simple database
// made of flatfiles

var FileDB;
var fs = require('fs');
var Q = require('q');

/**
 * make a new flat-file based database
 *
 * @constructor
 * @param {string} path - where to store all the files in
 * @throws you'll get an error if you didn't provide it with a directory
 * @throws you'll get an error if the fs library throws one
 */
FileDB = function(path) {
    fs.stat(path, function(err, stat) {
        if (err) throw err;
        if (!stat.isDirectory()) throw new Error("the file database needs a directory to work in");
        this.path = path;
    });
};

/**
 * read an object from a json file
 *
 * @param {string} file - name of the file
 * @returns {Promise<object, error>} - resolves with the JSON object, rejects with an error
 */
FileDB.prototype._readObject = function(file) {
    let promise = Q.defer();
    let result;
    fs.readFile(this.path + file, {encoding: 'utf8'}, function(err, file) {
        if (err) {
            promise.reject(err);
        }
        else {
            try {
                result = JSON.parse(file);
                promise.resolve(result);
            }
            catch (e) {
                promise.reject(e);
            }
        }
    });
    return promise.promise;
};
/**
 * write an object to a json file
 *
 * @param {string} file - name of the file
 * @param {object} obj - object to write
 * @returns {Promise<undefined, error>} - resolves with nothing, rejects with an error
 */
FileDB.prototype._writeObject = function(file) {
    let promise = Q.defer();
    fs.writeFile(this.path + file, JSON.stringify(obj), {encoding: 'utf8'}, function(err) {
        if (err) {
            promise.reject(err);
        }
        else {
            promise.resolve();
        }
    });
    return promise.promise;
};
module.exports = FileDB;
