import { supabase } from '@/lib/supabase';

export const dramaService = {
  async getAllDramas() {
    const { data, error } = await supabase
      .from('dramas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDramaById(id) {
    const { data, error } = await supabase
      .from('dramas')
      .select('*, series(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createDrama(dramaData) {
    const { data, error } = await supabase
      .from('dramas')
      .insert([dramaData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDrama(id, dramaData) {
    const { data, error } = await supabase
      .from('dramas')
      .update(dramaData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteDrama(id) {
    const { error } = await supabase
      .from('dramas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async createSeries(seriesData) {
    const { data, error } = await supabase
      .from('series')
      .insert([seriesData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSeries(id, seriesData) {
    const { data, error } = await supabase
      .from('series')
      .update(seriesData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSeries(id) {
    const { error } = await supabase
      .from('series')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async getSeriesByDramaId(dramaId) {
    const { data, error } = await supabase
      .from('series')
      .select('*, videos(*)')
      .eq('drama_id', dramaId)
      .order('series_number', { ascending: true });

    if (error) throw error;
    return data;
  },

  async uploadVideo(videoData) {
    const { data, error } = await supabase
      .from('videos')
      .insert([videoData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateVideo(id, videoData) {
    const { data, error } = await supabase
      .from('videos')
      .update(videoData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteVideo(id) {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
