import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iudqiefzbrwgbfagjxns.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1ZHFpZWZ6YnJ3Z2JmYWdqeG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc0MTUsImV4cCI6MjA2ODUxMzQxNX0.pghAr6F4_awgeK61yB-X9FvliiqkTDISDIi5nNLAfsM'

export const supabase = createClient(supabaseUrl, supabaseKey) 