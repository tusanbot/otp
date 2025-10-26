// در اینجا فرض کردیم پیامک‌ها در آرایه ذخیره شدن
const allMessages = [
  { id: 1, agentId: "a123", from: "0912...", body: "سلام", timestamp: "2025-10-20 14:00" },
  { id: 2, agentId: "b222", from: "0935...", body: "ثبت نام انجام شد", timestamp: "2025-10-20 14:05" },
  { id: 3, agentId: "a123", from: "0912...", body: "اطلاعات ارسال شد", timestamp: "2025-10-20 15:00" },
];

export async function getMessagesByAgent(agentId) {
  // اینجا در عمل از دیتابیس واقعی مثل Mongo یا Supabase استفاده می‌کنی
  return allMessages.filter(m => m.agentId === agentId);
}
