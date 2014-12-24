/*jslint node: true, esnext: true*/
// xMUD: players
// and their manglement
"use strict";
var Player, PlayerManager;
var readline = require('readline');
var ansi = require('ansi');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var P = require('promise'); // ES6's promises are bad

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
        return new P(function(resolve, reject) {
            self.rl.question(question, function(answer) {
                resolve(answer);
            });
        });
    };
    /**
     * ansi helper
     */
    this.ansi = ansi(socket);
    /**
     * player's name
     */
    this.name = null;
    /**
     * destroy this player, and clean the body up
     */
    this.destroy = function() {
        this.emit('quit');
        this.removeAllListeners();
    };
    /**
     * data about this player that we want to save
     */
    this.data = {};
    /**
     * is this player authenticated?
     */
    this.authed = false;
    /**
     * player's host
     */
    this.host = socket.remoteAddress;
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
        process.log.info('lost connection from ' + player.host);
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
module.exports = {PlayerManager: PlayerManager, Player: Player};
