-- Copyright (C) 2018 The Mypher Authors
-- SPDX-License-Identifier: LGPL-3.0+

DROP TABLE person;
CREATE TABLE person(
	id VARCHAR(16) PRIMARY KEY,
	name VARCHAR(128),
	profile VARCHAR(1024),
	key CHAR(64),
	tm CHAR(14)
);
CREATE INDEX person_key1 ON person(key);
