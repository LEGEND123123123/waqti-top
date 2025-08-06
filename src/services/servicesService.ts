import { supabase } from '../lib/supabase';
import { Service } from '../types';

export class ServicesService {
  static async getAllServices(): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          provider:users!provider_id(id, name, avatar_url, is_verified)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        provider: {
          id: service.provider.id,
          name: service.provider.name,
          email: '', // Don't expose email
          phone: '', // Don't expose phone
          balance: 0, // Don't expose balance
          joinedAt: new Date(),
          avatar: service.provider.avatar_url,
          isVerified: service.provider.is_verified
        },
        hourlyRate: service.hourly_rate,
        location: service.location,
        rating: service.rating || 0,
        reviews: service.reviews_count || 0,
        image: service.image_url || 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg'
      }));
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  static async getServiceById(serviceId: string): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          provider:users!provider_id(id, name, avatar_url, is_verified, bio, location)
        `)
        .eq('id', serviceId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        provider: {
          id: data.provider.id,
          name: data.provider.name,
          email: '',
          phone: '',
          balance: 0,
          joinedAt: new Date(),
          avatar: data.provider.avatar_url,
          isVerified: data.provider.is_verified
        },
        hourlyRate: data.hourly_rate,
        location: data.location,
        rating: data.rating || 0,
        reviews: data.reviews_count || 0,
        image: data.image_url || 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg'
      };
    } catch (error) {
      console.error('Error fetching service:', error);
      return null;
    }
  }

  static async createService(serviceData: {
    title: string;
    description: string;
    category: string;
    hourlyRate: number;
    location: string;
    imageUrl?: string;
    tags?: string[];
    requirements?: string;
    deliveryTime?: number;
  }): Promise<{ success: boolean; serviceId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('services')
        .insert({
          title: serviceData.title,
          description: serviceData.description,
          category: serviceData.category,
          provider_id: user.id,
          hourly_rate: serviceData.hourlyRate,
          location: serviceData.location,
          image_url: serviceData.imageUrl,
          tags: serviceData.tags || [],
          requirements: serviceData.requirements,
          delivery_time: serviceData.deliveryTime || 1
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, serviceId: data.id };
    } catch (error: any) {
      console.error('Service creation error:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateService(
    serviceId: string,
    updates: Partial<{
      title: string;
      description: string;
      category: string;
      hourlyRate: number;
      location: string;
      imageUrl: string;
      isActive: boolean;
    }>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.category) updateData.category = updates.category;
      if (updates.hourlyRate) updateData.hourly_rate = updates.hourlyRate;
      if (updates.location) updateData.location = updates.location;
      if (updates.imageUrl) updateData.image_url = updates.imageUrl;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', serviceId)
        .eq('provider_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Service update error:', error);
      return { success: false, error: error.message };
    }
  }

  static async searchServices(query: string, filters: any = {}): Promise<Service[]> {
    try {
      let queryBuilder = supabase
        .from('services')
        .select(`
          *,
          provider:users!provider_id(id, name, avatar_url, is_verified)
        `)
        .eq('is_active', true);

      // Text search using full-text search
      if (query) {
        queryBuilder = queryBuilder.textSearch('title,description', query);
      }

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }
      if (filters.location && filters.location !== 'all') {
        queryBuilder = queryBuilder.eq('location', filters.location);
      }
      if (filters.minRating && filters.minRating > 0) {
        queryBuilder = queryBuilder.gte('rating', filters.minRating);
      }
      if (filters.maxHours && filters.maxHours < 10) {
        queryBuilder = queryBuilder.lte('hourly_rate', filters.maxHours);
      }

      // Sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'rating':
            queryBuilder = queryBuilder.order('rating', { ascending: false });
            break;
          case 'price_low':
            queryBuilder = queryBuilder.order('hourly_rate', { ascending: true });
            break;
          case 'price_high':
            queryBuilder = queryBuilder.order('hourly_rate', { ascending: false });
            break;
          case 'newest':
            queryBuilder = queryBuilder.order('created_at', { ascending: false });
            break;
          default:
            queryBuilder = queryBuilder.order('rating', { ascending: false });
        }
      } else {
        queryBuilder = queryBuilder.order('rating', { ascending: false });
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      return data.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        provider: {
          id: service.provider.id,
          name: service.provider.name,
          email: '',
          phone: '',
          balance: 0,
          joinedAt: new Date(),
          avatar: service.provider.avatar_url,
          isVerified: service.provider.is_verified
        },
        hourlyRate: service.hourly_rate,
        location: service.location,
        rating: service.rating || 0,
        reviews: service.reviews_count || 0,
        image: service.image_url || 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg'
      }));
    } catch (error) {
      console.error('Service search error:', error);
      return [];
    }
  }

  static async getUserServices(userId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          provider:users!provider_id(id, name, avatar_url, is_verified)
        `)
        .eq('provider_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        provider: {
          id: service.provider.id,
          name: service.provider.name,
          email: '',
          phone: '',
          balance: 0,
          joinedAt: new Date(),
          avatar: service.provider.avatar_url,
          isVerified: service.provider.is_verified
        },
        hourlyRate: service.hourly_rate,
        location: service.location,
        rating: service.rating || 0,
        reviews: service.reviews_count || 0,
        image: service.image_url || 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg'
      }));
    } catch (error) {
      console.error('Error fetching user services:', error);
      return [];
    }
  }

  static async deleteService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('provider_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Service deletion error:', error);
      return { success: false, error: error.message };
    }
  }
}