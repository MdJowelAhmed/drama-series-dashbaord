import { supabase } from '@/lib/supabase';

export const userService = {
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*, subscription_packages(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*, subscription_packages(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(id, userData) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUser(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async updateUserSubscription(userId, subscriptionId, durationDays) {
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + durationDays);

    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_id: subscriptionId,
        subscription_start: subscriptionStart.toISOString(),
        subscription_end: subscriptionEnd.toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
