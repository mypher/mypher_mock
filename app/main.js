// Copyright (C) 2018 The Mypher Authors
//
// SPDX-License-Identifier: LGPL-3.0+
//

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

process.on('beforeExit', term).on('SIGINT', term);
