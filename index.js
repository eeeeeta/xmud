/*jshint node: true, esnext: true*/
// xMUD
// Created by eeeeeta
//
// the worst JS mud ever
"use strict";
var net = require('net'); // obviously
var readline = require('readline');
var fs = require('fs');
var Q = require('q');
var motd = 'no motd';

console.log('starting xMUD v0.1');
console.log('too lazy to implement config, so i\'ll start the server on port 7000');

var PlayerManager = require('./player.js');
var pm = new PlayerManager();
var LoginManager = require('./login.js');
var lm = new LoginManager(pm);

net.createServer(function(sock) {
    let player = pm.add(sock); // ooh es6, how very exciting
    console.log('connect');
    // how very large and imposing!
    player.socket.write('██╗  ██╗███╗   ███╗██╗   ██╗██████╗\n');
    player.socket.write('╚██╗██╔╝████╗ ████║██║   ██║██╔══██╗\n');
    player.socket.write(' ╚███╔╝ ██╔████╔██║██║   ██║██║  ██║\n');
    player.socket.write(' ██╔██╗ ██║╚██╔╝██║██║   ██║██║  ██║\n');
    player.socket.write('██╔╝ ██╗██║ ╚═╝ ██║╚██████╔╝██████╔╝\n');
    player.socket.write('╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝ \n');
    player.socket.write('\n\neeeeeta\'s strange little mud\n\nconnecting...\n');
    // that's our job done for now, let's pass this tiny little player off elsewhere
    player.emit('login');
}).listen(7000);
