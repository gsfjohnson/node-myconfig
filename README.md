# MyConfig

A flexible configuration manager for Node.js applications that supports both INI and JSON formats with a Map-based structure.

## Features

- Read and write configuration files in INI or JSON format
- Support for nested configuration using dot notation
- Asynchronous and synchronous operations
- Deep cloning to prevent unintended mutations
- Tracking of changed configuration keys

## Installation

```bash
npm install @gsfjohnson/myconfig
```

## Basic Usage

```javascript
const MyConfig = require('@gsfjohnson/myconfig');

// Create a new configuration
async function example() {
  // Load config from a file (creates if doesn't exist)
  const config = await MyConfig.load('myapp');
  
  // Set values (supports dot notation for nesting)
  config.set('server.host', 'localhost');
  config.set('server.port', 8080);
  config.set('debug', true);
  
  // Get values
  const host = config.get('server.host');  // 'localhost'
  const serverConfig = config.get('server'); // Map with host and port
  
  // Delete values
  config.delete('debug');
  
  // Save config to file
  await config.save();
}

// Synchronous version
function syncExample() {
  // Load config synchronously
  const config = MyConfig.loadSync('myapp');
  
  config.set('app.name', 'My Application');
  config.set('app.version', '1.0.0');
  
  // Save config synchronously
  config.savesync();
}
```

## API Reference

### Constructor

- `new MyConfig(options)` - Creates a new configuration instance
  - `options.name` - Name of the application (required)
  - `options.data` - Initial configuration data as a Map

### Static Methods

- `MyConfig.load(name, [options])` - Load configuration (async)
- `MyConfig.loadSync(name, [options])` - Load configuration

### Instance Methods

- `config.get(key)` - Get a configuration value
- `config.set(key, value)` - Set a configuration value
- `config.delete(key)` - Delete a configuration value
- `config.save([filename])` - Save configuration (async)
- `config.saveSync([filename])` - Save configuration

### Properties

- `config.dirty` - Number of unsaved changes
- `config.name` - Name of the configuration

## File Locations

By default, configuration files are stored in platform-specific locations:
- Windows: `%APPDATA%\myapp\config.ini`
- macOS: `~/Library/Application Support/myapp/config.ini`
- Linux: `~/.config/myapp/config.ini`

You can specify a custom path when saving or loading.