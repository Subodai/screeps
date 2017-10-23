if (!GLOBALS_LOADED) {
    global.GLOBALS_LOADED = true;
    console.log('[LOADER] Reloading globals');
}
require('game.constants'); // Game consts
require('global.stuff');   // Settings and stuff
require('global.colours'); // Colours various variables
require('global.speech');  // Colours various variables
require('global.friends'); // The global friend list
