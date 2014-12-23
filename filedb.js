/*jslint node: true, esnext: true*/
// xMUD: a simple database
// made of flatfiles
"use strict";

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
var FileDB = function(path) {
    this.path = path + '/';
    fs.stat(path, function(err, stat) {
        if (err) throw err;
        if (!stat.isDirectory()) throw new Error("the file database needs a directory to work in");
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
    let result = false;
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
FileDB.prototype._writeObject = function(file, obj) {
    let promise = Q.defer();
    let self = this;
    fs.exists(this.path + file, function(exists) {
        if (exists) {
            promise.reject(new Error('That already exists!'));
        }
        else {
            fs.writeFile(self.path + file, JSON.stringify(obj), {encoding: 'utf8'}, function(err) {
                if (err) {
                    promise.reject(err);
                }
                else {
                    promise.resolve();
                }
            });
        }
    });
    return promise.promise;
};

/**
 * make a pfile (player file)
 *
 * @param {object} pfile - stuff you want to put in there
 * @returns {Promise<name, error>} - resolves with an id for getting the thing out of the db, rejects with an error
 */
FileDB.prototype.mkpfile = function(pfi) {
    let promise = Q.defer();
    if (!pfi) {
        promise.reject(new Error('A data object is required.'));
        return promise.promise;
    }
    if (!pfi.name) {
        promise.reject(new Error('pfile.name must be defined'));
        return promise.promise;
    }
    /**
     * the pfile format
     *
     * @namespace pfile
     */
    let pfile = {
        /**
         * player's name
         * 
         * @memberof pfile
         */
        name: pfi.name || null,
        /**
         * player's hashed password
         *
         * @memberof pfile
         */
        hash: pfi.hash || null
    };
    this._writeObject(pfile.name + '.json', pfile).then(function() {
        promise.resolve(pfile.name);
    }).catch(function(err) {
        promise.reject(err);
    });
    return promise.promise;
};
/**
 * get a pfile (player file)
 *
 * @param {string} id - the id the db gave you earlier
 * @returns {Promise<pfile, error>} - resolves with the pfile, rejects with an error
 */
FileDB.prototype.getpfile = function(id) {
    let promise = Q.defer();
    this._readObject(id + '.json').then(function(data) {
        promise.resolve(data);
    }).catch(function(err) {
        promise.reject(err);
    });
    return promise.promise;
};
/**
 * update a pfile with some new data.
 * does not replace the old one, just updates.
 * to delete something, set it to null.
 *
 * @param {string} id - the id the db gave you earlier
 * @param {object} obj - the object to update with
 */
FileDB.prototype.updatepfile = function(id, obj) {
    let promise = Q.defer();
    let self = this;
    this.readObject(id + '.json').then(function(data) {
        Object.keys(obj).forEach(function(key) {
            let val = obj[key];
            if (val === null) {
                delete data[key];
            }
            else {
                data[key] = val;
            }
        });
        return self._writeObject(id + '.json', data);
    }).then(function() {
        promise.resolve();
    }).catch(function(err) {
        promise.reject(err);
    });
    return promise.promise;
};
module.exports = FileDB;
