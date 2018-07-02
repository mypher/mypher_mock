DROP TABLE cipher;
CREATE TABLE cipher(
	id CHARACTER(64) NOT NULL,
	ver smallint NOT NULL,
	draftno smallint NOT NULL,
	name VARCHAR(64) NOT NULL,
	purpose VARCHAR(65535),
	drule_req SMALLINT NOT NULL,
	drule_auth VARCHAR(1024) NOT NULL,
	approved VARCHAR(1024),
	editor VARCHAR(1024) NOT NULL,
	formal boolean default false,
	tm CHARACTER(14)
);
CREATE UNIQUE INDEX cipher_key1 ON cipher(id, ver, draftno);
