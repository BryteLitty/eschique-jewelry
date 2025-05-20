-- Add policy to allow users to create order items for their own orders
CREATE POLICY "Users can create order items for their own orders"
    ON order_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM orders 
        WHERE order_items.order_id = orders.id 
        AND orders.user_id = auth.uid()
    )); 