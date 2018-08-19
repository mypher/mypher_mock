-- Copyright (C) 2018 The Mypher Authors
-- SPDX-License-Identifier: LGPL-3.0+

DROP TABLE talk_detail;
CREATE TABLE talk_detail(
	key CHARACTER(64),
	ver SMALLINT,
	personid VARCHAR(32),
	tm CHARACTER(14),
	data TEXT
);
CREATE UNIQUE INDEX talk_detail_key1 ON talk_detail(key, ver);

