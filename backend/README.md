# IoT Backend System

Backend system for IoT device management and sensor data collection, built with Node.js, Express, MySQL, and WebSockets.

## Features

- Device management (CRUD operations)
- Sensor management (CRUD operations)
- Sensor data collection and storage
- Real-time data updates using Socket.IO
- HTTP APIs for IoT device communication
- REST API for frontend integration

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Docker and Docker Compose (for containerized deployment)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/iot-backend.git
cd iot-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on the `.env.example` template:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your configuration settings

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

### Docker Deployment

1. Build and run the containers:
```bash
docker-compose up -d
```

2. Stop the containers:
```bash
docker-compose down
```

## API Endpoints

### Devices

- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get a single device
- `POST /api/devices` - Create a new device
- `PUT /api/devices/:id` - Update a device
- `DELETE /api/devices/:id` - Delete a device
- `POST /api/devices/:id/control` - Send a command to a device

### Device HTTP Communication Endpoints

- `POST /api/devices/:id/report` - Device reports its status and sensor data
- `GET /api/devices/:id/commands` - Device polls for pending commands
- `POST /api/devices/:id/acknowledge` - Device acknowledges command execution

### Sensors

- `GET /api/sensors` - Get all sensors
- `GET /api/sensors/device/:deviceId` - Get sensors by device
- `GET /api/sensors/:id` - Get a single sensor
- `POST /api/sensors` - Create a new sensor
- `PUT /api/sensors/:id` - Update a sensor
- `DELETE /api/sensors/:id` - Delete a sensor
- `GET /api/sensors/:id/data` - Get sensor data
- `GET /api/sensors/:id/data/latest` - Get latest sensor data
- `POST /api/sensors/:id/data` - Add sensor data manually

## HTTP Device Communication

### Reporting Device Data
```
POST /api/devices/:id/report
```

Example request body:
```json
{
  "status": "online",
  "sensorData": [
    {
      "sensorId": 1,
      "value": 25.5
    },
    {
      "sensorId": 2,
      "value": 65
    }
  ]
}
```

### Polling for Commands
```
GET /api/devices/:id/commands
```

Example response (when command exists):
```json
{
  "success": true,
  "hasCommand": true,
  "command": {
    "command": "turnOn",
    "params": { "port": 1 },
    "timestamp": "2023-01-15T12:00:00.000Z"
  }
}
```

### Acknowledging Command Execution
```
POST /api/devices/:id/acknowledge
```

Example request body:
```json
{
  "commandId": "timestamp-based-id",
  "success": true,
  "result": {
    "message": "Port 1 turned on successfully"
  }
}
```

## WebSocket Events

### Client -> Server

- `subscribeToDevice` - Subscribe to device updates
- `subscribeToSensor` - Subscribe to sensor updates

### Server -> Client

- `deviceData` - Real-time device data updates
- `deviceStatus` - Real-time device status updates
- `sensorData` - Real-time sensor data updates
- `deviceCommand` - Command sent to device
- `commandResult` - Result of command execution

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── index.js        # Entry point
├── .env                # Environment variables
└── package.json        # NPM dependencies
```

## License

This project is licensed under the MIT License