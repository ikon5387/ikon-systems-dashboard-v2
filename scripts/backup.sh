#!/bin/bash

# Ikon Systems Dashboard - Database Backup Script
set -e

echo "🔄 Starting database backup..."

# Configuration from environment variables
SUPABASE_URL="${VITE_SUPABASE_URL:-https://drmloijaajtzkvdclwmf.supabase.co}"
POSTGRES_HOST="${POSTGRES_HOST:-db.drmloijaajtzkvdclwmf.supabase.co}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"

# Backup configuration
BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="ikon_systems_backup_${DATE}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating backup: $BACKUP_FILE"

if [ -n "$POSTGRES_PASSWORD" ]; then
    PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
        -h $POSTGRES_HOST \
        -U $POSTGRES_USER \
        -d $POSTGRES_DB \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        > $BACKUP_PATH
else
    echo "Warning: POSTGRES_PASSWORD not set, backup may fail"
    pg_dump \
        -h $POSTGRES_HOST \
        -U $POSTGRES_USER \
        -d $POSTGRES_DB \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        > $BACKUP_PATH
fi

# Compress backup
gzip $BACKUP_PATH

echo "✅ Backup completed: ${BACKUP_FILE}.gz"

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "ikon_systems_backup_*.sql.gz" -mtime +7 -delete

echo "🧹 Old backups cleaned up"

# Log backup size
BACKUP_SIZE=$(du -h "${BACKUP_PATH}.gz" | cut -f1)
echo "📊 Backup size: $BACKUP_SIZE"

echo "🎉 Backup process completed successfully!"
