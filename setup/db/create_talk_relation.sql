-- Copyright (C) 2018 The Mypher Authors
-- SPDX-License-Identifier: LGPL-3.0+

DROP TABLE talk_relation;
CREATE TABLE talk_relation(
	groupkey CHARACTER(64),
	refer CHARACTER(64),
	current CHARACTER(64)
);
CREATE INDEX talk_relation_key1 ON talk_relation(groupkey);
