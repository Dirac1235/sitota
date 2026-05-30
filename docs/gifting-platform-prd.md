# Corporate Gifting Platform — Product Requirements Document

**Version:** 1.0
**Date:** May 2026
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform Overview](#2-platform-overview)
3. [User Roles & Personas](#3-user-roles--personas)
4. [Feature Specifications](#4-feature-specifications)
   - 4.1 [Authentication & Onboarding](#41-authentication--onboarding)
   - 4.2 [Product Catalog](#42-product-catalog)
   - 4.3 [Bundle Builder](#43-bundle-builder)
   - 4.4 [Customization Canvas & AI Preview](#44-customization-canvas--ai-preview)
     - 4.4.2 [Intent & Preference Prompt *(Primary Input)*](#442-intent--preference-prompt-primary-input--shown-first)
     - 4.4.3 [Structured Customization Inputs *(Secondary Inputs)*](#443-structured-customization-inputs-secondary-inputs--shown-below-the-intent-prompt)
     - 4.4.4 [Input Panel Layout (Visual Hierarchy)](#444-input-panel-layout-visual-hierarchy)
     - 4.4.5 [AI Preview Generation](#445-ai-preview-generation)
     - 4.4.7 [Preview Persistence & Design Library](#447-preview-persistence--design-library)
   - 4.5 [Gifting & Ordering Flow](#45-gifting--ordering-flow)
   - 4.6 [Recipient Management](#46-recipient-management)
   - 4.7 [Order Management & Tracking](#47-order-management--tracking)
   - 4.8 [Dashboard & Analytics](#48-dashboard--analytics)
   - 4.9 [Payments & Billing](#49-payments--billing)
   - 4.10 [Notifications & Communications](#410-notifications--communications)
   - 4.11 [Admin Panel](#411-admin-panel)
5. [Key User Flows](#5-key-user-flows)
6. [Technical Architecture](#6-technical-architecture)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Future Roadmap](#8-future-roadmap)

---

## 1. Executive Summary

This document defines the full product requirements for a **Corporate Gifting Platform** — a web-based SaaS solution that enables businesses, HR teams, marketing departments, and individuals to order branded gift products or bundles and send them to employees, clients, or family members.

The platform's key differentiator is its **AI-powered product preview engine**: users upload their logo and enter custom text, select a product or bundle, and instantly receive a photorealistic AI-generated preview of their branded gift — with minimal friction and zero design expertise required.

**Core Value Propositions:**
- Zero-hassle branded gifting for companies of any size
- Bulk and individual gifting from a single dashboard
- AI-generated previews so customers know exactly what they're ordering
- Flexible recipient management — individuals, teams, or CSV bulk upload
- Transparent order tracking from customization to doorstep

---

## 2. Platform Overview

### 2.1 Problem Statement

Corporate gifting is time-consuming, fragmented, and hard to brand consistently. HR teams spend hours coordinating vendors, marketing teams struggle with brand-consistent swag, and individual senders have no easy way to personalize gifts at scale.

### 2.2 Solution

A single platform where any user can:
- Browse a curated catalog of giftable products and pre-made bundles
- Customize products with their logo and a personalized message
- See an AI-generated preview of the final branded product before ordering
- Send gifts to one person or hundreds — with address collection handled automatically
- Track every order in real time

### 2.3 Target Audience

| Segment | Use Case |
|---|---|
| Corporate HR Teams | Employee onboarding kits, birthday gifts, work anniversaries, holiday gifting |
| Marketing Teams | Client appreciation gifts, event giveaways, branded swag |
| Individual Shoppers | Personal gifts for family and friends with a premium, personalized touch |
| Small Business Owners | Customer thank-you gifts, team recognition |

### 2.4 Platform Access

- **Web app** (primary) — fully responsive
- **Mobile web** — optimized experience on iOS and Android browsers
- **Native mobile apps** — v2 roadmap

---

## 3. User Roles & Personas

### 3.1 Role Definitions

| Role | Description | Key Permissions |
|---|---|---|
| **Super Admin** | Platform operator (internal team) | Full access to all tenants, billing, catalog management |
| **Organization Admin** | Company account owner | Manage team members, budgets, billing, view all orders |
| **Team Manager** | Department-level user | Manage recipients within their team, place bulk orders, view team spend |
| **Standard User** | Employee or individual | Browse catalog, place individual orders, manage own recipients |
| **Guest** | Unauthenticated visitor | Browse catalog, view bundles, cannot order |

### 3.2 Personas

**Persona 1 — Sarah, HR Manager**
- Sends onboarding kits to 20+ new employees every month
- Needs bulk recipient upload, consistent branding across all kits, and delivery confirmation per recipient
- Pain points: chasing addresses, inconsistent packaging, manual tracking

**Persona 2 — David, Marketing Lead**
- Orders branded gifts for key client milestones and events
- Needs high-quality product previews to get stakeholder approval before ordering
- Pain points: back-and-forth with designers, long lead times, vendor coordination

**Persona 3 — Amara, Individual Shopper**
- Wants to send a curated gift bundle to a family member abroad
- Needs simple checkout, gifting message, and real-time delivery tracking
- Pain points: generic gifts, no personalization, no visibility into delivery

---

## 4. Feature Specifications

---

### 4.1 Authentication & Onboarding

#### 4.1.1 Sign Up / Login

- Email + password registration
- Google OAuth and Microsoft OAuth (SSO for corporate users)
- Magic link (passwordless) login option
- Two-factor authentication (2FA) — optional for standard users, enforceable by Organization Admin

#### 4.1.2 Organization Onboarding

When a new **Organization Admin** signs up:

1. Enter company name, size (employee count range), and industry
2. Upload company logo (used as default in customization canvas)
3. Set primary brand color (hex code or color picker)
4. Invite team members by email (optional, can skip)
5. Set default billing method
6. Optionally set a gifting budget per team or per order

#### 4.1.3 Individual User Onboarding

1. Enter name and email
2. Verify email address
3. Enter shipping address for self-gifts (optional)
4. Proceed to catalog

#### 4.1.4 Profile Management

- Update personal information
- Change password / connected SSO accounts
- Manage notification preferences
- Saved addresses book
- Saved payment methods

---

### 4.2 Product Catalog

#### 4.2.1 Catalog Browsing

- Grid and list view toggle
- Filter by: category, price range, customizable (yes/no), bundle vs individual
- Sort by: price (low–high, high–low), popularity, newest, best rated
- Search by product name or keyword
- Featured / curated collections (e.g., "Top Employee Gifts", "Holiday Picks", "Premium Swag")

#### 4.2.2 Product Categories

| Category | Examples |
|---|---|
| Apparel | T-shirts, hoodies, caps, jackets |
| Drinkware | Mugs, tumblers, water bottles, wine glasses |
| Tech Accessories | USB hubs, wireless chargers, earbuds, laptop sleeves |
| Stationery | Notebooks, pens, planners, sticky notes |
| Wellness | Candles, bath sets, essential oils |
| Food & Beverage | Coffee sets, chocolate boxes, tea collections, snack boxes |
| Premium / Luxury | Leather goods, watches, gift hampers |
| Digital / E-gifts | Gift cards, experience vouchers |

#### 4.2.3 Product Detail Page

- High-resolution product images (multiple angles)
- Product title, description, and specifications (material, dimensions, weight)
- Customization availability badge (e.g., "Logo + Text Customizable")
- Pricing: unit price, bulk pricing tiers (e.g., 1–9 units, 10–49 units, 50+ units)
- Minimum order quantity (if applicable)
- Lead time estimate (standard / express)
- Availability / stock status
- Related products
- Customer reviews and ratings
- "Add to Bundle" and "Customize & Order" CTAs

#### 4.2.4 Wishlist / Save for Later

- Users can save products to a personal wishlist
- Organization Admins can save to a shared company wishlist/catalog

---

### 4.3 Bundle Builder

#### 4.3.1 Pre-Made Bundles

- Platform curates ready-to-order bundles (e.g., "New Hire Welcome Kit", "Client Thank-You Box", "Holiday Hamper")
- Each bundle has a cover image, title, item list, and total price
- Bundles are customizable as a whole (logo + message applied to all eligible items)
- Bundle detail page shows each included item with images and descriptions

#### 4.3.2 Custom Bundle Builder

Users can create their own bundle from scratch:

1. Click "Build Your Own Bundle"
2. Browse catalog and add products (minimum 2, maximum defined per plan)
3. View bundle summary panel (items, quantities, subtotal)
4. Name the bundle (e.g., "Q4 Client Kit")
5. Save bundle for reuse or proceed to customization
6. Saved bundles appear in "My Bundles" section

#### 4.3.3 Bundle Pricing

- Bundle price = sum of individual item prices minus any bundle discount (configurable by Admin)
- Bulk bundle pricing tiers apply (e.g., order 50+ bundles, get 15% off)
- Price breakdown visible before checkout

---

### 4.4 Customization Canvas & AI Preview

This is the platform's primary differentiator. The goal is maximum output quality with minimum user effort. The canvas is built around a two-layer input model: a **free-form intent layer** where users describe what they want in plain language, and a **structured input layer** where they provide the concrete assets and values. Together these two layers are sent to the AI to generate the preview.

#### 4.4.1 Entry Points

- From a product detail page → "Customize & Preview"
- From bundle detail page → "Customize Bundle"
- From the order flow at the customization step

---

#### 4.4.2 Intent & Preference Prompt *(Primary Input — shown first)*

> **What is this?**
> Before filling any structured field, users are invited to describe their customization vision in their own words — as naturally as writing a note to a designer. This prompt sits at the very top of the canvas panel and acts as the creative brief that drives the entire AI generation. All other inputs below refine and ground the prompt with exact values.

##### UI Presentation

- Large multi-line text area at the top of the canvas, visually distinct from the structured fields below (e.g., light blue tinted background, label: **"Describe what you want →"**)
- Placeholder copy to guide first-time users:
  > *"Tell us what you have in mind — e.g., 'I want our logo centered on the front in white with a dark navy background, and the tagline below it in gold. This is a premium gift for our top clients for the holiday season.'"*
- Character limit: 500 characters
- An optional **"Inspire me"** button generates a short example prompt based on the selected product type and occasion (if occasion was specified earlier in the flow)
- Live character counter
- The field auto-saves as the user types (no data lost on accidental navigation)

##### What Users Can Express in the Prompt

Users can use the intent prompt to communicate any or all of the following:

| Intent Type | Example Input |
|---|---|
| **Placement & composition** | "Logo on the left chest, text centered below it" |
| **Color & mood** | "Dark background, gold text, luxury premium feel" |
| **Occasion or context** | "This is for a new hire welcome kit, should feel warm and exciting" |
| **Style direction** | "Minimalist and clean — don't overcrowd the product" |
| **Relative sizing** | "Make the logo large and prominent, the tagline smaller" |
| **What to avoid** | "Don't add any extra decorative elements, keep it simple" |
| **Tone** | "Professional and corporate" or "Fun and playful for a team celebration" |
| **Product-specific intent** | "On the mug, I want the design to wrap around so it's visible from both sides" |
| **Multi-element arrangement** | "Logo on top, company name in the middle, tagline at the bottom" |

##### How the Prompt Interacts with Structured Inputs

The intent prompt is the **creative direction**; the structured fields below are the **exact parameters**. The rules for how they interact:

- If the prompt mentions a color and the user also sets a color in the color picker → **structured field wins** for that exact value; prompt's color guidance is used for surrounding style
- If the prompt describes text content but the user also fills in Text Line 1 → **structured field wins** for exact wording; prompt guides how it is styled
- If the prompt mentions placement and no structured placement is selected → **prompt is used as-is** by the AI
- If the prompt contradicts the uploaded logo (e.g., "no logo" when a logo is uploaded) → the system shows an inline warning: *"You've described no logo, but a logo file is uploaded. Remove the file or update your description."*

##### Prompt Quality Signals

To help users write better prompts without overwhelming them:

- After typing, a small AI-powered **"Clarity Score"** (Low / Good / Detailed) appears beside the field with a brief tip, e.g.:
  - Low: *"Try adding a color preference or placement hint"*
  - Good: *"Nice! Mention the occasion or mood to improve results"*
  - Detailed: *"Great detail — your preview should match closely"*
- This is displayed as a subtle badge; it never blocks or gates the user from proceeding

---

#### 4.4.3 Structured Customization Inputs *(Secondary Inputs — shown below the intent prompt)*

These fields give the AI exact, non-ambiguous values to use. They complement the intent prompt rather than replace it.

| Input | Details |
|---|---|
| **Logo Upload** | PNG, JPG, or SVG; max 10 MB; transparent background recommended. Shows thumbnail after upload with a remove button. |
| **Custom Text Line 1** | Primary text — e.g., company name, recipient name (max 40 chars). Label: *"Main text (printed on product)"* |
| **Custom Text Line 2** | Secondary text — e.g., tagline, event name, date (max 60 chars). Label: *"Supporting text (optional)"* |
| **Personal Message** | Free-text gift message — not printed on product; included on the packaging insert note. (max 200 chars) |

**Optional secondary controls** (collapsed by default under an "Advanced Options" toggle):

| Control | Options |
|---|---|
| **Logo placement hint** | Front / Back / Sleeve / Left Chest / Right Chest / Center |
| **Text color preference** | Auto (AI picks contrast-optimized color) / Custom hex input + color picker |
| **Background treatment** | No change / Subtle pattern / Solid color fill (hex input) |
| **Font style hint** | Auto / Serif (classic) / Sans-serif (modern) / Bold display / Script (elegant) |

> **Design note:** Advanced Options are intentionally hidden by default to keep the experience light. Power users (e.g., marketing teams with brand guidelines) can expand them; casual users get great results from just the prompt + logo + text.

---

#### 4.4.4 Input Panel Layout (Visual Hierarchy)

The canvas panel is split into two columns on desktop, stacked on mobile:

```
┌──────────────────────────────────────────────────────┐
│  LEFT PANEL — Inputs                                 │
│  ┌────────────────────────────────────────────────┐  │
│  │  💬 Describe what you want  [Inspire me]       │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │ "Logo centered in white on dark navy,    │  │  │
│  │  │  tagline below in gold. Holiday feel."   │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │  Clarity: ● Good  "Add placement to improve"   │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─────────────────────┐  ┌────────────────────────┐ │
│  │  📎 Upload Logo     │  │  Text Line 1           │ │
│  │  [Drop file here]   │  │  [Company Name...]     │ │
│  └─────────────────────┘  └────────────────────────┘ │
│                            ┌────────────────────────┐ │
│                            │  Text Line 2 (optional)│ │
│                            │  [Tagline...]          │ │
│                            └────────────────────────┘ │
│                            ┌────────────────────────┐ │
│                            │  🎁 Gift message       │ │
│                            │  [Not printed on item] │ │
│                            └────────────────────────┘ │
│  ▼ Advanced Options                                  │
│                                                      │
│  [  Generate Preview  ]                              │
│                                                      │
│  RIGHT PANEL — Live Preview                          │
│  ┌────────────────────────────────────────────────┐  │
│  │                                                │  │
│  │          AI-Generated Product Preview          │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│  [Regenerate]  [Adjust]  [Download PNG]              │
│                          [✓ Approve & Continue]      │
└──────────────────────────────────────────────────────┘
```

---

#### 4.4.5 AI Preview Generation

Once inputs are provided, the user clicks **"Generate Preview"**:

1. The platform packages the intent prompt + all structured inputs + product base image into a generation request
2. The AI interprets the intent prompt as the creative brief and uses structured fields as exact constraints
3. AI composites the logo and text onto the product photorealistically, following the described mood, placement, and style
4. Preview image renders within 5–10 seconds
5. User can view at full size, zoom in, and rotate (for 3D products)
6. A brief one-line **AI interpretation summary** is shown below the preview, e.g.: *"Applied: logo centered front, white on navy, gold tagline, holiday seasonal composition"* — so users can confirm the AI understood their intent correctly

**Preview controls:**

| Control | Action |
|---|---|
| **Regenerate** | Re-runs AI with same inputs for a visual variation |
| **Adjust** | Returns to input panel to edit prompt, logo, or text and re-generate |
| **Download PNG** | Saves preview locally for internal stakeholder approval |
| **Approve & Continue** | Locks in the design and advances to the ordering step |

**If the preview does not match intent:** Users click Adjust, refine their intent prompt (e.g., add more specificity), and regenerate. The previous preview is kept visible alongside the new one for comparison.

---

#### 4.4.6 Bundle Preview

For bundles, the AI generates a composite preview showing all items in the bundle arranged together (like an unboxed flat-lay), with branding applied to all eligible items according to the same intent prompt and structured inputs. A carousel below the flat-lay allows viewing each individual item's preview in isolation.

---

#### 4.4.7 Preview Persistence & Design Library

- Approved previews are saved to the user's account under **"My Designs"**
- Each saved design stores: intent prompt text, structured inputs, product SKU, and generated preview image
- Designs can be reused for future orders without re-generating
- Users can duplicate a design and modify the intent prompt to create variations
- Designs are linked to a specific product SKU; if the product is updated or retired, the design is flagged: *"Product updated — regenerate preview to confirm it still looks right"*
- Organization Admins can **promote a design to a Company Template**, making it available to all team members as a starting point (with the logo and brand settings pre-filled)

---

### 4.5 Gifting & Ordering Flow

#### 4.5.1 Gifting Modes

| Mode | Description |
|---|---|
| **Single Gift** | Send one gift to one recipient |
| **Bulk Gift** | Send the same gift to multiple recipients (team, employees, client list) |
| **Self Order** | Order for personal use / storage (no recipient required) |
| **Scheduled Gift** | Set a future delivery date (birthday, anniversary, holiday) |

#### 4.5.2 Order Flow — Step by Step

**Step 1: Select Product or Bundle**
- User selects from catalog or uses a saved bundle/design

**Step 2: Customize**
- Upload logo, enter text, generate AI preview (Section 4.4)
- Approve preview

**Step 3: Add Recipients**
- Single mode: enter recipient name, email, and shipping address (or select from address book)
- Bulk mode: upload CSV or select from saved recipient groups (see Section 4.6)
- Address collection option: platform sends an email to recipients asking them to fill in their address — sender never needs to know the address

**Step 4: Set Quantity & Delivery Options**
- Quantity (auto-filled from recipient count in bulk mode)
- Delivery speed: Standard (5–7 days), Express (2–3 days), Overnight
- Delivery date: standard (ASAP) or scheduled date picker

**Step 5: Add Gift Note**
- Personal message per recipient (in single mode)
- Global message for all recipients (in bulk mode), with optional per-recipient override via CSV column

**Step 6: Review & Pricing Summary**
- Itemized cost: product price + customization fee + shipping + taxes
- Bulk discount applied if eligible
- Promo code / voucher field
- Gift wrapping add-on (premium option)

**Step 7: Payment**
- Credit/debit card, bank transfer, or company account balance
- Save card option
- Invoice generation for corporate orders

**Step 8: Confirmation**
- Order confirmation screen with order ID
- Summary email sent to sender
- Recipient notification emails sent (or queued for scheduled orders)

#### 4.5.3 Address Collection via Link

When the sender does not have recipient addresses:
- Platform generates a unique address collection link per recipient
- Recipient receives an email: "You have a gift coming! Please enter your delivery address."
- Recipient fills in the form (name, address, apartment, city, country, postal code)
- Once address is submitted, order moves to fulfillment
- Sender is notified when each recipient submits their address
- Deadline can be set; unsubmitted after deadline are flagged for sender action

---

### 4.6 Recipient Management

#### 4.6.1 Address Book

- Add individual recipients manually (name, email, phone, address)
- Edit and delete contacts
- Tag contacts (e.g., "Client", "Employee", "VIP")
- Search and filter contacts by name, tag, or company

#### 4.6.2 Groups

- Create named groups (e.g., "Engineering Team", "Q4 Clients", "London Office")
- Add/remove recipients from groups
- Use a group as recipients in bulk gifting flow in one click

#### 4.6.3 CSV Bulk Import

- Download CSV template with required columns: `First Name`, `Last Name`, `Email`, `Phone`, `Address Line 1`, `Address Line 2`, `City`, `State/Province`, `Country`, `Postal Code`, `Custom Message` (optional)
- Upload CSV — system validates rows and shows errors (missing required fields, invalid email format, etc.)
- Preview imported recipients before confirming
- Duplicates are detected and flagged (match by email)
- Option to auto-create a group from the import

#### 4.6.4 HRIS / Directory Integration *(v1.1)*

- Integration with BambooHR, Workday, and ADP to sync employee data
- Automatic sync on a set schedule (daily / weekly)
- New employees automatically added to a designated onboarding group

---

### 4.7 Order Management & Tracking

#### 4.7.1 Order List View

- Displays all orders (sender's view) with: Order ID, date, recipient(s), product/bundle name, status, total cost
- Filter by: status, date range, recipient, product
- Sort by: date, amount, status
- Export order history as CSV or PDF

#### 4.7.2 Order Statuses

| Status | Description |
|---|---|
| `Draft` | Order started but not submitted |
| `Awaiting Address` | Waiting for recipient to submit delivery address |
| `Processing` | Payment confirmed; order being prepared |
| `In Production` | Customization/branding being applied |
| `Shipped` | Order dispatched; tracking number assigned |
| `Delivered` | Confirmed delivered by courier |
| `Cancelled` | Order cancelled before production |
| `Refund Requested` | Return/refund initiated |

#### 4.7.3 Order Detail Page

- Full order summary (products, customization, recipients, pricing)
- Shipment tracking section per recipient (for bulk orders, per-recipient tracking)
- Tracking timeline: ordered → in production → shipped → out for delivery → delivered
- Live tracking map embed (where supported by carrier)
- Option to re-order (reuse the same design and product)
- Option to cancel (only if status is `Processing` or earlier)
- Download invoice / receipt

#### 4.7.4 Recipient View

Recipients receive a **gift tracking link** via email:
- Branded tracking page showing sender's company name/logo
- Gift status and estimated delivery date
- Ability to confirm receipt
- Optional: leave a thank-you message to the sender

---

### 4.8 Dashboard & Analytics

#### 4.8.1 Sender Dashboard (All Users)

- Overview cards: Total Orders, Total Spent, Gifts Delivered, Pending
- Recent orders list
- Quick actions: New Order, Reorder Last Gift, View Bundles
- Saved designs carousel
- Upcoming scheduled gifts

#### 4.8.2 Organization Admin Dashboard

- All metrics from Sender Dashboard, aggregated across the organization
- Team spend breakdown (by department/team manager)
- Top products ordered
- Monthly / quarterly gifting spend trend chart
- Budget utilization per team (if budgets are configured)
- Recipient reach map (geographic distribution of deliveries)

#### 4.8.3 Analytics & Reports

Available reports (downloadable as CSV or PDF):

| Report | Description |
|---|---|
| Order Summary | All orders in a date range with full details |
| Spend by Team | Breakdown of gifting spend per department |
| Product Popularity | Most-ordered products and bundles |
| Delivery Performance | On-time delivery rate, average delivery time |
| Recipient Engagement | Thank-you message rate, address submission rate |
| Budget Report | Budget vs. actual spend per team |

---

### 4.9 Payments & Billing

#### 4.9.1 Payment Methods

- Credit / Debit card (Visa, Mastercard, Amex)
- Bank transfer (for large corporate orders, with NET 30 invoicing)
- Company account balance (prepaid credits)
- Gift vouchers / promo codes

#### 4.9.2 Corporate Billing

- Organization Admin can set up centralized billing
- Monthly invoice consolidating all team orders
- PO number field for enterprise procurement workflows
- Itemized invoices with per-recipient or per-order breakdown
- Tax handling: auto-detect VAT/GST based on shipping destination

#### 4.9.3 Budget Management

- Org Admins can set gifting budgets per team or per user per month/quarter
- Budget usage shown as a progress bar in the dashboard
- Email alerts at 75% and 100% budget utilization
- Orders that would exceed budget require Admin approval

#### 4.9.4 Refunds & Credits

- Refund policy: full refund if cancelled before `In Production` status
- Partial refund if product defect is reported with photo evidence
- Refunds issued to original payment method within 5–7 business days
- Platform credits issued for minor issues (e.g., slight print variation)

---

### 4.10 Notifications & Communications

#### 4.10.1 Sender Notifications

| Trigger | Channel |
|---|---|
| Order confirmed | Email + in-app |
| Address collected from recipient | Email |
| Order shipped | Email + in-app + SMS (optional) |
| Order delivered | Email + in-app |
| Recipient left a thank-you message | Email + in-app |
| Budget threshold reached | Email |
| Upcoming scheduled gift reminder (3 days before) | Email + in-app |

#### 4.10.2 Recipient Notifications

| Trigger | Channel |
|---|---|
| Gift is on its way (with tracking link) | Email |
| Address collection request | Email |
| Delivery out for delivery today | Email + SMS (optional) |
| Delivery confirmed | Email |

#### 4.10.3 Notification Preferences

- Users can opt in/out of each notification type
- Choose preferred channels: email, SMS, in-app
- Org Admins can enforce required notifications for corporate orders

#### 4.10.4 Branded Recipient Emails

- All recipient-facing emails are white-labeled with the sender's company name and logo
- Configurable subject lines and greeting text
- Org Admins can upload custom email header/footer

---

### 4.11 Admin Panel

This is the internal platform operator panel (Super Admin access only, not visible to customers).

#### 4.11.1 Product Management

- Add, edit, and archive products
- Manage product images (upload multiple angles, specify base image for AI canvas)
- Set pricing and bulk pricing tiers
- Configure which products support customization (logo placement zones, AI generation parameters)
- Manage product categories and tags
- Inventory / availability management

#### 4.11.2 Bundle Management

- Create and edit pre-made bundles
- Set bundle pricing and discounts
- Feature bundles on the homepage or collections
- Archive/deactivate bundles

#### 4.11.3 Order Fulfillment

- View all orders across all customers in a unified queue
- Filter by status, urgency, or fulfillment partner
- Update order status (trigger customer notifications automatically)
- Assign orders to fulfillment partners or warehouses
- Bulk status update for production batches
- Flag orders with issues (damaged, out of stock, address error)

#### 4.11.4 Customer Management

- View and search all registered users and organizations
- View customer order history, spend, and account status
- Suspend or deactivate accounts
- Manually apply credits or refunds
- Impersonate a user account (for support purposes, with audit log)

#### 4.11.5 Discount & Promotions

- Create promo codes (percentage or fixed amount, per-use or multi-use)
- Set expiry dates, minimum order value, and product/category restrictions
- View promo code usage and redemption stats

#### 4.11.6 Platform Analytics

- Total GMV (Gross Merchandise Value) by period
- New vs. returning customers
- Top-performing products and bundles
- Average order value
- Fulfillment SLA compliance
- Geographic revenue breakdown

---

## 5. Key User Flows

### 5.1 First-Time Corporate Order (Bulk Gifting)

```
Sign Up / Log In
      ↓
Complete Organization Onboarding (company name, logo, brand color)
      ↓
Browse Catalog → Select Bundle (e.g., "New Hire Kit")
      ↓
Customization Canvas → Upload Logo → Enter "Welcome to the Team!" text
      ↓
Generate AI Preview → Approve Preview
      ↓
Select Gifting Mode: Bulk
      ↓
Upload CSV of new employee names + emails (no addresses yet)
      ↓
Enable Address Collection → Set deadline
      ↓
Select delivery: Standard
      ↓
Enter global gift message: "We're so excited to have you join us!"
      ↓
Review Order Summary → Apply promo code
      ↓
Pay via Company Account
      ↓
Order Confirmed → Employees receive address collection emails
      ↓
Addresses collected → Orders enter production
      ↓
Track per-employee delivery status from dashboard
```

### 5.2 Individual Gifting Flow

```
Browse Catalog → Select product
      ↓
View Product Detail Page
      ↓
Click "Customize & Preview"
      ↓
Upload personal photo or logo → Enter recipient name
      ↓
Generate AI Preview → Approve
      ↓
Enter recipient name, email, shipping address
      ↓
Enter gift message: "Happy Birthday!"
      ↓
Select Express Delivery
      ↓
Pay by credit card
      ↓
Recipient receives gift tracking email
      ↓
Recipient receives gift → Sends thank-you note
      ↓
Sender notified of thank-you
```

### 5.3 Re-Order Saved Design

```
Log In → Dashboard
      ↓
Navigate to "My Designs"
      ↓
Select saved design (previously approved AI preview)
      ↓
Click "Reorder"
      ↓
Select recipients (address book or new CSV)
      ↓
Confirm quantity and delivery options
      ↓
Pay → Order placed
```

---

## 6. Technical Architecture

### 6.1 High-Level Stack (Recommended)

| Layer | Technology |
|---|---|
| **Frontend** | React (Next.js) — SSR for catalog pages, CSR for canvas/dashboard |
| **Mobile Web** | Responsive React — same codebase, Tailwind CSS |
| **Backend API** | Node.js (Express or Fastify) or Python (FastAPI) |
| **Database** | PostgreSQL (transactional data) + Redis (sessions, caching) |
| **File Storage** | AWS S3 or Cloudflare R2 (logos, preview images, product assets) |
| **AI Preview** | Anthropic Claude API (image understanding) + Stability AI or DALL·E for image generation, or a custom ComfyUI pipeline |
| **Payments** | Stripe (cards, invoicing, payouts) |
| **Email** | SendGrid or Postmark (transactional) + customer branding layer |
| **SMS** | Twilio |
| **Shipping / Tracking** | EasyPost or Shippo (multi-carrier API) |
| **Auth** | Auth0 or Clerk (social login, SSO, 2FA) |
| **Analytics** | Mixpanel (product analytics) + internal Postgres for business reports |
| **CDN** | Cloudflare |

### 6.2 AI Preview Pipeline

```
User Input Layer 1 — Intent Prompt (free-form natural language, max 500 chars)
User Input Layer 2 — Structured Inputs (logo file, text line 1, text line 2, placement hint, color)
Product Context — selected product SKU, category, customizable zones metadata
      ↓
Backend: validate and preprocess
  - Sanitize and tokenize intent prompt
  - Resize and strip metadata from logo file
  - Sanitize text strings
  - Retrieve product base image + placement zone map from S3
      ↓
Prompt Construction Service
  - Merges intent prompt + structured inputs into a unified generation prompt
  - Structured fields override any conflicting values mentioned in the intent prompt
  - Product placement zone map constrains where logo/text can be applied
  - Output: a structured generation payload (system prompt + image assets + parameters)
      ↓
AI Generation Service (one of):
  - Option A: Fine-tuned diffusion model (Stable Diffusion + ControlNet) with inpainting
  - Option B: Generative Fill API (Adobe Firefly, Gemini Imagen 3)
  - Option C: Claude with vision + Stable Diffusion XL pipeline (intent parsed by LLM, image generated by diffusion)
      ↓
Post-Processing
  - Quality check: resolution, logo legibility, text readability (automated)
  - Flagged if quality score < threshold → auto-retry once with adjusted parameters
      ↓
AI Interpretation Summary generated (short text: "Applied: centered logo, navy background, gold tagline")
      ↓
Preview image + summary stored in S3 with TTL (30 days if not approved)
      ↓
Approved previews stored permanently, linked to Design record in DB
  (Design record stores: intent_prompt, structured_inputs JSON, product_sku, preview_url)
      ↓
URL + interpretation summary returned to frontend → displayed in canvas preview panel
```

### 6.3 Core Data Models

```
User
  id, email, name, role, organization_id, created_at

Organization
  id, name, logo_url, brand_color, billing_plan, created_at

Product
  id, name, category, description, base_price, sku, is_customizable, placement_zones[], images[]

Bundle
  id, name, type (preset | custom), items[{product_id, quantity}], price, created_by

Design
  id, user_id, product_id | bundle_id,
  intent_prompt (free-form text, max 500 chars),
  logo_url, text_line_1, text_line_2,
  placement_hint, text_color, font_style_hint,
  ai_interpretation_summary,
  preview_image_url, status (draft | approved), created_at

Order
  id, user_id, org_id, design_id, gifting_mode, status, total_amount,
  delivery_speed, scheduled_at, created_at

OrderRecipient
  id, order_id, recipient_name, email, phone, address{}, status,
  tracking_number, carrier, gift_message, address_submitted_at, delivered_at

Recipient (Address Book)
  id, user_id, name, email, phone, address{}, tags[], created_at

RecipientGroup
  id, user_id | org_id, name, members[recipient_id]
```

---

## 7. Non-Functional Requirements

### 7.1 Performance

- Page load time: < 2 seconds on a standard 4G connection
- AI preview generation: < 10 seconds from submission to display
- API response time: < 300ms for 95th percentile
- Dashboard load with 500+ orders: < 3 seconds

### 7.2 Scalability

- System must handle 10,000 concurrent users without degradation
- Bulk orders up to 10,000 recipients per single order
- AI preview queue with autoscaling workers (no request dropped; queued if busy)

### 7.3 Security

- All data encrypted in transit (TLS 1.3) and at rest (AES-256)
- PCI-DSS compliance for payment handling (handled via Stripe)
- SOC 2 Type II compliance target within 12 months of launch
- Role-based access control (RBAC) strictly enforced at API level
- Uploaded logos and files scanned for malware before processing
- GDPR and CCPA compliance: data export, deletion on request
- Rate limiting on all public APIs

### 7.4 Availability

- Target uptime: 99.9% (SLA for paid plans)
- Automated failover for database and key services
- Maintenance windows communicated 48 hours in advance

### 7.5 Accessibility

- WCAG 2.1 AA compliance across all web pages
- Screen reader support for all interactive elements
- Keyboard-navigable UI throughout

### 7.6 Internationalization

- Currency support: USD, EUR, GBP, ETB, and others configurable
- Language: English (v1); Arabic, French, Spanish (v1.1 roadmap)
- International shipping address format support
- Locale-based date and number formatting

---

## 8. Future Roadmap

### v1.1 (3–6 months post-launch)

- HRIS integrations (BambooHR, Workday, ADP)
- Native iOS and Android apps
- Additional languages (Arabic, French)
- Advanced canvas controls (color theme selection, font choice)
- Gift experience page — recipient sees animated unboxing before physical delivery

### v1.2 (6–9 months)

- Marketplace model — third-party vendors can list products
- Subscription gifting (recurring monthly/quarterly gift programs)
- API access for enterprise customers to integrate platform into their internal tools
- Zapier and HubSpot integrations

### v2.0 (12+ months)

- AI gift recommendations ("best gift for a software engineer who loves coffee")
- White-label platform for resellers
- NFT or digital collectible gifting module
- Real-time gift budget allocation and approval workflows
- Corporate social responsibility (CSR) gifting — link gifts to charitable donations

---

*This document is intended as a living specification. All feature details are subject to revision based on user research, technical constraints, and business priorities. Each feature section should be accompanied by detailed wireframes and acceptance criteria before development begins.*

---

**Document Owner:** Product Team
**Last Updated:** May 2026
**Next Review:** June 2026
