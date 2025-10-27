-- ===========================
-- جدول همکاران (Agents)
-- ===========================
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    api_key TEXT UNIQUE NOT NULL, -- برای شناسایی همکار هنگام ارسال داده از اپ مشتری
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- جدول مشتریان (Customers)
-- ===========================
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT UNIQUE NOT NULL,
    device_id TEXT,                 -- شناسه دستگاه اندروید برای تشخیص گوشی
    app_version TEXT,               -- نسخه اپلیکیشن نصب‌شده
    is_active BOOLEAN DEFAULT TRUE, -- وضعیت فعال بودن مشتری
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- جدول پیامک‌های دریافتی (Messages)
-- ===========================
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,          -- سرشماره یا شماره فرستنده پیامک
    body TEXT NOT NULL,            -- محتوای کامل پیامک
    received_at TIMESTAMP NOT NULL DEFAULT NOW(),
    forwarded BOOLEAN DEFAULT FALSE, -- آیا پیام به سرور همکار ارسال شده؟
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===========================
-- ایندکس‌ها برای جست‌وجوی سریع‌تر
-- ===========================
CREATE INDEX IF NOT EXISTS idx_customers_agent_id ON customers(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);

-- ===========================
-- درج یک همکار آزمایشی (برای تست)
-- ===========================
INSERT INTO agents (name, phone, api_key)
VALUES ('همکار تستی', '09120000000', 'TEST-AGENT-KEY')
ON CONFLICT (phone) DO NOTHING;
