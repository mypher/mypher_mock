-- Copyright (C) 2018 The Mypher Authors
-- SPDX-License-Identifier: LGPL-3.0+

DROP VIEW cipher_current;
CREATE VIEW cipher_current AS
	 select id, ver, draftno, formal, name, purpose from 
		(select id, ver, draftno, formal, name, purpose,
				rank() over (partition by id order by formal desc, ver desc) rank1 
	  from cipher) as cc 
	 where rank1=1;
