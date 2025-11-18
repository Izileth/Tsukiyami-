import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

const adminClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await adminClient.auth.getUser(jwt);
    if (userError || !user) {
      throw new Error(`Authentication error: ${userError?.message ?? 'User not found'}`);
    }

    const userId = user.id;

    // 2. Delete user's avatar and banner from storage
    const { data: files, error: listError } = await adminClient.storage.from('avatars').list(userId);
    if (listError) console.error('Error listing avatar files:', listError.message);
    else if (files && files.length > 0) {
      const fileNames = files.map(file => `${userId}/${file.name}`);
      const { error: removeAvatarError } = await adminClient.storage.from('avatars').remove(fileNames);
      if (removeAvatarError) console.error('Error removing avatars:', removeAvatarError.message);
    }

    const { data: bannerFiles, error: listBannerError } = await adminClient.storage.from('banners').list(userId);
    if (listBannerError) console.error('Error listing banner files:', listBannerError.message);
    else if (bannerFiles && bannerFiles.length > 0) {
      const bannerFileNames = bannerFiles.map(file => `${userId}/${file.name}`);
      const { error: removeBannerError } = await adminClient.storage.from('banners').remove(bannerFileNames);
      if (removeBannerError) console.error('Error removing banners:', removeBannerError.message);
    }

    // 3. Delete user's profile from the profiles table (optional, handled by cascade)
    // The 'profiles' table has a foreign key to 'auth.users' with ON DELETE CASCADE,
    // so the profile will be deleted automatically when the user is deleted.

    // 4. Delete the user from auth.users
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      throw new Error(`Failed to delete user: ${deleteUserError.message}`);
    }

    return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
