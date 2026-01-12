# Billing System

A comprehensive billing application where users can create their own organizations, add branches, manage branch types, add products to each branch, generate invoices, and view an overall dashboard with sales statistics.

## Features

- **User Management**: Register and login system
- **Organizations**: Create and manage multiple organizations
- **Branch Types**: Define custom branch types for each organization
- **Branches**: Add branches to organizations with customizable bill settings (color, font, icon)
- **Products**: Add products to each branch with pricing, tax rates, and stock management
- **Invoices**: Generate invoices with customizable bill structure based on branch settings
- **Dashboard**: View overall sales statistics, sales by branch, recent invoices, and monthly sales

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: MySQL
- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **API**: RESTful API

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Setup Steps

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Create a MySQL database
   - Import the database schema:
     ```bash
     mysql -u root -p < database.sql
     ```
   - Or run the SQL file in your MySQL client

4. **Configure environment variables**
   - Create a `.env` file in the root directory:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=billing_system
     PORT=3000
     ```

5. **Start the server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open your browser and navigate to: `http://localhost:3000`
   - Default login credentials:
     - Username: `admin`
     - Password: `admin123`

## Usage

### 1. Login/Register
- Use the default admin credentials or register a new account
- After login, you'll be redirected to the dashboard

### 2. Create Organization
- Navigate to "Organizations" from the sidebar
- Click "Add Organization" and fill in the details
- Save the organization

### 3. Create Branch Types
- Navigate to "Branch Types" from the sidebar
- Select an organization
- Click "Add Branch Type" and define the type (e.g., "Retail", "Warehouse", "Online")

### 4. Add Branches
- Navigate to "Branches" from the sidebar
- Click "Add Branch"
- Select an organization and branch type
- Configure branch details including:
  - **Bill Color**: Color scheme for invoices
  - **Bill Font**: Font family for invoices
  - **Bill Icon**: URL to logo/icon for invoices

### 5. Add Products
- Navigate to "Products" from the sidebar
- Select a branch
- Click "Add Product"
- Enter product details (name, price, tax rate, stock quantity, unit)

### 6. Generate Invoice
- Navigate to "Invoices" from the sidebar
- Select a branch
- Click "Create Invoice"
- Fill in customer details
- Add products and quantities
- The invoice will automatically calculate subtotal, tax, and total
- Apply discount if needed
- Save the invoice

### 7. View Dashboard
- The dashboard shows:
  - Total branches, products, invoices, and sales
  - Sales breakdown by branch
  - Recent invoices
  - Monthly sales trends

### 8. View/Print Invoice
- Click "View" on any invoice
- The invoice will display with the branch's custom settings (color, font, icon)
- Click "Print" to print the invoice

## Project Structure

```
billing-system/
├── server.js              # Express server and API routes
├── database.sql           # Database schema
├── package.json          # Node.js dependencies
├── .env                  # Environment variables (create this)
├── public/
│   ├── index.html        # Login/Register page
│   ├── dashboard.html    # Main application page
│   ├── styles.css        # Stylesheet
│   └── app.js            # Frontend JavaScript
└── README.md             # This file
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Organizations
- `GET /api/organizations/:userId` - Get user's organizations
- `POST /api/organizations` - Create organization
- `PUT /api/organizations/:id` - Update organization

### Branch Types
- `GET /api/branch-types/:organizationId` - Get branch types
- `POST /api/branch-types` - Create branch type

### Branches
- `GET /api/branches/:organizationId` - Get branches
- `POST /api/branches` - Create branch
- `PUT /api/branches/:id` - Update branch

### Products
- `GET /api/products/:branchId` - Get products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Invoices
- `GET /api/invoices/:branchId` - Get invoices
- `GET /api/invoice/:id` - Get invoice with items
- `POST /api/invoices` - Create invoice

### Dashboard
- `GET /api/dashboard/:organizationId` - Get dashboard statistics

## Customization

### Bill Customization
Each branch can have its own:
- **Color**: Set via color picker in branch settings
- **Font**: Choose from Arial, Times New Roman, Courier New, Verdana, Georgia
- **Icon**: Provide a URL to an image/logo

These settings are applied when viewing/printing invoices for that branch.

## Notes

- Passwords are stored in plain text in this version. For production, implement password hashing (bcrypt)
- The application uses a single-user model. For multi-user support, implement proper session management
- Stock quantities are automatically decremented when invoices are created
- Invoice numbers are auto-generated but can be customized

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check `.env` file has correct database credentials
- Ensure the database `billing_system` exists

### Port Already in Use
- Change the PORT in `.env` file
- Or stop the process using port 3000

### CORS Errors
- Ensure the frontend is being served from the same origin or update CORS settings in `server.js`

## License

This project is open source and available for use.
