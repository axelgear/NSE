# Changelog - Stock & EMI Dashboard

## Version 2.0 - Enhanced Features (Latest)

### 🆕 New Features

#### 1. **Stock Price API Integration**
- ✅ Integrated with NSE/BSE Stock Market API
- ✅ Real-time price updates for stocks
- ✅ Bulk update all stock prices at once
- ✅ Individual stock price updates via API
- ✅ Automatic symbol suggestions based on stock names
- ✅ Price caching to reduce API calls

**How to Use:**
1. Add stock symbol when creating a stock (e.g., `ATHERENERGY`, `TGOLDETF`)
2. Click "API Update" button on any stock to fetch live price
3. Click "Update Prices" in header to update all stocks at once
4. System automatically suggests symbols for common stocks

#### 2. **Synchronized Pricing Across Same Stocks**
- ✅ All stocks with the same name share current price
- ✅ Updating one updates all (e.g., all Ather Energy stocks)
- ✅ Manual or API update syncs automatically

**Example:**
- You have 5 lots of "Ather Energy"
- Update price on any lot to ₹750
- All 5 lots automatically update to ₹750
- Profit/loss recalculates for each lot individually

#### 3. **Sold Price Tracking**
- ✅ Track the exact price at which stocks were sold
- ✅ Track quantity sold for partial sales
- ✅ View sold price history in stock details
- ✅ Compare sold price with buy price

**Fields Added:**
- `soldPrice` - Price at which stock was sold
- `soldQuantity` - Total quantity sold across all transactions
- Status updates: `active`, `partial`, `sold`

#### 4. **Enhanced Sell Functionality**
- ✅ Multiple sell purposes: Profit, Reinvest, EMI, Other
- ✅ Add notes to sales transactions
- ✅ Link sales to new purchases (for tracking reinvestment)
- ✅ Automatic brokerage calculation

**Sell Purposes:**
- **Profit** - Taking profits from investment
- **Reinvest** - Selling to buy another stock
- **EMI** - Selling to pay loan EMI (existing feature)
- **Other** - Custom purpose with notes

#### 5. **Transaction Enhancements**
- ✅ Purpose field in all transactions
- ✅ Notes field for additional context
- ✅ Color-coded purpose badges
- ✅ Link transactions together (sell → buy)

**Transaction Table Updates:**
- Added "Purpose" column
- Added "Notes" column
- Color badges for different purposes
- Better transaction categorization

#### 6. **Reinvestment Workflow**
- ✅ Sell stock with "Reinvest" purpose
- ✅ System shows net proceeds after brokerage
- ✅ Add new stock using those proceeds
- ✅ Transactions are linked for tracking

**Example Workflow:**
1. Sell 100 Ather Energy shares @ ₹750 for reinvestment
2. Net proceeds: ₹74,900 (after brokerage)
3. Buy 30 Reliance shares @ ₹2,450 using proceeds
4. Transactions are linked in the system

---

## Version 1.0 - Initial Release

### Core Features

1. **Stock Portfolio Management**
   - Add, update, delete stocks
   - Track quantity, prices, profit/loss
   - View portfolio performance

2. **Loan & EMI Tracking**
   - Multiple loans support
   - EMI payment schedules
   - Payment history tracking

3. **EMI Payment via Stock Sales**
   - Sell stocks to pay EMI
   - Automatic brokerage calculation
   - Link sales to EMI payments

4. **Transaction History**
   - Complete buy/sell history
   - Filter by type
   - Export data

5. **Dashboard Analytics**
   - Portfolio value tracking
   - Profit/loss calculation
   - EMI pending summary

---

## API Integration Details

### Supported Stock Symbols

**NSE (National Stock Exchange)** - Default
- Format: `SYMBOL` or `SYMBOL.NS`
- Examples: `ATHERENERGY`, `RELIANCE.NS`, `TCS`

**BSE (Bombay Stock Exchange)**
- Format: `SYMBOL.BO`
- Examples: `RELIANCE.BO`, `TCS.BO`

### Common Stock Symbols (Pre-configured)

| Company Name | Symbol | Exchange |
|--------------|--------|----------|
| Ather Energy | ATHERENERGY | NSE |
| Tata Gold ETF | TGOLDETF | NSE |
| Reliance Industries | RELIANCE | NSE |
| TCS | TCS | NSE |
| Infosys | INFY | NSE |
| HDFC Bank | HDFCBANK | NSE |
| ICICI Bank | ICICIBANK | NSE |
| ITC | ITC | NSE |
| Wipro | WIPRO | NSE |
| Bharti Airtel | BHARTIARTL | NSE |

### API Features

- ✅ No authentication required
- ✅ Free to use
- ✅ Real-time data from NSE/BSE
- ✅ Automatic exchange detection
- ✅ Smart search by company name

---

## Data Model Changes

### Stock Interface (Updated)
```typescript
interface Stock {
  id: string
  name: string
  symbol?: string           // NEW: API symbol
  paid: number
  tradePrice: number
  quantity: number
  currentPrice: number
  soldPrice?: number        // NEW: Sale price
  soldQuantity?: number     // NEW: Qty sold
  value: number
  profitLoss: number
  purchaseDate?: string
  soldDate?: string
  status: 'active' | 'sold' | 'partial'
}
```

