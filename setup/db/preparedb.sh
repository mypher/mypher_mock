#!/bin/bash

psql -U mypher -f create_person.sql
psql -U mypher -f create_talk_detail.sql
psql -U mypher -f create_talk_relation.sql
psql -U mypher -f create_rule.sql
psql -U mypher -f create_task.sql
psql -U mypher -f create_token.sql
psql -U mypher -f create_cipher.sql
