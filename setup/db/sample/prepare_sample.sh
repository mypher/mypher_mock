#!/bin/bash

psql -U mypher -f person.sql
psql -U mypher -f talk.sql
