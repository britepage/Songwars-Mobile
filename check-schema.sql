-- Check the actual schema of key tables
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'songs' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'battles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'votes' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'song_flags' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'golden_ears' AND table_schema = 'public'
ORDER BY ordinal_position;
