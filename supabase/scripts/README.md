# Script SQL thủ công (Raid champions)

Chạy từng file trong **Supabase → SQL Editor** khi cần; **không** thay cho `migrations/` (migration dùng cho `supabase db push` / lịch sử schema).

| File | Mục đích |
|------|----------|
| `raid_champions_0_diagnose.sql` | Kiểm tra owner bảng |
| `raid_champions_1_drop_only.sql` | Chỉ DROP bảng |
| `raid_champions_2_create_only.sql` | CREATE + policy |
| `raid_champions_reset_and_create.sql` | DROP + CREATE một lần |

Schema chuẩn theo thời gian nằm trong `../migrations/`.
