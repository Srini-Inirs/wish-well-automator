# WishBot WhatsApp Server

This server handles automated WhatsApp message delivery for scheduled wishes using WhatsApp Web.js.

## Prerequisites

- Node.js 18+ installed
- WhatsApp account to send messages from

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` folder:

```env
# Supabase Configuration
SUPABASE_URL=https://tdkrsgaauvsyvryyzrim.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration (optional)
CRON_INTERVAL=* * * * *
```

**Important**: Get your `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project settings.

### 3. Start the Server

```bash
npm start
```

### 4. Scan QR Code

When the server starts, it will display a QR code in the terminal. Scan this with your WhatsApp mobile app:

1. Open WhatsApp on your phone
2. Go to Settings > Linked Devices
3. Click "Link a Device"
4. Scan the QR code displayed in the terminal

### 5. Server is Ready!

Once authenticated, the server will:
- Check for scheduled wishes every minute
- Send text messages, images, videos, and audio via WhatsApp
- Update wish status in the database (sent/failed)

## How It Works

1. **Scheduler** (`scheduler.js`): Runs every minute, queries wishes where `scheduled_date <= now` and `status = 'scheduled'`
2. **Sender** (`sender.js`): Sends messages via WhatsApp (text, images, videos, audio)
3. **WhatsApp** (`whatsapp.js`): Manages WhatsApp Web.js client connection
4. **Supabase** (`supabase.js`): Database client with service role access

## Status Values

- `scheduled`: Wish is waiting to be sent
- `sent`: Wish was successfully delivered
- `failed`: Wish failed to send (will not retry)

## File Structure

```
server/
├── src/
│   ├── index.js       # Entry point
│   ├── scheduler.js   # Cron job scheduler
│   ├── sender.js      # Message sending logic
│   ├── whatsapp.js    # WhatsApp client
│   └── supabase.js    # Database client
├── .env               # Environment variables (create this)
├── .env.example       # Example environment file
├── package.json       # Dependencies
└── README.md          # This file
```

## Troubleshooting

### QR Code Not Appearing
- Make sure puppeteer can run headless Chrome
- On Linux, you may need additional dependencies: `apt-get install -y chromium-browser`

### Authentication Issues
- Delete `.wwebjs_auth` folder and restart to re-authenticate
- Make sure no other WhatsApp Web session is active

### Messages Not Sending
- Check console logs for errors
- Verify phone numbers are in correct format (with country code)
- Ensure WhatsApp client shows "ready" status

## Production Deployment

For production use:
1. Use a process manager like PM2: `pm2 start src/index.js --name wishbot`
2. Consider using a VPS with stable internet connection
3. Monitor logs for failed deliveries
4. Set up health checks and alerts
