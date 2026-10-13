-- One-time welcome email after a member publishes their first card (sent by the okunami-welcome edge function).
alter table public.fc_profiles add column if not exists welcome_sent_at timestamptz;
comment on column public.fc_profiles.welcome_sent_at is 'When the one-time welcome email went out (set by the okunami-welcome edge function).';
