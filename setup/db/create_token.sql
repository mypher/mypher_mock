-- Copyright (C) 2018 The Mypher Authors
-- SPDX-License-Identifier: LGPL-3.0+

DROP TABLE token;
CREATE TABLE token(
	groupid CHARACTER(64) NOT NULL,
	ver smallint NOT NULL,
	draftno smallint NOT NULL,
	id CHARACTER(64) NOT NULL,
	name VARCHAR(128) NOT NULL,
	type SMALLINT NOT NULL,
	firetype SMALLINT,
	taskid CHARACTER(64),
	tokenid CHARACTER(64),
	noftoken BIGINT,
	rewardtype SMALLINT,
	rcalctype SMALLINT,
	rquantity BIGINT,
	tm CHARACTER(14)
);
CREATE UNIQUE INDEX token_key1 ON token(groupid, ver, draftno, id);
CREATE INDEX token_key2 ON token(groupid, ver, draftno, name);

