/*jslint node: true, esnext: true*/
// xMUD: login
// and its various obnoxious qualities

var LoginManager;

/**
 * make a new login manager!
 * this handles - you guessed it - logins.
 * this object doesn't do much in the way of methods yet
 * 
 * @param {object} pm - a PlayerManager, for various nefarious purposes
 */
LoginManager = function(PlayerManager) {
    PlayerManager.on('new', function(player) {
        // fresh bait!
        // required help for people reading the code to learn:
        // this place is where we define all the listeners for the new player
        player.on('login', function() {
            player.question('What name do you go by in the realm of xMUD? ').then(function(answer) {
                player.socket.write('Aah, ' + answer + ', a nice name.\n');
                player.socket.end();
            });
        });
    });
};
module.exports = LoginManager;
