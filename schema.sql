-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Product Categories table
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL UNIQUE
);

-- Products table 
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR,
    in_stock BOOLEAN DEFAULT TRUE,
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist table
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_number VARCHAR NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status VARCHAR NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed')),
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL
);

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Allow insert during signup"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view products"
    ON products FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify products"
    ON products FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND is_admin = true
    ));

-- Categories policies
CREATE POLICY "Anyone can view categories"
    ON product_categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify categories"
    ON product_categories FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND is_admin = true
    ));

-- Wishlist policies
CREATE POLICY "Users can manage their own wishlist"
    ON wishlist FOR ALL
    USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY "Admins can manage all orders"
    ON orders FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND is_admin = true
    ));

-- Order items policies
CREATE POLICY "Users can view their own order items"
    ON order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM orders 
        WHERE order_items.order_id = orders.id 
        AND orders.user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all order items"
    ON order_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND is_admin = true
    ));