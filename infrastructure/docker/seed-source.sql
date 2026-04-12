-- DataFlow AI — Sample E-Commerce Source Database
-- Used for testing connector discovery and ingestion

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    sku VARCHAR(50) UNIQUE,
    weight_kg DECIMAL(6,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(30) DEFAULT 'pending',
    shipping_method VARCHAR(50),
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    customer_id INTEGER REFERENCES customers(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    body TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed data
INSERT INTO customers (first_name, last_name, email, phone, city, state, zip_code, country) VALUES
('Alice', 'Johnson', 'alice.johnson@email.com', '555-0101', 'New York', 'NY', '10001', 'US'),
('Bob', 'Smith', 'bob.smith@email.com', '555-0102', 'Los Angeles', 'CA', '90001', 'US'),
('Carol', 'Williams', 'carol.w@email.com', '555-0103', 'Chicago', 'IL', '60601', 'US'),
('David', 'Brown', 'david.brown@email.com', '555-0104', 'Houston', 'TX', '77001', 'US'),
('Eve', 'Davis', 'eve.davis@email.com', '555-0105', 'Phoenix', 'AZ', '85001', 'US'),
('Frank', 'Miller', 'frank.m@email.com', '555-0106', 'Philadelphia', 'PA', '19101', 'US'),
('Grace', 'Wilson', 'grace.wilson@email.com', '555-0107', 'San Antonio', 'TX', '78201', 'US'),
('Henry', 'Moore', 'henry.moore@email.com', '555-0108', 'San Diego', 'CA', '92101', 'US'),
('Ivy', 'Taylor', 'ivy.taylor@email.com', '555-0109', 'Dallas', 'TX', '75201', 'US'),
('Jack', 'Anderson', 'jack.a@email.com', '555-0110', 'San Jose', 'CA', '95101', 'US');

INSERT INTO products (name, description, category, subcategory, price, cost, sku, weight_kg) VALUES
('Wireless Headphones', 'Noise-cancelling Bluetooth headphones', 'Electronics', 'Audio', 79.99, 32.00, 'ELEC-AUD-001', 0.25),
('Laptop Stand', 'Adjustable aluminum laptop stand', 'Accessories', 'Desk', 49.99, 18.50, 'ACC-DSK-001', 1.20),
('Mechanical Keyboard', 'Cherry MX Blue switches, RGB', 'Electronics', 'Input', 129.99, 55.00, 'ELEC-INP-001', 0.95),
('USB-C Hub', '7-in-1 USB-C dock', 'Electronics', 'Accessories', 39.99, 15.00, 'ELEC-ACC-001', 0.15),
('Monitor Light Bar', 'LED monitor light bar', 'Electronics', 'Lighting', 59.99, 22.00, 'ELEC-LGT-001', 0.45),
('Desk Mat', 'Extended mouse pad 900x400mm', 'Accessories', 'Desk', 24.99, 8.00, 'ACC-DSK-002', 0.60),
('Webcam HD', '1080p HD webcam with mic', 'Electronics', 'Video', 69.99, 28.00, 'ELEC-VID-001', 0.18),
('Cable Management Kit', 'Cable clips and organizers', 'Accessories', 'Desk', 14.99, 4.50, 'ACC-DSK-003', 0.30),
('Ergonomic Mouse', 'Vertical wireless mouse', 'Electronics', 'Input', 34.99, 12.00, 'ELEC-INP-002', 0.12),
('Monitor Arm', 'Single monitor VESA mount arm', 'Accessories', 'Desk', 89.99, 35.00, 'ACC-DSK-004', 3.50);

INSERT INTO orders (customer_id, order_date, status, shipping_method, shipping_cost, tax_amount, total_amount, payment_method) VALUES
(1, '2025-10-15', 'delivered', 'express', 12.99, 8.40, 101.38, 'credit_card'),
(2, '2025-10-20', 'delivered', 'standard', 5.99, 13.00, 188.98, 'paypal'),
(3, '2025-11-01', 'delivered', 'express', 12.99, 6.50, 89.48, 'credit_card'),
(1, '2025-11-10', 'delivered', 'standard', 5.99, 3.50, 44.48, 'debit_card'),
(4, '2025-12-01', 'delivered', 'express', 12.99, 10.40, 153.37, 'credit_card'),
(5, '2025-12-15', 'delivered', 'standard', 5.99, 7.00, 82.98, 'paypal'),
(6, '2026-01-05', 'delivered', 'express', 12.99, 15.00, 227.98, 'credit_card'),
(7, '2026-01-20', 'shipped', 'standard', 5.99, 2.50, 33.48, 'debit_card'),
(2, '2026-02-01', 'processing', 'express', 12.99, 9.00, 121.98, 'credit_card'),
(8, '2026-02-10', 'processing', 'standard', 5.99, 5.25, 65.23, 'paypal'),
(9, '2026-02-20', 'pending', 'standard', 5.99, 4.20, 50.18, 'credit_card'),
(10, '2026-03-01', 'pending', 'express', 12.99, 12.00, 154.98, 'credit_card');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount, total_price) VALUES
(1, 1, 1, 79.99, 0, 79.99),
(2, 3, 1, 129.99, 0, 129.99),
(2, 6, 1, 24.99, 0, 24.99),
(3, 2, 1, 49.99, 0, 49.99),
(3, 8, 1, 14.99, 0, 14.99),
(4, 6, 1, 24.99, 0, 24.99),
(5, 1, 1, 79.99, 0, 79.99),
(5, 4, 1, 39.99, 0, 39.99),
(6, 7, 1, 69.99, 0, 69.99),
(7, 3, 1, 129.99, 0, 129.99),
(7, 5, 1, 59.99, 0, 59.99),
(8, 8, 1, 14.99, 0, 14.99),
(9, 9, 1, 34.99, 0, 34.99),
(9, 5, 1, 59.99, 0, 59.99),
(10, 6, 1, 24.99, 0, 24.99),
(10, 9, 1, 34.99, 10.00, 24.99),
(11, 4, 1, 39.99, 0, 39.99),
(12, 10, 1, 89.99, 0, 89.99),
(12, 2, 1, 49.99, 0, 49.99);

INSERT INTO product_reviews (product_id, customer_id, rating, title, body) VALUES
(1, 1, 5, 'Amazing sound quality', 'Best headphones I have ever owned. Noise cancellation is superb.'),
(3, 2, 4, 'Great keyboard', 'Love the tactile feel. A bit loud but very satisfying to type on.'),
(2, 3, 5, 'Perfect for WFH', 'Keeps my desk tidy and laptop at eye level.'),
(1, 5, 4, 'Good value', 'Solid headphones for the price. Battery lasts all day.'),
(7, 6, 3, 'Decent webcam', 'Image quality is OK, not great in low light.');
