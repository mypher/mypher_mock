-- Copyright (C) 2018 The Mypher Authors
-- SPDX-License-Identifier: LGPL-3.0+

DROP TABLE rule;
CREATE TABLE rule(
	groupid CHARACTER(64) NOT NULL,
	ver smallint NOT NULL,
	draftno smallint NOT NULL,
	id CHARACTER(64) NOT NULL,
	name VARCHAR(64) NOT NULL,
	req SMALLINT NOT NULL,
	auth VARCHAR(1024),
	tm CHARACTER(14)
);
CREATE UNIQUE INDEX ruke_key1 ON rule(groupid, ver, draftno, id);

