# Quick Start Guide

## ✅ Your Stock & EMI Dashboard is Ready!

The application is now running at: **http://localhost:3000**

## 📊 Pre-loaded Data

Your dashboard comes with all your current portfolio data:

### Stocks (8 holdings)
- **Tata Gold ETF** - 3 lots (42,160 shares total)
- **Ather Energy** - 5 lots (1,310 shares total)

**Total Portfolio Value**: ₹1,478,222.10  
**Total Investment**: ₹1,416,505.44  
**Profit/Loss**: ₹61,716.66 (+4.36%)

### Loans (2 active)
- **Loan 1**: ₹511,911.28 (6 EMI payments)
- **Loan 2**: ₹436,980.00 (12 EMI payments)

**Total EMI to Pay**: ₹948,891.28

## 🚀 Main Features

### 1. Stock Portfolio Tab
- View all your stock holdings
- See real-time profit/loss
- Update current prices
- Sell stocks with automatic brokerage calculation
- Add new stocks to your portfolio

### 2. Loans Tab
- View all loan details
- See payment schedules
- Track paid vs pending EMI
- Visual progress indicators
- Add new loans

### 3. EMI Payments Tab
- Pay EMI by selling stocks
- Automatic calculation of proceeds after brokerage
- Link stock sales to specific EMI payments
- See warning if sale proceeds are insufficient
- Mark EMI as paid manually

### 4. Transactions Tab
- Complete history of all buys and sells
- Filter by transaction type
- View brokerage costs
- Track EMI-related sales

## 💡 How to Pay EMI Using Stocks

1. Go to **EMI Payments** tab
2. You'll see the next pending EMI amount (₹85,427 for Loan 1, Month 1)
3. Click "Select" on any stock you want to sell
4. Enter:
   - **Quantity** to sell
   - **Sell Price** per share
5. The calculator shows:
   - Gross Amount = Quantity × Price
   - Brokerage + GST (0.05% + 18% GST on brokerage)
   - **Net Proceeds** (amount you'll receive)
6. If net proceeds ≥ EMI amount, you'll see a green checkmark ✓
7. Click "Confirm Sale & Pay EMI" to:
   - Record the stock sale
   - Deduct brokerage
   - Mark EMI as paid
   - Update your portfolio

## 🔧 Brokerage Calculation

Default settings:
- **Buy Rate**: 0.05%
- **Sell Rate**: 0.05%
- **Minimum Charge**: ₹20
- **GST**: 18% on brokerage

Example: Selling 1000 shares @ ₹11.96
- Gross: ₹11,960
- Brokerage: ₹59.80 (0.05%)
- GST: ₹10.76 (18% of brokerage)
- **Net: ₹11,889.44**

## 💾 Data Storage

- All data is stored in your browser's **localStorage**
- No backend server required
- Data persists between sessions
- Use **Export** button to backup your data

## 📥 Backup & Restore

### Backup
Click the **Export** button in the header to download a JSON backup.

### Restore
1. Open Browser DevTools (F12)
2. Go to Console
3. Paste and run:
```javascript
localStorage.setItem('stock-emi-data.json', '/* paste your backup JSON here */')
```
4. Refresh the page

## 🎯 Quick Actions

### Update Stock Prices
1. Go to Stock Portfolio
2. Click "Update Price" on any stock
3. Enter new price
4. P&L recalculates automatically

### Sell Stock (not for EMI)
1. Go to Stock Portfolio
2. Click "Sell Stock"
3. Enter quantity and price
4. View brokerage calculation
5. Confirm sale

### Add New Stock
1. Go to Stock Portfolio
2. Click "Add Stock"
3. Fill in details
4. Submit

### Add New Loan
1. Go to Loans tab
2. Click "Add Loan"
3. Enter loan details
4. Payment schedule auto-generates

## 📱 Responsive Design

The dashboard works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔄 Development Server

Currently running at: http://localhost:3000

To stop the server: Press `Ctrl+C` in the terminal

To restart:
```bash
cd /www/wwwroot/axel/STOCK
pnpm dev
```

## 🏗️ Production Build

When ready to deploy:
```bash
pnpm build
pnpm preview
```

## 📊 Current Portfolio Summary

From your CSV data:

**Next EMI Due**: ₹122,097 (₹85,427 + ₹36,670)  
**Stocks Available to Sell**: 8 holdings  
**Sufficient Portfolio**: ✓ Yes (Portfolio value exceeds all pending EMI)

## 💰 Suggested Strategy

Based on your data:
1. Your **Ather Energy** stocks have good profits (₹34,403 on one lot)
2. Consider selling from lots with higher profit first for tax optimization
3. Monitor and update prices regularly for accurate calculations
4. Use the EMI calculator to see exact proceeds after brokerage

## 🎨 Dashboard Features

- **Beautiful UI** with gradient backgrounds
- **Color-coded** profit/loss indicators
- **Progress bars** for loan repayment
- **Real-time calculations**
- **Modal forms** for clean UX
- **Responsive tables** for transaction history

## 🆘 Need Help?

1. All calculations are automatic
2. Hover over elements to see details
3. Check the main README.md for detailed documentation
4. All data updates save automatically

---

**Enjoy managing your stocks and EMI payments!** 🚀📈