### Transaction Interface (Updated)
```typescript
interface Transaction {
  id: string
  type: 'buy' | 'sell'
  stockId: string
  stockName: string
  quantity: number
  price: number
  totalAmount: number
  brokerage: number
  netAmount: number
  date: string
  loanId?: string
  emiMonth?: number
  purpose?: 'emi' | 'reinvest' | 'profit' | 'other'  // NEW
  linkedBuyId?: string      // NEW: Link to related transaction
  notes?: string            // NEW: User notes
}
```

### AppData Interface (Updated)
```typescript
interface AppData {
  stocks: Stock[]
  loans: Loan[]
  transactions: Transaction[]
  brokerageConfig: BrokerageConfig
  lastUpdated: string
  priceCache?: Record<string, StockPriceData>  // NEW: Cache API responses
}
```

---

## Usage Examples

### Example 1: Update All Prices from API
```
1. Ensure all stocks have symbols configured
2. Click "Update Prices" button in dashboard header
3. System fetches live prices for all unique symbols
4. All matching stocks update automatically
5. Portfolio metrics recalculate
```

### Example 2: Sell Stock to Buy Another
```
1. Go to Stock Portfolio → Select stock → Click "Sell Stock"
2. Choose purpose: "Sell to Buy Another Stock"
3. Enter quantity and price
4. View net proceeds after brokerage: ₹74,900
5. Add notes: "Buying RELIANCE with this money"
6. Confirm sale
7. Add new stock with the proceeds
```

### Example 3: Manual Price Sync
```
1. Update price on any "Ather Energy" stock to ₹750
2. System automatically:
   - Updates all other Ather Energy stocks to ₹750
   - Recalculates value and P/L for each lot
   - Maintains individual profit tracking
```

### Example 4: Track Partial Sales
```
1. Stock: 500 shares of Ather Energy
2. Sell 200 shares @ ₹740 for profit
3. System updates:
   - soldPrice: ₹740
   - soldQuantity: 200
   - status: 'partial'
   - quantity: 300 (remaining)
4. Later sell 100 more @ ₹760
5. System updates:
   - soldQuantity: 300 (total)
   - Last soldPrice: ₹760
```

---

## Migration Notes

### Existing Data Compatibility
- ✅ All existing data remains compatible
- ✅ New fields are optional
- ✅ Old transactions continue to work
- ✅ No data loss

### Adding Symbols to Existing Stocks
1. Go to Stock Portfolio
2. For each stock without symbol:
   - System suggests symbol based on name
   - Add symbol manually if needed
3. Once added, API updates become available

---

## Performance Improvements

1. **Price Caching**
   - API responses cached locally
   - Reduces redundant API calls
   - Faster subsequent updates

2. **Batch Updates**
   - Update multiple stocks in parallel
   - Efficient API usage
   - Faster overall update time

3. **Smart Sync**
   - Automatic price synchronization
   - Minimal redundant calculations
   - Optimized for multiple lots

---

## Future Enhancements (Planned)

1. **Stock Analytics** 📊
   - Price trend analysis
   - Performance charts
   - Best/worst performers
   - Sector-wise breakdown

2. **Smart EMI Suggestions** 🤖
   - Analyze which stocks to sell for EMI
   - Optimize for taxes and profits
   - Monthly selling recommendations
   - Profit optimization algorithms

3. **Historical Price Tracking** 📈
   - Store price history
   - View price changes over time
   - Performance graphs
   - Buy/sell timing analysis

4. **Tax Calculations** 💰
   - Capital gains calculation
   - Short-term vs long-term
   - Tax optimization suggestions
   - Annual tax reports

5. **Portfolio Rebalancing** ⚖️
   - Analyze portfolio allocation
   - Suggest rebalancing actions
   - Risk assessment
   - Diversification metrics

6. **Alerts & Notifications** 🔔
   - Price alerts (target price reached)
   - EMI payment reminders
   - Profit target notifications
   - Stop-loss alerts

---

## Bug Fixes

### Version 2.0
- ✅ Fixed profit calculation on partial sales
- ✅ Improved transaction linking
- ✅ Better error handling for API failures
- ✅ Fixed quantity tracking on multiple sales

### Version 1.0
- Initial stable release

---

## Technical Details

### New Utility Files
- `utils/stockApi.ts` - API integration
- `composables/useStockPrice.ts` - Price management

### New Components Updates
- `StockPortfolio.vue` - Enhanced with API buttons
- `TransactionHistory.vue` - Added purpose & notes columns
- `index.vue` - Bulk update button

### API Configuration
- Base URL: `http://nse-api-khaki.vercel.app:5000`
- No API key required
- Rate limits: No strict limits (reasonable use)
- Timeout: 10 seconds per request

---

## Developer Notes

### Adding New Stock Symbols
Edit `utils/stockApi.ts`:
```typescript
const symbolMap: Record<string, string> = {
  'your stock name': 'STOCKSYMBOL',
  // Add more mappings
}
```

### Customizing Brokerage
Edit via UI or modify `brokerageConfig` in storage:
```typescript
{
  buyRate: 0.05,      // 0.05%
  sellRate: 0.05,     // 0.05%
  minCharge: 20,      // ₹20 minimum
  gst: 18             // 18% GST
}
```

---

**Dashboard Version**: 2.0  
**Last Updated**: October 27, 2025  
**Server Port**: 3001 (if 3000 is occupied)

