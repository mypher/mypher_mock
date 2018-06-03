DROP TABLE talk_relation;
CREATE TABLE talk_relation(
	groupkey CHARACTER(64),
	refer CHARACTER(64),
	current CHARACTER(64)
);
CREATE INDEX talk_relation_key1 ON talk_relation(groupkey);
