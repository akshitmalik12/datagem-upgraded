# Server Management

## Quick Start

### Option 1: Use the helper script (Recommended)
```bash
./start_server.sh
```

This script will:
- Automatically kill any processes using port 8000
- Start the uvicorn server with hot reload

### Option 2: Manual start
```bash
uvicorn main:app --reload
```

## Stopping the Server

### Option 1: Use the stop script
```bash
./stop_server.sh
```

### Option 2: Manual stop
Press `Ctrl+C` in the terminal where uvicorn is running

### Option 3: Kill by port
```bash
# Find process
lsof -ti:8000

# Kill process
kill -9 $(lsof -ti:8000)
```

## Troubleshooting "Address already in use" Error

If you get the error `[Errno 48] Address already in use`:

1. **Use the start script** (easiest):
   ```bash
   ./start_server.sh
   ```

2. **Or manually kill the process**:
   ```bash
   # Find what's using port 8000
   lsof -ti:8000
   
   # Kill it
   kill -9 $(lsof -ti:8000)
   
   # Then start server
   uvicorn main:app --reload
   ```

3. **Or use a different port**:
   ```bash
   uvicorn main:app --reload --port 8001
   ```
   (Don't forget to update your frontend to use the new port!)

## Port Already in Use?

The most common causes:
- Previous uvicorn process didn't close properly
- Another application is using port 8000
- Multiple terminal windows have uvicorn running

**Solution**: Always use `./start_server.sh` - it handles this automatically!

