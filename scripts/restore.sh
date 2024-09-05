#!/bin/bash

if [ $# -eq 0 ]; then
  echo "Usage: $0 <backup_filepath>"
  exit 1
fi

backup_filepath="$1"

if [ ! -f "$backup_filepath" ]; then
  echo "Error: Backup file '$backup_filepath' not found."
  exit 1
fi

docker exec -i lexical_test psql -U admin -d payload < "$backup_filepath"
