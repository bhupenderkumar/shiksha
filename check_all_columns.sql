-- Get all column names, data types, and nullability for the InteractiveQuestion table
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'school' 
  AND table_name = 'InteractiveQuestion'
ORDER BY 
  ordinal_position;
