<template>
  <div class="home">
    <h1 class="mb-4">Dashboard</h1>
    
    <div class="row">
      <!-- Thống kê tổng quan -->
      <div class="col-md-3 mb-4">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <h5 class="card-title">Thiết bị</h5>
            <h2>{{ stats.devices }}</h2>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-4">
        <div class="card bg-success text-white">
          <div class="card-body">
            <h5 class="card-title">Kênh dữ liệu</h5>
            <h2>{{ stats.channels }}</h2>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-4">
        <div class="card bg-info text-white">
          <div class="card-body">
            <h5 class="card-title">Bản ghi dữ liệu</h5>
            <h2>{{ stats.dataPoints }}</h2>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-4">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <h5 class="card-title">Lệnh đang chờ</h5>
            <h2>{{ stats.pendingCommands }}</h2>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <!-- Dữ liệu mới nhất -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header bg-light">
            <h5 class="mb-0">Dữ liệu cảm biến mới nhất</h5>
          </div>
          <div class="card-body">
            <div v-if="latestData.length === 0" class="text-center p-4">
              <p class="text-muted">Chưa có dữ liệu nào</p>
            </div>
            <table v-else class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Kênh</th>
                  <th>Giá trị</th>
                  <th>Thời gian</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in latestData" :key="item.channelId">
                  <td>{{ item.channelName }}</td>
                  <td>{{ item.value }} {{ item.unit }}</td>
                  <td>{{ formatTime(item.timestamp) }}</td>
                  <td>
                    <router-link :to="`/sensor-data/${item.channelId}`" class="btn btn-sm btn-primary">
                      Xem
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Thiết bị hoạt động gần đây -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header bg-light">
            <h5 class="mb-0">Thiết bị hoạt động gần đây</h5>
          </div>
          <div class="card-body">
            <div v-if="devices.length === 0" class="text-center p-4">
              <p class="text-muted">Chưa có thiết bị nào</p>
            </div>
            <table v-else class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Tên thiết bị</th>
                  <th>MAC Address</th>
                  <th>Lần cuối hoạt động</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="device in devices" :key="device.id">
                  <td>{{ device.name }}</td>
                  <td>{{ device.macAddress }}</td>
                  <td>{{ formatTime(device.lastSeen) }}</td>
                  <td>
                    <span :class="getStatusClass(device.lastSeen)">
                      {{ getStatusText(device.lastSeen) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Home',
  data() {
    return {
      stats: {
        devices: 0,
        channels: 0,
        dataPoints: 0,
        pendingCommands: 0
      },
      latestData: [],
      devices: []
    }
  },
  mounted() {
    this.fetchDashboardData()
  },
  methods: {
    async fetchDashboardData() {
      try {
        // Lấy thiết bị
        const devicesResponse = await api.getDevices()
        this.devices = devicesResponse.data.data.slice(0, 5)
        this.stats.devices = devicesResponse.data.data.length
        
        // Lấy kênh dữ liệu
        const channelsResponse = await api.getChannels()
        const channels = channelsResponse.data.data
        this.stats.channels = channels.length
        
        // Lấy dữ liệu mới nhất từ các kênh
        this.latestData = []
        for (const channel of channels.slice(0, 5)) {
          try {
            const dataResponse = await api.getLatestData(channel.id)
            if (dataResponse.data.success && dataResponse.data.data) {
              this.latestData.push({
                channelId: channel.id,
                channelName: channel.name,
                value: dataResponse.data.data.value,
                unit: channel.unit || '',
                timestamp: dataResponse.data.data.timestamp
              })
            }
          } catch (error) {
            console.error(`Error fetching data for channel ${channel.id}:`, error)
          }
        }
        
        // Lấy tổng số điểm dữ liệu
        const dataResponse = await api.getSensorData(1, 1)
        this.stats.dataPoints = dataResponse.data.pagination?.total || 0
        
        // Lấy lệnh đang chờ
        const commandsResponse = await api.getCommands()
        this.stats.pendingCommands = commandsResponse.data.data.filter(cmd => cmd.status === 'PENDING').length
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    },
    
    formatTime(timestamp) {
      if (!timestamp) return 'N/A'
      const date = new Date(timestamp)
      return date.toLocaleString('vi-VN')
    },
    
    getStatusText(lastSeen) {
      if (!lastSeen) return 'Chưa kết nối'
      
      const now = new Date()
      const lastSeenDate = new Date(lastSeen)
      const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60))
      
      if (diffMinutes < 5) return 'Online'
      if (diffMinutes < 60) return 'Gần đây'
      return 'Offline'
    },
    
    getStatusClass(lastSeen) {
      if (!lastSeen) return 'badge bg-secondary'
      
      const now = new Date()
      const lastSeenDate = new Date(lastSeen)
      const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60))
      
      if (diffMinutes < 5) return 'badge bg-success'
      if (diffMinutes < 60) return 'badge bg-warning'
      return 'badge bg-danger'
    }
  }
}
</script>