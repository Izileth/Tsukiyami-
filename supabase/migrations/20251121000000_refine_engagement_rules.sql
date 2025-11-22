-- 1. Views Tracking
-- पुरानी RPC फ़ंक्शन को हटाएं
DROP FUNCTION IF EXISTS public.increment_view_count(post_slug text);

-- व्यूज को ट्रैक करने के लिए नई टेबल बनाएं
CREATE TABLE public.post_views (
    post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- RLS सक्षम करें
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- नीतियां बनाएं
CREATE POLICY "Users can view their own views." ON public.post_views
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own views." ON public.post_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- व्यू काउंटर को अपडेट करने के लिए ट्रिगर फ़ंक्शन
CREATE OR REPLACE FUNCTION public.handle_new_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET views_count = views_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ट्रिगर बनाएं
CREATE TRIGGER on_new_view
AFTER INSERT ON public.post_views
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_view();


-- 2. Likes Tracking
-- लाइक्स काउंटर को अपडेट करने के लिए ट्रिगर फ़ंक्शन्स
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = likes_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_deleted_like()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = likes_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- लाइक्स पर ट्रिगर्स
CREATE TRIGGER on_new_like
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_like();

CREATE TRIGGER on_deleted_like
AFTER DELETE ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_deleted_like();


-- 3. Dislikes Tracking
-- डिसलाइक्स काउंटर को अपडेट करने के लिए ट्रिगर फ़ंक्शन्स
CREATE OR REPLACE FUNCTION public.handle_new_dislike()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET dislikes_count = dislikes_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_deleted_dislike()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET dislikes_count = dislikes_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- डिसलाइक्स पर ट्रिगर्स
CREATE TRIGGER on_new_dislike
AFTER INSERT ON public.dislikes
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_dislike();

CREATE TRIGGER on_deleted_dislike
AFTER DELETE ON public.dislikes
FOR EACH ROW
EXECUTE FUNCTION public.handle_deleted_dislike();


-- 4. Comments Tracking
-- कमेंट्स काउंटर को अपडेट करने के लिए ट्रिगर फ़ंक्शन्स
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_deleted_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = comments_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- कमेंट्स पर ट्रिगर्स
CREATE TRIGGER on_new_comment
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_comment();

CREATE TRIGGER on_deleted_comment
AFTER DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_deleted_comment();
