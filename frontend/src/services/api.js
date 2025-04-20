import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  // Devices
  getDevices() {
    return apiClient.get('/devices')
  },
  getDevice(id) {
    return apiClient.get(`/devices/${id}`)
  },
  createDevice(device) {
    return apiClient.post('/devices', device)
  },
  updateDevice(id, device) {
    return apiClient.put(`/devices/${id}`, device)
  },
  deleteDevice(id) {
    return apiClient.delete(`/devices/${id}`)
  },
  pingDevice(macAddress) {
    return apiClient.post(`/devices/ping/${macAddress}`)
  },

  // Channels
  getChannels() {
    return apiClient.get('/channels')
  },
  getChannel(id) {
    return apiClient.get(`/channels/${id}`)
  },
  createChannel(channel) {
    return apiClient.post('/channels', channel)
  },
  updateChannel(id, channel) {
    return apiClient.put(`/channels/${id}`, channel)
  },
  deleteChannel(id) {
    return apiClient.delete(`/channels/${id}`)
  },
  regenerateApiKey(id) {
    return apiClient.post(`/channels/${id}/regenerate-api-key`)
  },

  // Sensor Data
  getSensorData(page = 1, limit = 100) {
    return apiClient.get(`/sensor?page=${page}&limit=${limit}`)
  },
  getChannelData(channelId, params = {}) {
    let url = `/sensor/channel/${channelId}`
    const queryParams = new URLSearchParams()
    
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.limit) queryParams.append('limit', params.limit)
    
    const queryString = queryParams.toString()
    if (queryString) url += `?${queryString}`
    
    return apiClient.get(url)
  },
  getLatestData(channelId) {
    return apiClient.get(`/sensor/channel/${channelId}/latest`)
  },

  // Commands
  getCommands() {
    return apiClient.get('/commands')
  },
  createCommand(command) {
    return apiClient.post('/commands', command)
  },
  updateCommandStatus(id, status) {
    return apiClient.put(`/commands/${id}/status`, status)
  },
  deleteCommand(id) {
    return apiClient.delete(`/commands/${id}`)
  },
  getPendingCommands(macAddress) {
    return apiClient.get(`/commands/device/${macAddress}/pending`)
  }
}