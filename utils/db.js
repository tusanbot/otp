// utils/db.js
// این پیاده‌سازی فقط نمونه و در حافظه است.
// بهتر است بجای این از پایگاه داده (Postgres / Supabase / Neon / MongoDB) استفاده کنید.

const messagesByAgent = {}; // { agentId: [ {from, body, timestamp, customerId} ] }
const customers = {}; // نمونه: { customerId: { id, agentId, allowedSenders: ['1200','+9812...'], ... } }

// helper: ثبت یک مشتری نمونه (در عمل این از دیتابیس در میاد)
export async function upsertCustomer(customer) {
  customers[customer.id] = customer;
  return customers[customer.id];
}

export async function getCustomerById(id) {
  return customers[id] || null;
}

export async function saveMessageForAgent(agentId, message) {
  messagesByAgent[agentId] = messagesByAgent[agentId] || [];
  messagesByAgent[agentId].unshift(message); // جدیدترین اول
  // برای جلوگیری از رشد بی‌نهایت، می‌توانید سقف نگهداری تعیین کنید:
  if (messagesByAgent[agentId].length > 500) messagesByAgent[agentId].pop();
}

export async function getMessagesForAgent(agentId) {
  return messagesByAgent[agentId] || [];
}
