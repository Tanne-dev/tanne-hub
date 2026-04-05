-- Chạy trong tab SQL mới để xem ai đang là owner của bảng (nếu vẫn lỗi).
-- Kết quả cột "owner" cho biết role nào sở hữu bảng.

SELECT
  n.nspname AS schema,
  c.relname AS name,
  c.relkind AS kind,
  pg_get_userbyid(c.relowner) AS owner
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'raid_champions';
