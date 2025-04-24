#!/bin/bash

# This script will automatically create a test db
# (for tests, ofc) when postgres is initialized

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE "$POSTGRES_TEST_DB";
	GRANT ALL PRIVILEGES ON DATABASE "$POSTGRES_TEST_DB" TO "$POSTGRES_USER";
EOSQL
