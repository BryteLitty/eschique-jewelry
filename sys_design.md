# 🛍️ Jewelry E-Commerce Site — System Design Document

## 1. Project Overview
A minimalist e-commerce platform for selling jewelry, allowing users to browse products, view product details, and for authenticated customers to add items to a cart, checkout via payment, and manage their orders. Admins can manage products and view orders via a simple dashboard.

---

## 2. Architecture Overview

### Frontend (Client-Side)
- Framework: React (with Vite)
- State/Data Management: React Query (for server state/data fetching and caching)
- Styling: Tailwind CSS (custom design system using Montserrat)
- Routing: React Router

### Backend (Serverless via Supabase)
- Authentication: Supabase Auth (required for cart, checkout, wishlist, and orders)
- Database: Supabase PostgreSQL
- Storage: Supabase Storage (for product images)
- APIs: Supabase auto-generated APIs (via Row Level Security + Supabase client)
- Realtime: Optional for order updates

---

## 3. Core Features

### Customer-Facing App
- **Public Access:**
  - View product catalog
  - View product details
- **Authenticated Access Only:**
  - Add to cart
  - Add/remove product to/from wishlist
  - View cart and proceed to checkout
  - Input shipping info
  - Make payment
  - View order confirmation and history

### Admin Dashboard
- Login (Supabase Auth with admin role)
- Add/edit/delete products
- Manage product categories
- View orders and update order status

---

## 4. Entity Models (Database Schema)

### Users
| Field       | Type     | Description               |
|-------------|----------|---------------------------|
| id          | UUID     | Supabase Auth user ID     |
| full_name   | String   | User’s full name          |
| email       | String   | User’s email              |
| is_admin    | Boolean  | Flag for admin access     |

### Products
| Field       | Type     | Description               |
|-------------|----------|---------------------------|
| id          | UUID     | Primary Key               |
| name        | String   | Product name              |
| description | Text     | Product description       |
| price       | Decimal  | Price in base currency    |
| image_url   | String   | Supabase Storage URL      |
| in_stock    | Boolean  | Stock status              |
| category_id | UUID     | FK to Product_Categories  |
| created_at  | Timestamp| Timestamp                 |

### Product_Categories
| Field       | Type     | Description               |
|-------------|----------|---------------------------|
| id          | UUID     | Primary Key               |
| name        | String   | Category name             |

### Wishlist
| Field       | Type     | Description               |
|-------------|----------|---------------------------|
| id          | UUID     | Primary Key               |
| user_id     | UUID     | FK to Users               |
| product_id  | UUID     | FK to Products            |

### Orders
| Field        | Type     | Description               |
|--------------|----------|---------------------------|
| id           | UUID     | Primary Key               |
| user_id      | UUID     | FK to Users               |
| total_amount | Decimal  | Order total               |
| status       | String   | Pending, Paid, Shipped    |
| created_at   | Timestamp| Order timestamp           |

### Order_Items
| Field       | Type     | Description               |
|-------------|----------|---------------------------|
| id          | UUID     | Primary Key               |
| order_id    | UUID     | FK to Orders              |
| product_id  | UUID     | FK to Products            |
| quantity    | Integer  | Qty ordered               |
| unit_price  | Decimal  | Price at order time       |

---

## 5. User Flows

### Public User Flow
1. View product catalog
2. View product details
3. Prompt to log in if attempting to add to cart or wishlist

### Authenticated Customer Flow
1. Login or Sign Up
2. Browse products by category
3. View product details
4. Add to cart or wishlist
5. View cart and proceed to checkout
6. Input shipping info
7. Make payment
8. See order confirmation

### Admin Flow
1. Login (as admin)
2. Manage products (create/edit/delete)
3. Manage categories
4. View incoming orders
5. Update order status (optional)

---

## 6. Security & Access Control
- Supabase Auth for both customers and admins
- Public access to view products and product details
- Authentication required for cart, wishlist, checkout, and order features
- Row-Level Security (RLS) policies:
  - Users can only view/edit their own orders and wishlist
  - Admins can read/write all product/order/category data
- Media (images) access via Supabase Storage with public or signed URLs

---

## 7. Third-Party Integrations
- **Payment Gateway**: Stripe / Paystack (frontend integration + webhook if needed)
- **Email (Optional)**: Supabase Edge Functions + Resend or third-party for order confirmations

---

## 8. Performance & Scalability
- Supabase scales automatically with usage
- Vite + React provides fast, modern client-side rendering
- React Query helps with caching and state updates for server data
- Lightweight stack ensures simplicity and responsiveness

---

# 🎨 Design System

## Fonts
- **Primary Font**: `Montserrat`, sans-serif (clean, modern, readable)

## Color Palette
| Role          | Hex Code     | Usage Description                    |
|---------------|--------------|--------------------------------------|
| Background    | `#FFFFFF`    | Clean white background               |
| Primary Text  | `#1A1A1A`    | Headlines, buttons                   |
| Accent Text   | `#8B5E3C`    | Product names, prices (warm brown)   |
| Border/Lines  | `#E5E5E5`    | Input borders, dividers              |
| Success       | `#228B22`    | Payment confirmation, statuses       |
| Error         | `#D32F2F`    | Error states                         |
| Disabled      | `#CCCCCC`    | Disabled buttons or states           |

## Buttons
- **Primary Button**: Black bg, white text, fully rounded
- **Secondary Button**: White bg, black text & border
- **Accent Button**: Transparent bg, brown text
- **Hover states**: Subtle shadow or underline
- **Disabled**: Greyed out look

## Typography Sizes
- **Headings**: `text-2xl`, `text-xl`, `text-lg`
- **Body**: `text-base`, `text-sm`

## Components
- **Product Cards**: White box, image, brown product name, black price, black button
- **Cart Drawer**: White bg, list items, subtotal, black checkout button
- **Wishlist Icon**: Heart outline, brown when active
- **Forms**: Rounded inputs, light grey border, brown focus ring

---