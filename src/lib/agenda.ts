import { supabase } from './supabase';

export interface Comment {
  id: string;
  agenda_id: string;
  user_id: string;
  user_name: string;
  user_image?: string;
  text: string;
  created_at: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  created_by: string;
  created_by_name: string;
  created_by_image?: string;
  created_at: string;
  updated_at?: string;
  comments: Comment[];
}

/**
 * Load all agenda items with their comments
 */
export const loadAgendaItems = async (): Promise<AgendaItem[]> => {
  try {
    // Load agenda items
    const { data: agendaData, error: agendaError } = await supabase
      .from('agenda_items')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (agendaError) throw agendaError;
    if (!agendaData) return [];

    // Load all comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('agenda_comments')
      .select('*')
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    // Group comments by agenda_id
    const commentsByAgenda: Record<string, Comment[]> = {};
    commentsData?.forEach((comment: any) => {
      if (!commentsByAgenda[comment.agenda_id]) {
        commentsByAgenda[comment.agenda_id] = [];
      }
      commentsByAgenda[comment.agenda_id].push({
        id: comment.id,
        agenda_id: comment.agenda_id,
        user_id: comment.user_id,
        user_name: comment.user_name,
        user_image: comment.user_image || undefined,
        text: comment.text,
        created_at: comment.created_at,
      });
    });

    // Combine agenda items with comments
    const agendaItems: AgendaItem[] = agendaData.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      date: item.date,
      time: item.time,
      location: item.location || undefined,
      created_by: item.created_by,
      created_by_name: item.created_by_name,
      created_by_image: item.created_by_image || undefined,
      created_at: item.created_at,
      updated_at: item.updated_at || undefined,
      comments: commentsByAgenda[item.id] || [],
    }));

    return agendaItems;
  } catch (error) {
    console.error('Error loading agenda items:', error);
    throw error;
  }
};

/**
 * Create a new agenda item
 */
export const createAgendaItem = async (
  agendaData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location?: string;
    created_by: string;
    created_by_name: string;
    created_by_image?: string;
  }
): Promise<AgendaItem> => {
  try {
    const { data, error } = await supabase
      .from('agenda_items')
      .insert({
        title: agendaData.title,
        description: agendaData.description,
        date: agendaData.date,
        time: agendaData.time,
        location: agendaData.location || null,
        created_by: agendaData.created_by,
        created_by_name: agendaData.created_by_name,
        created_by_image: agendaData.created_by_image || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location || undefined,
      created_by: data.created_by,
      created_by_name: data.created_by_name,
      created_by_image: data.created_by_image || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at || undefined,
      comments: [],
    };
  } catch (error) {
    console.error('Error creating agenda item:', error);
    throw error;
  }
};

/**
 * Update an agenda item
 */
export const updateAgendaItem = async (
  agendaId: string,
  updates: {
    title?: string;
    description?: string;
    date?: string;
    time?: string;
    location?: string;
  }
): Promise<AgendaItem> => {
  try {
    const { data, error } = await supabase
      .from('agenda_items')
      .update(updates)
      .eq('id', agendaId)
      .select()
      .single();

    if (error) throw error;

    // Reload to get comments
    const agendaItems = await loadAgendaItems();
    const updated = agendaItems.find((item) => item.id === agendaId);
    if (!updated) throw new Error('Agenda item not found after update');

    return updated;
  } catch (error) {
    console.error('Error updating agenda item:', error);
    throw error;
  }
};

/**
 * Delete an agenda item (cascade will delete comments)
 */
export const deleteAgendaItem = async (agendaId: string): Promise<void> => {
  try {
    const { error } = await supabase.from('agenda_items').delete().eq('id', agendaId);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting agenda item:', error);
    throw error;
  }
};

/**
 * Add a comment to an agenda item
 */
export const addComment = async (
  agendaId: string,
  commentData: {
    user_id: string;
    user_name: string;
    user_image?: string;
    text: string;
  }
): Promise<Comment> => {
  try {
    const { data, error } = await supabase
      .from('agenda_comments')
      .insert({
        agenda_id: agendaId,
        user_id: commentData.user_id,
        user_name: commentData.user_name,
        user_image: commentData.user_image || null,
        text: commentData.text,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      agenda_id: data.agenda_id,
      user_id: data.user_id,
      user_name: data.user_name,
      user_image: data.user_image || undefined,
      text: data.text,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

