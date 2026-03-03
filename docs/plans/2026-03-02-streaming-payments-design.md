# BlockBillStream - Streaming Payments Design

## Overview
Streaming payments contract for Bitcoin L1 via OPNet. Sender deposits OP-20 tokens, funds flow block-by-block to recipient who can withdraw accumulated balance at any time.

Separate contract from BlockBill invoicing. Frontend unified under same app.

## Contract: BlockBillStream (AssemblyScript)

### Stream Data
| Field | Type | Description |
|-------|------|-------------|
| streamId | u256 | Auto-increment ID |
| sender | Address | Funds provider |
| recipient | Address | Funds receiver |
| token | Address | OP-20 token |
| totalDeposited | u256 | Total tokens deposited (initial + top-ups) |
| totalWithdrawn | u256 | Total tokens already withdrawn |
| ratePerBlock | u256 | Tokens released per block |
| startBlock | u64 | Block when streaming begins |
| endBlock | u64 | Block when streaming ends (0 = infinite) |
| lastWithdrawBlock | u64 | Last block at which withdrawal was processed |
| pausedAtBlock | u64 | Block when paused (0 = not paused) |
| accumulatedBeforePause | u256 | Tokens accumulated before pause (for correct math) |
| status | u8 | ACTIVE=0, PAUSED=1, CANCELLED=2 |

### Write Methods

#### `createStream(recipient, token, totalAmount, ratePerBlock, endBlock)`
- TransferFrom sender → contract for totalAmount
- 0.5% platform fee deducted upfront from deposit
- Sets startBlock = current block, lastWithdrawBlock = current block
- If endBlock > 0, validate endBlock > currentBlock
- If endBlock = 0, stream is infinite (runs until funds exhausted or cancelled)
- Returns streamId
- Indexes: sender list, recipient list

#### `withdraw(streamId)` / `withdrawTo(streamId, to)`
- Callable by recipient OR any third party (third-party withdraw)
- `withdraw` sends to recipient; `withdrawTo` sends to specified address (recipient-only)
- Calculates withdrawable amount based on elapsed blocks
- Updates totalWithdrawn and lastWithdrawBlock
- TransferFrom contract → recipient (or `to` address)
- No-op if withdrawable = 0

#### `topUp(streamId, amount)`
- Sender-only
- TransferFrom sender → contract
- 0.5% fee on top-up amount
- Increases totalDeposited
- If stream had ended (funds exhausted), extends effective duration

#### `cancelStream(streamId)`
- Sender-only
- Calculates withdrawable for recipient → transfers to recipient
- Remaining unstreamed funds → transfers back to sender
- Sets status = CANCELLED

#### `pauseStream(streamId)`
- Sender-only, only if ACTIVE
- Records accumulatedBeforePause = current withdrawable
- Sets pausedAtBlock = current block
- Sets status = PAUSED

#### `resumeStream(streamId)`
- Sender-only, only if PAUSED
- Sets lastWithdrawBlock = current block (resume point)
- Clears pausedAtBlock = 0
- Sets status = ACTIVE
- accumulatedBeforePause preserved for withdraw calculation

#### `setFeeRecipient(newAddress)`
- Owner-only

### Read Methods

#### `getStream(streamId)` → all fields
#### `getWithdrawable(streamId)` → u256
Calculation:
```
if status == PAUSED:
  withdrawable = accumulatedBeforePause - totalWithdrawn
elif status == CANCELLED:
  withdrawable = 0
else:
  effectiveEnd = endBlock > 0 ? min(currentBlock, endBlock) : currentBlock
  elapsed = effectiveEnd - lastWithdrawBlock
  streamed = elapsed * ratePerBlock + accumulatedBeforePause
  cap = totalDeposited - platformFee
  withdrawable = min(streamed, cap) - totalWithdrawn
```

#### `getStreamsBySender(address)` → u256[] (stream IDs)
#### `getStreamsByRecipient(address)` → u256[] (stream IDs)
#### `getStreamCount()` → u256

### Security
- ReentrancyGuard on all write methods
- Checks-Effects-Interactions pattern
- Overflow protection via SafeMath
- Index DOS protection (max 1000 per address)
- Only sender can: topUp, cancel, pause, resume
- Only recipient can: withdrawTo (to custom address)
- Anyone can: withdraw (to recipient) — enables third-party claims

### Fee
- 0.5% (50 bps) deducted from deposit at createStream and topUp
- Same fee recipient as BlockBill invoicing
- Net deposit = amount * 9950 / 10000

## Frontend

### New Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/streams` | StreamDashboard | List of sent/received streams with status |
| `/streams/create` | CreateStream | Form: recipient, token, amount, rate, duration |
| `/stream/:id` | StreamView | Live stream visualization + actions |

### StreamDashboard
- Tabs: "Sending" / "Receiving"
- Status filters: All, Active, Paused, Cancelled
- Each card shows: recipient/sender, token, progress bar, rate, withdrawable
- Real-time update of withdrawable amounts

### CreateStream
- Token selector (reuse existing)
- Amount input with balance display
- Rate calculator: "X tokens per block" with helper showing ~per hour/day/month
- Duration toggle: Infinite vs Fixed end block
- Live preview panel (reuse paper card style)
- Fee preview (0.5%)

### StreamView
- Animated progress bar showing funds flowing (ink flowing metaphor)
- Key metrics: total deposited, streamed so far, withdrawn, remaining
- Real-time withdrawable counter updating every few seconds
- Actions (contextual):
  - Recipient: Withdraw, Withdraw To
  - Sender: Top Up, Pause/Resume, Cancel
  - Anyone: Withdraw (third-party claim)
- Stream history/timeline of events
- Share link + QR code

### Navigation
- Add "Streams" link in header nav alongside existing pages
- Same paper/stationery theme
- Stream metaphor = "ink flowing" / "hourglass dripping"

### Hooks
- `useStream(streamId)` — fetch + poll stream data
- `useStreamWithdrawable(streamId)` — real-time withdrawable with block polling
- `useStreamActions()` — withdraw, topUp, cancel, pause, resume methods

### Services
- `StreamContractService` — getContract, methods, caching
- Reuse existing ProviderService and ContractService patterns
