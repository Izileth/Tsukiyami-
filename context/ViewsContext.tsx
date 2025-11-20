import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/utils/supabase';

interface ViewsContextType {
  incrementView: (postSlug: string) => Promise<void>;
  getViewsCount: (postId: number) => number;
  loading: boolean;
  fetchViewsCount: (postId: number) => Promise<number>;
}

const ViewsContext = createContext<ViewsContextType | undefined>(undefined);

export const useViews = () => {
  const context = useContext(ViewsContext);
  if (!context) {
    throw new Error('useViews must be used within a ViewsProvider');
  }
  return context;
};

export const ViewsProvider = ({ children }: { children: React.ReactNode }) => {
  const [viewCounts, setViewCounts] = useState<Map<number, number>>(new Map()); // Stores total views for each post_id
  const [loading, setLoading] = useState(false);

  const incrementView = async (postSlug: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('increment_view_count', { post_slug: postSlug });
      if (error) {
        console.error('Error incrementing view count:', error);
      } else {
        // Optionally update local state if needed, though direct RPC call won't return the new count easily.
        // A refetch of the post might be needed to get the updated count.
        // For now, we'll let `fetchViewsCount` handle updates.
      }
    } catch (error: any) {
      console.error('Unexpected error incrementing view count:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchViewsCount = async (postId: number): Promise<number> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('views_count')
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching views count:', error);
        return 0;
      }

      if (data) {
        setViewCounts((prev) => {
          const newMap = new Map(prev);
          newMap.set(postId, data.views_count);
          return newMap;
        });
        return data.views_count;
      }
      return 0;
    } catch (error: any) {
      console.error('Unexpected error fetching views count:', error.message);
      return 0;
    } finally {
      setLoading(false);
    }
  };

  const getViewsCount = (postId: number) => viewCounts.get(postId) || 0;

  return (
    <ViewsContext.Provider value={{ incrementView, getViewsCount, loading, fetchViewsCount }}>
      {children}
    </ViewsContext.Provider>
  );
};
