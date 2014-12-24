/*jshint node: true, esnext: true*/
// xMUD
// Created by eeeeeta
//
// the worst JS mud ever
"use strict";
var net = require('net'); // obviously
var readline = require('readline');
var fs = require('fs');
var winston = require('winston');
var motd = 'no motd';

// warning: horrible sin ahead
process.log = new winston.Logger({
    transports: [
        new winston.transports.Console()
    ]
}); // :O
// told you this was the worst ;)

process.log.info('starting xMUD v0.1');
process.log.info('too lazy to implement config, so i\'ll start the server on port 7000');

var PlayerManager = require('./player.js');
var pm = new PlayerManager();
var LoginManager = require('./login.js');
var lm = new LoginManager(pm);

net.createServer(function(sock) {
    let player = pm.add(sock); // ooh es6, how very exciting
    process.log.info('new connection from ' + sock.remoteAddress);
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
