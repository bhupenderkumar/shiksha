-- Flyway Migration V2: Create fee_payments table
-- This table tracks individual payments against fees.

CREATE TABLE IF NOT EXISTS school.fee_payments (
    id              VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fee_id          VARCHAR(255) NOT NULL,
    amount          NUMERIC(10,2) NOT NULL,
    payment_date    VARCHAR(50) NOT NULL,
    payment_method  VARCHAR(100),
    transaction_id  VARCHAR(255),
    remarks         TEXT,
    created_at      VARCHAR(50) DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS'),

    CONSTRAINT fk_fee_payments_fee FOREIGN KEY (fee_id) REFERENCES school."Fees"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fee_payments_fee_id ON school.fee_payments(fee_id);
