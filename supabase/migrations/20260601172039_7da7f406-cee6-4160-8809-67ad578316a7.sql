-- Fix search path for security
ALTER FUNCTION public.check_ssr_error_rate() SET search_path = public;

-- Revoke execute from public and authenticated since it's a trigger function for system use
REVOKE EXECUTE ON FUNCTION public.check_ssr_error_rate() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_ssr_error_rate() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.check_ssr_error_rate() FROM anon;

-- Fix overly permissive RLS policies
DROP POLICY IF EXISTS "Service role can manage alert settings" ON public.alert_settings;
DROP POLICY IF EXISTS "Service role can manage notifications" ON public.ssr_error_notifications;

-- Only service_role can do anything to these tables by default (since we want them managed by the system)
-- If we want the dashboard to see them, we can add SELECT for authenticated later if needed, 
-- but "true" for ALL is too much.
CREATE POLICY "Service role full access alert settings" ON public.alert_settings FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access notifications" ON public.ssr_error_notifications FOR ALL TO service_role USING (true);

-- Allow authenticated users to view settings and notifications for the dashboard
CREATE POLICY "Authenticated users can view alert settings" ON public.alert_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view notifications" ON public.ssr_error_notifications FOR SELECT TO authenticated USING (true);
