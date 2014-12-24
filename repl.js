/*jslint node: true, esnext: true*/
// xMUD: the REPL
// read, eval, print, loop! read, eval, print...
var REPLManager;

/**
 * prompt a player
 *
 * @param {Player}
 */
function prompt(player) {
    player.socket.write('\n');
    if (!player.data.prompt) {
        return player.question(player.data.hp + '/' + player.data.maxhp + 'HP> ');
    }
    else {
        return player.question(
            player.data.prompt
            .replace('%h', player.data.hp)
            .replace('%H', player.data.maxhp)
            .replace('%l', player.data.level)
            .replace('%x', player.data.xp) + "> ");
    }
}
/**
 * make a new REPLManager.
 * manages the repls
 *
 * @param {PlayerManager} pm - a playermanager
 */

REPLManager = function(pm) {
    pm.on('new', function(player) {
        player.on('begin', function() {
            player.emit('repl');
        });
        player.on('repl', function() {
            prompt(player).then(function(answer) {
                player.socket.write('\nThis REPL is a stub, and cannot handle your command of ' + answer + '.\n');
                player.emit('repl');
            });
        });
    });
};

module.exports = REPLManager;
