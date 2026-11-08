-- Migration 0030: send Studio brief links automatically.
-- Every 10 minutes, call studio-brief 'sweep', which emails the brief link to clients who paid for a custom design
-- and have not had it yet (it used to run only when Angel opened Admin > Studio).
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobid) from cron.job where jobname = 'okunami-studio-brief-sweep';
select cron.schedule(
  'okunami-studio-brief-sweep',
  '*/10 * * * *',
  $$select net.http_post(
      url := 'https://hrwzzpmltpsqyynmmeof.supabase.co/functions/v1/studio-brief',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{"action": "sweep"}'::jsonb,
      timeout_milliseconds := 20000
    );$$
);
