import { createClient } from '@supabase/supabase-js';

// 環境変数から URL と Key を読み込む（VITE_ プレフィックスが必要）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase クライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey);