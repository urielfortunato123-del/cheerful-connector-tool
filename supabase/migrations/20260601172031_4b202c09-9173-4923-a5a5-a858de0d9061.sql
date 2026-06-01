-- Table for alert configurations
CREATE TABLE public.alert_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_name TEXT NOT NULL UNIQUE,
    threshold_count INTEGER NOT NULL DEFAULT 10,
    time_window_minutes INTEGER NOT NULL DEFAULT 5,
    notification_webhook_url TEXT, -- For Slack/Discord/etc
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for logging sent notifications
CREATE TABLE public.ssr_error_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES public.alert_settings(id),
    error_count INTEGER NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alert_settings TO authenticated;
GRANT ALL ON public.alert_settings TO service_role;
GRANT SELECT ON public.ssr_error_notifications TO authenticated;
GRANT ALL ON public.ssr_error_notifications TO service_role;

-- Enable RLS
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ssr_error_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for alert_settings
CREATE POLICY "Service role can manage alert settings" ON public.alert_settings FOR ALL USING (true);
CREATE POLICY "Service role can manage notifications" ON public.ssr_error_notifications FOR ALL USING (true);

-- Insert a default alert setting
INSERT INTO public.alert_settings (alert_name, threshold_count, time_window_minutes)
VALUES ('High SSR Error Rate', 5, 5)
ON CONFLICT (alert_name) DO NOTHING;

-- Function to check for errors and trigger alerts
CREATE OR REPLACE FUNCTION public.check_ssr_error_rate()
RETURNS TRIGGER AS $$
DECLARE
    v_threshold INTEGER;
    v_window_min INTEGER;
    v_error_count INTEGER;
    v_alert_id UUID;
    v_last_notified TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get settings for the High SSR Error Rate alert
    SELECT id, threshold_count, time_window_minutes INTO v_alert_id, v_threshold, v_window_min
    FROM public.alert_settings
    WHERE alert_name = 'High SSR Error Rate' AND is_enabled = true;

    IF v_alert_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Check how many errors occurred in the time window
    SELECT COUNT(*) INTO v_error_count
    FROM public.ssr_errors
    WHERE created_at >= now() - (v_window_min || ' minutes')::interval;

    -- If error count exceeds threshold
    IF v_error_count >= v_threshold THEN
        -- Check if we already notified recently (avoid spamming, e.g., once every 5 mins)
        SELECT MAX(sent_at) INTO v_last_notified
        FROM public.ssr_error_notifications
        WHERE alert_id = v_alert_id;

        IF v_last_notified IS NULL OR v_last_notified < now() - interval '5 minutes' THEN
            -- Record the alert trigger
            INSERT INTO public.ssr_error_notifications (alert_id, error_count, window_start, window_end)
            VALUES (v_alert_id, v_error_count, now() - (v_window_min || ' minutes')::interval, now());
            
            -- Log to console/logs (visible in Render logs)
            RAISE NOTICE 'SSR ALERT: High error rate detected! % errors in the last % minutes.', v_error_count, v_window_min;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on ssr_errors table
DROP TRIGGER IF EXISTS trigger_check_ssr_error_rate ON public.ssr_errors;
CREATE TRIGGER trigger_check_ssr_error_rate
AFTER INSERT ON public.ssr_errors
FOR EACH STATEMENT
EXECUTE FUNCTION public.check_ssr_error_rate();
