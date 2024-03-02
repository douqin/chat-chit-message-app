#!/bin/bash
docker exec mysql-v8-container sh -c 'exec mysqldump -u root -pa dxlampr1_dbappchat' > "$(dirname "$0")/backup.sql"
file_name="backup.log"
echo "Backup completed at $(date)" >> "$(dirname "$0")/$file_name"