-- Drop the old, incorrect policy
DROP POLICY IF EXISTS "Users can update their own comments." ON public.comments;

-- Create the new, correct policy using the 'USING' clause
CREATE POLICY "Users can update their own comments." ON public.comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Optional: Add a comment explaining the change
COMMENT ON POLICY "Users can update their own comments." ON public.comments IS 
'Policy corrected to use USING clause to authorize which rows can be updated, and WITH CHECK to ensure ownership is not changed.';
