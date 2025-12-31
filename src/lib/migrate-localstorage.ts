/**
 * Migration script to transfer existing localStorage data to Supabase
 * 
 * This script should be run once to migrate existing user data from localStorage to Supabase.
 * It can be called from the browser console or integrated into the app's initialization.
 * 
 * Usage:
 * 1. Open browser console
 * 2. Import and run: migrateLocalStorageToSupabase()
 * 
 * Note: This script assumes Supabase is already set up and the user is authenticated.
 */

import { db } from './database';
import { createDocument } from './documents';
import { createPoll } from './polls';
import { createAgendaItem } from './agenda';
import { convertBase64ToFileAndUpload } from './documents';
import { logHistory } from './history';

interface MigrationStats {
  users: number;
  documents: number;
  polls: number;
  agendaItems: number;
  historyItems: number;
  errors: string[];
}

/**
 * Migrate all localStorage data to Supabase
 */
export const migrateLocalStorageToSupabase = async (): Promise<MigrationStats> => {
  const stats: MigrationStats = {
    users: 0,
    documents: 0,
    polls: 0,
    agendaItems: 0,
    historyItems: 0,
    errors: [],
  };

  try {
    console.log('Starting migration from localStorage to Supabase...');

    // Migrate users (if any in localStorage)
    try {
      const membersData = localStorage.getItem('bamas_members');
      if (membersData) {
        const members = JSON.parse(membersData);
        for (const member of members) {
          try {
            // Check if user already exists
            const existing = await db.fetchById('users', member.id).catch(() => null);
            if (!existing) {
              await db.insert('users', {
                id: member.id,
                name: member.name,
                email: member.email,
                image: member.image || null,
                provider: member.provider || null,
                bio: member.bio || null,
                hashtags: member.hashtags || null,
                location: member.location || null,
                website: member.website || null,
                phone: member.phone || null,
                role: member.role || 'member',
                status: member.status || 'pending',
                approved_at: member.approvedAt || null,
                approved_by: member.approvedBy || null,
              });
              stats.users++;
            }
          } catch (error: any) {
            stats.errors.push(`Error migrating user ${member.id}: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      stats.errors.push(`Error migrating users: ${error.message}`);
    }

    // Migrate documents
    try {
      const documentsData = localStorage.getItem('bamas_documents');
      if (documentsData) {
        const documents = JSON.parse(documentsData);
        for (const doc of documents) {
          try {
            // Check if document already exists
            const existing = await db.fetchById('documents', doc.id).catch(() => null);
            if (!existing) {
              let filePath: string | undefined = undefined;
              
              // If document has base64 file data, upload to Storage
              if (doc.fileData && doc.type === 'uploaded' && doc.createdBy) {
                try {
                  const uploadResult = await convertBase64ToFileAndUpload(
                    doc.fileData,
                    doc.fileName || 'file',
                    doc.mimeType || 'application/octet-stream',
                    doc.createdBy
                  );
                  filePath = uploadResult.path;
                } catch (uploadError) {
                  console.warn(`Failed to upload file for document ${doc.id}:`, uploadError);
                  // Continue without file path
                }
              }

              await createDocument({
                title: doc.title,
                description: doc.description || undefined,
                type: doc.type,
                google_drive_link: doc.googleDriveLink || undefined,
                content: doc.content || undefined,
                table_data: doc.tableData || undefined,
                file_path: filePath,
                file_name: doc.fileName || undefined,
                file_size: doc.fileSize || undefined,
                mime_type: doc.mimeType || undefined,
                category: doc.category || 'General',
                created_by: doc.createdBy,
                created_by_name: doc.createdByName || 'Unknown User',
                created_by_image: doc.createdByImage,
              });
              stats.documents++;
            }
          } catch (error: any) {
            stats.errors.push(`Error migrating document ${doc.id}: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      stats.errors.push(`Error migrating documents: ${error.message}`);
    }

    // Migrate polls
    try {
      const pollsData = localStorage.getItem('bamas_polls');
      if (pollsData) {
        const polls = JSON.parse(pollsData);
        for (const poll of polls) {
          try {
            // Check if poll already exists
            const existing = await db.fetchById('polls', poll.id).catch(() => null);
            if (!existing && poll.options && poll.options.length > 0) {
              const options = poll.options.map((opt: any) => opt.text);
              await createPoll(
                {
                  title: poll.title,
                  description: poll.description || undefined,
                  type: poll.type,
                  end_date: poll.endDate || undefined,
                  created_by: poll.createdBy,
                  created_by_name: poll.createdByName || 'Unknown User',
                  created_by_image: poll.createdByImage,
                },
                options
              );
              stats.polls++;
            }
          } catch (error: any) {
            stats.errors.push(`Error migrating poll ${poll.id}: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      stats.errors.push(`Error migrating polls: ${error.message}`);
    }

    // Migrate agenda items
    try {
      const agendaData = localStorage.getItem('bamas_agenda_items');
      if (agendaData) {
        const agendaItems = JSON.parse(agendaData);
        for (const item of agendaItems) {
          try {
            // Check if agenda item already exists
            const existing = await db.fetchById('agenda_items', item.id).catch(() => null);
            if (!existing) {
              await createAgendaItem({
                title: item.title,
                description: item.description,
                date: item.date,
                time: item.time,
                location: item.location || undefined,
                created_by: item.createdBy,
                created_by_name: item.createdByName || 'Unknown User',
                created_by_image: item.createdByImage,
              });
              stats.agendaItems++;
            }
          } catch (error: any) {
            stats.errors.push(`Error migrating agenda item ${item.id}: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      stats.errors.push(`Error migrating agenda items: ${error.message}`);
    }

    // Note: History items are typically not migrated as they're activity logs
    // But if needed, they can be migrated here

    console.log('Migration completed:', stats);
    return stats;
  } catch (error: any) {
    stats.errors.push(`Fatal migration error: ${error.message}`);
    console.error('Migration failed:', error);
    return stats;
  }
};

/**
 * Check if migration is needed (i.e., localStorage has data but Supabase is empty)
 */
export const checkMigrationNeeded = async (): Promise<boolean> => {
  try {
    const hasLocalStorageData =
      localStorage.getItem('bamas_members') ||
      localStorage.getItem('bamas_documents') ||
      localStorage.getItem('bamas_polls') ||
      localStorage.getItem('bamas_agenda_items');

    if (!hasLocalStorageData) {
      return false; // No data to migrate
    }

    // Check if Supabase has data
    const users = await db.fetchAll('users');
    const documents = await db.fetchAll('documents');
    const polls = await db.fetchAll('polls');
    const agendaItems = await db.fetchAll('agenda_items');

    // If localStorage has data but Supabase is empty, migration is needed
    return (
      (localStorage.getItem('bamas_members') && users.length === 0) ||
      (localStorage.getItem('bamas_documents') && documents.length === 0) ||
      (localStorage.getItem('bamas_polls') && polls.length === 0) ||
      (localStorage.getItem('bamas_agenda_items') && agendaItems.length === 0)
    );
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

