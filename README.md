# portwatch

Lightweight daemon that monitors local port usage and sends desktop notifications on unexpected changes.

## Installation

```bash
npm install -g portwatch
```

## Usage

Start the daemon with default settings:

```bash
portwatch start
```

You can optionally provide a config file to define which ports to watch or ignore:

```bash
portwatch start --config portwatch.config.json
```

**Example config:**

```json
{
  "ignore": [22, 80, 443],
  "watch": "all",
  "interval": 5000
}
```

Once running, portwatch will monitor active ports at the specified interval and fire a desktop notification whenever a port is opened or closed unexpectedly.

To stop the daemon:

```bash
portwatch stop
```

## How It Works

portwatch polls the system's active connections using native OS tools (`ss`, `netstat`) and compares snapshots over time. Any delta outside your configured rules triggers an immediate desktop notification via your OS notification system.

## Requirements

- Node.js >= 16
- Linux, macOS, or Windows (WSL supported)
- `libnotify` (Linux) or native Notification Center (macOS/Windows)

## License

MIT © portwatch contributors