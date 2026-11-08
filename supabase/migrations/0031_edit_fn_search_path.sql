-- Migration 0031: pin search_path on the Pro Plus edit helpers (Supabase security advisor: function_search_path_mutable).
alter function public.fc_edit_limit() set search_path = public;
alter function public.fc_edit_period() set search_path = public;
