# Stock & EMI Dashboard

A comprehensive Vue/Nuxt dashboard for managing stock portfolios and loan EMI payments with integrated brokerage calculations.

## Features

### 📊 Stock Portfolio Management
- Add, update, and track multiple stocks
- Real-time profit/loss calculations
- Buy and sell stocks with automatic brokerage calculation
- Portfolio performance metrics and analytics

### 💰 Loan & EMI Tracking
- Manage multiple loans with customizable payment schedules
- Track EMI payments with visual progress indicators
- Mark payments as paid manually or through stock sales
- View payment history and remaining balances

### 💸 EMI Payment Through Stock Sales
- Sell stocks directly to pay EMI
- Automatic brokerage and GST calculation on sales
- Link stock sales to specific EMI payments
- Visual indicators showing if sale proceeds are sufficient for EMI

### 📈 Transaction History
- Complete transaction log for all buys and sells
- Filter transactions by type (buy/sell)
- Track brokerage costs on all transactions
- Export transaction history

### 💾 Local Data Storage
- All data stored in browser's localStorage as JSON
- No backend or database required
- Export and import data for backup
- Automatic data persistence

## Technology Stack

- **Framework**: Nuxt 4.1.3
- **UI Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS
- **Icons**: Nuxt Icon (MDI icons)
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ or higher
- pnpm (recommended) or npm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Production Build

```bash
pnpm build
pnpm preview
```

## Initial Data

The application comes pre-loaded with sample data from your portfolio:

**Stocks:**
- Tata Gold Exchange Traded Fund (3 lots)
- Ather Energy (5 lots)

**Loans:**
- Loan 1: ₹511,911.28 (6 EMI payments)
- Loan 2: ₹436,980.00 (12 EMI payments)

## Usage Guide

### Adding Stocks
1. Navigate to "Stock Portfolio" tab
2. Click "Add Stock" button
3. Enter stock details (name, quantity, buy price, current price)
4. Click "Add Stock" to save

### Updating Stock Prices
1. Find the stock in your portfolio
2. Click "Update Price" button
3. Enter the new current price
4. Profit/loss will be automatically recalculated

### Selling Stocks
1. Click "Sell Stock" button on any stock
2. Enter quantity to sell and sell price
3. View brokerage calculation and net proceeds
4. Confirm sale

### Adding Loans
1. Navigate to "Loans" tab
2. Click "Add Loan" button
3. Enter loan details (name, principal, EMI amount, number of payments)
4. Payment schedule is automatically generated

### Paying EMI
1. Navigate to "EMI Payments" tab
2. View next pending EMI payment
3. Select a stock to sell for EMI payment
4. Enter quantity and price
5. System shows if proceeds are sufficient
6. Confirm to sell stock and mark EMI as paid

### Viewing Transactions
1. Navigate to "Transactions" tab
2. View all buy/sell transactions
3. Filter by transaction type
4. See brokerage costs and net amounts

## Brokerage Configuration

Default brokerage settings (can be modified in the app):
- Buy Rate: 0.05%
- Sell Rate: 0.05%
- Minimum Charge: ₹20
- GST: 18%

## Data Management

### Export Data
Click the "Export" button in the header to download your data as a JSON backup file.

### Import Data
To restore data from a backup, use the browser's developer tools to import JSON into localStorage with key `stock-emi-data.json`.

### Reset Data
Clear browser's localStorage to reset to initial data. The app will automatically reload the sample portfolio.

## Features Breakdown

### Dashboard Metrics
- **Portfolio Value**: Total current value of all active stocks
- **Profit/Loss**: Overall P&L with percentage
- **Total EMI Pending**: Sum of all remaining EMI payments
- **Next EMI**: Amount due for the next payment

### Smart EMI Calculator
When selling stocks for EMI:
- Calculates gross sale amount
- Deducts brokerage (0.05% or minimum ₹20)
- Adds GST (18% on brokerage)
- Shows net proceeds after all charges
- Warns if proceeds are insufficient for EMI

### Visual Indicators
- Color-coded profit/loss (green for profit, red for loss)
- Progress bars for loan repayment
- Status badges for paid/pending EMI payments
- Transaction type indicators (buy/sell)

## Project Structure

```
STOCK/
├── app.vue                      # Root component
├── nuxt.config.ts              # Nuxt configuration
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind CSS config
├── components/
│   ├── SummaryCard.vue         # Dashboard metric cards
│   ├── StockPortfolio.vue      # Stock management
│   ├── LoanManagement.vue      # Loan tracking
│   ├── EMIPayments.vue         # EMI payment interface
│   ├── TransactionHistory.vue  # Transaction log
│   └── Modal.vue               # Reusable modal
├── pages/
│   └── index.vue               # Main dashboard page
├── composables/
│   └── useAppData.ts           # State management
├── utils/
│   ├── storage.ts              # LocalStorage operations
│   ├── calculations.ts         # Financial calculations
│   └── initData.ts             # Initial data seed
├── types/
│   └── index.ts                # TypeScript types
└── public/
    └── data.json               # Sample data file
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Notes

- All financial calculations use 2 decimal precision
- Currency format: Indian Rupee (₹)
- Date format: DD MMM YYYY
- Data persists in browser localStorage
- Single Page Application (SPA) - no server required

## Support

For issues or questions, refer to the code comments or Nuxt.js documentation at https://nuxt.com

## License

Private use only.

