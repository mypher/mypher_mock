'use_strict'

let sv = require('./sv');
let db = require('./db/db');
let log = require('./cmn/logger')('main');

async function term() {
	await db.term();
	log.info('all connections are successfully terminated.');
	process.exit(0);
}

sv.run();
db.init().then(() => {
}).catch (e => {
	log.error('initializing db failed : ' + e);
	term();
});

process.on('beforeExit', term).on('SIGINT', term);
