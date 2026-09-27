# Funds Guru (fundsguru.in) - Elevated Website & Webmail Dispatch Engine

> **A luxury, high-conversion redesign for Funds Guru** — Chartered Financial Advisory, Statutory Compliance (ITR/GST), Business Incorporation, and Specialized Cyber Cell Bank Account Defreezing Legal Assistance in Ludhiana, Punjab.

---

## 🌟 Key Upgrades & Aesthetic Features

- **Fintech & Legal Prestige Design**: Curated color palette (Deep Midnight Sapphire `#0B132B`, Royal Amber Gold `#D97706` / `#F59E0B`, Emerald Trust `#10B981`, and Ruby Alert `#DC2626`).
- **Typography & Aesthetics**: Google Fonts (*Outfit* for authoritative headlines, *Plus Jakarta Sans* for readable body text), smooth micro-interactions, and glassmorphism.
- **Dark / Light Mode**: Integrated theme toggle with persistence in `localStorage`.
- **Specialized Cyber Cell Emergency Desk**: Dedicated legal action section & standalone intake page (`cyber-cell-help.html`) for accounts frozen under **Section 91 / 102 CrPC**, P2P disputes, and gaming app complaints.
- **Interactive Financial Calculators**:
  - **Loan EMI Calculator**: Sliders for Loan Amount (₹1L to ₹5Cr), Interest Rate, and Tenure with instant monthly EMI breakdown.
  - **GST Estimator**: Real-time calculation across 5%, 12%, 18%, and 28% slabs with CGST/SGST breakdown.
- **Multi-Page Architecture**:
  - `index.html`: Flagship landing page with hero quick-quote, trust metrics, service tabs, calculators, and client reviews.
  - `cyber-cell-help.html`: Urgent intake desk for frozen bank accounts and police notice drafting.
  - `services.html`: Full catalogue covering Banking (CMA, DPR, Net Worth Certificates), Taxation (ITR, GST), Registrations (Pvt Ltd, Udyam, FSSAI, LEI), and Legal Agreements.
  - `about.html`: Firm philosophy, mission, and Ludhiana headquarters profile.
  - `contact.html`: Interactive contact desk with Google Maps integration and direct webmail dispatch.

---

## 📧 Webmail Dispatch Architecture (info@fundsguru.in)

As requested, **all form submissions and contact data go directly to the official domain webmail**: `info@fundsguru.in`.

This is implemented with a multi-tier fallback architecture:

```
[User Submits Form]
         │
         ├──► 1. Node.js Express Server (/api/contact)
         │       └─ Uses Nodemailer SMTP -> info@fundsguru.in
         │
         ├──► 2. cPanel PHP Mailer (mail.php)
         │       └─ Formatted HTML email via PHP mail() -> info@fundsguru.in
         │
         └──► 3. Local Lead Archiving (data/webmail_inbox.json & LocalStorage)
                 └─ Every submission is permanently recorded so NO inquiry is ever lost!
```

### 1. For cPanel / Apache / PHP Hosting (WordPress or Static Web Server)
- Upload all files including `mail.php` to `public_html` via cPanel File Manager or FTP.
- When a user submits any form on the website, `assets/js/main.js` dispatches a POST request to `mail.php`.
- `mail.php` formats an HTML email with all client details, phone, urgency rating, notice details, and timestamp, and delivers it straight to `info@fundsguru.in`.

### 2. For Node.js Hosting / Local Development
- Run `npm start` or `node server.js`.
- If SMTP credentials are configured in `.env`, Nodemailer connects directly to `mail.fundsguru.in` on port 465/587 and delivers the email.
- You can inspect all submitted inquiries via `GET /api/webmail-inbox`.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the web application server
npm start
```

Visit: `http://localhost:3000`

---

## 🏢 Corporate Location Details

**Funds Guru**  
Shop No. 14, First Floor, Jagdambey Market,  
Near Subway, Basti Jodhewal,  
Ludhiana, Punjab – 141007, India  
Webmail: **info@fundsguru.in**  
Helpline: **+91 98765 43210**  
Website: **fundsguru.in**
