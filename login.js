/*jslint node: true, esnext: true*/
// xMUD: login
// and its various obnoxious qualities
"use strict";

var LoginManager;
var fs = require('fs');
var P = require('promise');
var bcrypt = require('bcryptjs');
var util = require('util');

// promise bindings for fs

var read = P.denodeify(fs.readFile);
var write = P.denodeify(fs.writeFile);
var hash = P.denodeify(bcrypt.hash);
var compare = P.denodeify(bcrypt.compare);

// errors

var PlayerError = function() {};
util.inherits(PlayerError, Error);

var Ignore = function() {};
/**
 * make a new login manager!
 * this handles - you guessed it - logins.
 * this object doesn't do much in the way of methods yet
 * 
 * @param {PlayerManager} pm - a PlayerManager, for various nefarious purposes
 */
LoginManager = function(PlayerManager) {
    PlayerManager.on('new', function(player) {
        // fresh bait!
        // required help for people reading the code to learn:
        // this place is where we define all the listeners for the new player
        player.on('login', function loginPlayer() {
            player.question('What name do you go by in the realm of xMUD? ').then(function(answer) {
                player.socket.write('Aah, ' + answer + ', a nice name. Let me do a few checks...\n');
                if (answer.match(/^[a-z]+$/i) === null) {
                    player.socket.write('Hang on, that doesn\'t look like a name to me!\n');
                    player.socket.end();
                    throw new PlayerError('Please input a valid name.');
                }
                else if (answer.length > 15 || answer.length < 5) {
                    player.socket.write('Names must be between 5 and 15 characters long.\n');
                    player.socket.end();
                    throw new PlayerError('Please input a valid name.');
                }
                else {
                    player.name = answer;
                    return new P(function(resolve, reject) {
                        fs.readFile(__dirname + '/pfiles/' + answer.toLowerCase() + '.json', {encoding: 'utf8'}, function(err, data) {
                            if (err) {
                                if (err.code == 'ENOENT') {
                                    return resolve(err.code);
                                }
                                else {
                                    return reject(err);
                                }
                            }
                            else {
                                return resolve(data);
                            }
                        });
                    });
                }
            }).then(function(data) {
                if (data == 'ENOENT') {
                    // sign the player up
                    player.emit('signup');
                    throw new Ignore();
                }
                else {
                    console.log('login');
                    player.data = JSON.parse(data);
                    return player.question('Welcome back, ' + player.name + '. What is your password? ');
                }
            }).then(function(pw) {
                player.socket.write('Checking password...\n');
                return compare(pw, player.data.hash);
            }).then(function(auth) {
                if (!auth) {
                    process.log.warn('incorrect password provided for ' + player.name + ' from ' + player.host);
                    player.socket.write('\nIncorrect password!\n');
                    player.socket.end();
                    throw new PlayerError('Incorrect password provided.');
                }
                else {
                    player.socket.write('\nCorrect. Welcome back!');
                    process.log.info(player.name + ' logged in', {host: player.host});
                    player.emit('begin');
                }
            }, function(thrown) {
                if (thrown instanceof PlayerError) {
                    player.socket.end();
                }
                else if (thrown instanceof Ignore) {
                    return;
                }
                else {
                    process.log.error('error in login! ' + thrown.message, {stack: thrown.stack, host: player.host, name: player.name});
                    player.socket.write('\n\nAn unexpected error occurred. Please try again later.\n');
                    player.socket.end();
                }
            });
        });
        player.on('signup', function signupPlayer() {
            player.socket.write('That player doesn\'t seem to exist.\n');
            player.question('Would you like to create it? [y/n] ').then(function(answer) {
                if (answer.toLowerCase().indexOf('y') == -1) {
                    throw new Error('Player creation canceled');
                }
                else {
                    process.log.info('starting signup for ' + player.name + '.', {host: player.host});
                    player.socket.write('Excellent, I\'ll create a file for ' + player.name + '.\n');
                    player.socket.write('\n\nPlease enter a password. Note that this password will be ');
                    player.socket.write('INSECURELY transmitted over the internet in an UNENCRYPTED form, so pick something unique');
                    player.socket.write(' that you don\'t care about.\n');
                    return player.question('What would you like your new password to be? ');
                }
            }).then(function hashPW(answer) {
                player.socket.write('[Securely hashing password. This protects against your password being ');
                player.socket.write('compromised if our servers are hacked, but keep in mind you just sent ');
                player.socket.write('your password unencrypted over the net.]\n');
                return hash(answer, 12);
            }).then(function writePW(hash) {
                player.data.hash = hash;
                player.data.hp = 0;
                player.data.xp = 0;
                player.data.maxhp = 0;
                player.data.level = 0;
                return write(__dirname + '/pfiles/' + player.name.toLowerCase() + '.json', JSON.stringify(player.data));
            }).then(function() {
                player.socket.write('\nPlayer creation successful! Welcome to the realm of xMUD!');
                player.emit('begin');
            }, function(error) {
                process.log.error('error in signup! ' + error.message, {stack: error.stack, host: player.host, name: player.name});
                player.socket.write('An error occurred: ' + error.message + '.\n');
                player.socket.end();
            });
        });
    });
};
module.exports = LoginManager;
