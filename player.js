/*jslint node: true, esnext: true*/
// xMUD: players
// and their manglement
"use strict";
var Player, PlayerManager;
var readline = require('readline');
var ansi = require('ansi');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Q = require('q');

/**
 * create a new player manager
 *
 * @constructor
 */
PlayerManager = function() {
    this.players = [];
};
/**
 * create a new player. they don't have to be authenticated just yet
 *
 * @constructor
 * @param {object} socket - their socket, for sending stuff to them
 */
Player = function(socket) {
    let self = this;
    /**
     * the player's readline interface
     */
    this.rl = readline.createInterface({
        input: socket,
        output: socket
    });
    /**
     * the player's socket
     */
    this.socket = socket;
    /**
     * promise wrapper around readline.question()
     *
     * @param {string} question - what you want to prompt the player with
     * @returns {Promise<response>} resolves with the user's response
     */
    this.question = function(question) {
        let promise = Q.defer(); // ooh, promises and es6 together, such new things
        self.rl.question(question, function(answer) {
            promise.resolve(answer);
        });
        return promise.promise; // yay logic
    };
    /**
     * ansi helper
     */
    this.ansi = ansi(socket);
    /**
     * player's name
     * null if not logged in
     */
    this.name = null;
    /**
     * destroy this player, and clean the body up
     */
    this.destroy = function() {
        this.emit('quit');
        this.removeAllListeners();
    };
    return this;
};
util.inherits(Player, EventEmitter);
util.inherits(PlayerManager, EventEmitter);
/**
 * add a player, no auth required yet
 *
 * @param {object} socket - their socket
 * @fires new
 * @returns {Player}
 */
PlayerManager.prototype.add = function(socket) {
    let self = this;
    let player = new Player(socket);
    this.players.push(player);
    socket.on('end', function disconnectPlayer() {
        console.log('disconnect');
        /**
         * emitted when a player disconnects.
         * note: the player will remove all its listeners for you, so don't
         * do that yourself
         *
         * @event quit
         * @param {object} player - player
         */
        self.emit('quit', player);
        player.destroy();
        self.players.splice(self.players.indexOf(player), 1);
    });
    /**
     * emitted when a new player happens
     *
     * @event new
     * @param {object} player - player
     */
    this.emit('new', player);
    return player;
};
module.exports = PlayerManager;
