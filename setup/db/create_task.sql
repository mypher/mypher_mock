DROP TABLE task;
DROP TABLE task_state;
CREATE TABLE task(
	groupid CHARACTER(64) NOT NULL,
	ver smallint NOT NULL,
	draftno smallint NOT NULL,
	parentid CHARACTER(64),
	id CHARACTER(64) NOT NULL,
	name VARCHAR(128) NOT NULL,
	description VARCHAR(65535) NOT NULL,
	ruleid CHARACTER(64) NOT NULL,
	rewardid CHARACTER(64),
	rquantity bigint,
	tm CHARACTER(14)
);
CREATE UNIQUE INDEX task_key1 ON task(groupid, ver, draftno, id);
CREATE INDEX task_key2 ON task(groupid, ver, draftno, name);

CREATE TABLE task_state(
	groupid CHARACTER(64) NOT NULL,
	id CHARACTER(64) NOT NULL,
	pic VARCHAR(64),
	pic_approve VARCHAR(1024),
	review VARCHAR(1024),
	tm CHARACTER(14)
);
CREATE UNIQUE INDEX task_state_key1 ON task_state(groupid, id);
