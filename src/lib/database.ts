import { supabase } from './supabase';

/**
 * Database helper functions for common operations
 */

export const db = {
  /**
   * Generic function to fetch all records from a table
   */
  async fetchAll<T>(table: string): Promise<T[]> {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return (data || []) as T[];
  },

  /**
   * Generic function to fetch a single record by ID
   */
  async fetchById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as T;
  },

  /**
   * Generic function to insert a record
   */
  async insert<T>(table: string, record: Partial<T>): Promise<T> {
    const { data, error } = await supabase.from(table).insert(record).select().single();
    if (error) throw error;
    return data as T;
  },

  /**
   * Generic function to update a record
   */
  async update<T>(table: string, id: string, updates: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(table)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as T;
  },

  /**
   * Generic function to delete a record
   */
  async delete(table: string, id: string): Promise<void> {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Generic function to fetch records with filters
   */
  async fetchWithFilters<T>(
    table: string,
    filters: Record<string, any>,
    orderBy?: { column: string; ascending?: boolean }
  ): Promise<T[]> {
    let query = supabase.from(table).select('*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as T[];
  },
};

