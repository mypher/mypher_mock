DROP TABLE rule;
CREATE TABLE rule(
	groupid CHARACTER(64) NOT NULL,
	id CHARACTER(64) PRIMARY KEY,
	name VARCHAR(64) NOT NULL,
	req SMALLINT NOT NULL,
	auth VARCHAR(1024),
	tm CHARACTER(14)
);
CREATE INDEX ruke_key1 ON rule(groupid);
CREATE INDEX ruke_key2 ON rule(groupid, id);

