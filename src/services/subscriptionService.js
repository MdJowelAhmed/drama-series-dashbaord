import { supabase } from '@/lib/supabase';

export const subscriptionService = {
  async getAllPackages() {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getPackageById(id) {
    const { data, error } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createPackage(packageData) {
    const { data, error } = await supabase
      .from('subscription_packages')
      .insert([packageData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePackage(id, packageData) {
    const { data, error } = await supabase
      .from('subscription_packages')
      .update(packageData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePackage(id) {
    const { error } = await supabase
      .from('subscription_packages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
