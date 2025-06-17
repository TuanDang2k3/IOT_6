<template>
  <div class="sensor-data">
    <div v-if="channelId">
      <!-- Channel data view -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Dữ liệu kênh: {{ channelInfo.name }}</h1>
        <div>
          <button class="btn btn-secondary me-2" @click="$router.push('/channels')">
            Quay lại
          </button>
          <button class="btn btn-success" @click="fetchChannelData">
            Làm mới
          </button>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">Thông tin kênh</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Tên kênh:</strong> {{ channelInfo.name }}</p>
              <p><strong>Mô tả:</strong> {{ channelInfo.description || 'Không có mô tả' }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Công khai:</strong> {{ channelInfo.isPublic ? 'Có' : 'Không' }}</p>
              <p>
                <strong>Các trường dữ liệu:</strong> 
                <span v-if="channelInfo.fields && channelInfo.fields.length">
                  <span v-for="(field, index) in channelInfo.fields" :key="field.name" 
                        class="badge bg-info me-1">
                    {{ field.label }} ({{ field.unit }})
                    <span v-if="index < channelInfo.fields.length - 1">, </span>
                  </span>
                </span>
                <span v-else class="text-muted">Không có trường dữ liệu được định nghĩa</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Bộ lọc dữ liệu</h5>
            <button class="btn btn-sm btn-secondary" @click="exportCsv">
              <i class="bi bi-download"></i> Xuất CSV
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <div class="mb-3">
                <label for="fieldSelect" class="form-label">Trường dữ liệu:</label>
                <select id="fieldSelect" v-model="selectedField" class="form-select">
                  <option 
                    v-for="field in channelFields" 
                    :key="field.name" 
                    :value="field.name"
                  >
                    {{ field.label }} ({{ field.unit }})
                  </option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="mb-3">
                <label for="startDate" class="form-label">Từ ngày:</label>
                <input type="datetime-local" id="startDate" v-model="filters.startDate" class="form-control">
              </div>
            </div>
            <div class="col-md-3">
              <div class="mb-3">
                <label for="endDate" class="form-label">Đến ngày:</label>
                <input type="datetime-local" id="endDate" v-model="filters.endDate" class="form-control">
              </div>
            </div>
            <div class="col-md-3">
              <div class="mb-3">
                <label for="limit" class="form-label">Số lượng bản ghi:</label>
                <select id="limit" v-model="filters.limit" class="form-select">
                  <option value="10">10</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="500">500</option>
                </select>
              </div>
            </div>
          </div>
          <div class="text-end">
            <button class="btn btn-primary" @click="applyFilters">Áp dụng</button>
          </div>
        </div>
      </div>
      
      <!-- Latest data -->      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">Dữ liệu mới nhất & Điều khiển thiết bị</h5>
        </div>
        <div class="card-body">          <div v-if="latestData" class="text-center">
            <div v-if="channelFields.length > 0" class="row">
              <div 
                v-for="field in channelFields" 
                :key="field.name" 
                class="col-md-4 col-lg-3 mb-3"
              >
                <div class="card sensor-card">
                  <div class="card-body text-center">
                    <div class="sensor-icon mb-2">{{ getFieldIcon(field.name) }}</div>
                    <h6 class="card-title mb-1">{{ getFieldDisplayName(field.name) }}</h6>
                    
                    <!-- Hiển thị giá trị cảm biến thường -->
                    <div v-if="!isControlField(field.name)" class="sensor-value">
                      <span class="value-number">
                        {{ formatFieldValue(getFieldValue(latestData, field.name), field.name) }}
                        <small v-if="getFieldUnit(field.name)" class="text-muted ms-1">
                          {{ getFieldUnit(field.name) }}
                        </small>
                      </span>
                    </div>
                      <!-- Nút điều khiển cho thiết bị -->
                    <div v-else class="device-control">
                      <div class="mb-2">
                        <span :class="getStatusClass(getFieldValue(latestData, field.name), field.name)">
                          {{ formatFieldValue(getFieldValue(latestData, field.name), field.name) }}
                        </span>
                      </div>                      <div class="btn-group w-100" role="group">
                        <button 
                          type="button" 
                          class="btn btn-sm position-relative"
                          :class="isDeviceOn(getFieldValue(latestData, field.name)) ? 'btn-success' : 'btn-outline-success'"
                          :disabled="isControlLoading(field.name, true)"
                          @click="controlDevice(field.name, true)"
                        >
                          <span v-if="!isControlLoading(field.name, true)">
                            <i class="bi bi-power me-1"></i>BẬT
                          </span>
                          <span v-else class="d-flex align-items-center">
                            <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                            <span>Đang bật...</span>
                          </span>
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-sm position-relative"
                          :class="!isDeviceOn(getFieldValue(latestData, field.name)) ? 'btn-danger' : 'btn-outline-danger'"
                          :disabled="isControlLoading(field.name, false)"
                          @click="controlDevice(field.name, false)"
                        >
                          <span v-if="!isControlLoading(field.name, false)">
                            <i class="bi bi-power me-1"></i>TẮT
                          </span>
                          <span v-else class="d-flex align-items-center">
                            <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                            <span>Đang tắt...</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <h2 class="display-1">{{ latestData.value || 'N/A' }}</h2>
              <p>Cập nhật: {{ formatTime(latestData.timestamp) }}</p>
            </div>
          </div>
          <div v-else class="text-center">
            <p class="text-muted">Chưa có dữ liệu nào</p>
          </div>
        </div>
      </div>
      
      <!-- Chart -->
      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0"></h5>
        </div>
        <div class="card-body">
          <canvas ref="chart" width="400" height="200"></canvas>
        </div>
      </div>
      
      <!-- Sensor data table -->
      <div class="card">
        <div class="card-header bg-light">
          <h5 class="mb-0">Lịch sử dữ liệu</h5>
        </div>
        <div class="card-body">
          <div v-if="loading" class="text-center my-4">
            <div class="spinner-border text-primary"></div>
          </div>
          
          <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
          
          <div v-else-if="sensorData.length === 0" class="alert alert-info">
            Không có dữ liệu nào.
          </div>
          
          <div v-else class="table-responsive">
            <table class="table table-striped table-hover">              <thead>
                <tr>
                  <th>ID</th>
                  <th v-for="field in channelFields" :key="field.name">
                    {{ field.label }}
                    <small v-if="field.unit" class="text-muted">({{ field.unit }})</small>
                  </th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="data in sensorData" :key="data.id">
                  <td>{{ data.id }}</td>
                  <td v-for="field in channelFields" :key="field.name">
                    <span 
                      v-if="['fanStatus', 'pumpStatus', 'lightStatus', 'ledStatus'].includes(field.name)"
                      :class="getStatusClass(getFieldValue(data, field.name), field.name)"
                    >
                      {{ formatFieldValue(getFieldValue(data, field.name), field.name) }}
                    </span>
                    <span v-else>
                      {{ formatFieldValue(getFieldValue(data, field.name), field.name) }}
                    </span>
                  </td>
                  <td>{{ formatTime(data.timestamp) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else>
      <!-- All sensor data view -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>Dữ liệu cảm biến</h1>
      </div>
      
      <div class="row mb-4">
        <div class="col-md-4" v-for="channel in channels" :key="channel.id">
          <div class="card mb-3">
            <div class="card-header bg-light">
              {{ channel.name }}
            </div>
            <div class="card-body">
              <div v-if="channelLatestData[channel.id]" class="text-center">
                <div v-if="channel.fields && channel.fields.length">
                  <div 
                    v-for="field in channel.fields.slice(0, 2)" 
                    :key="field.name"
                    class="mb-2"
                  >
                    <h5>{{ field.label }}</h5>
                    <h3>
                      {{ getFieldValue(channelLatestData[channel.id], field.name) }}
                      <small>{{ field.unit }}</small>
                    </h3>
                  </div>
                  <p v-if="channel.fields.length > 2" class="text-muted">
                    +{{ channel.fields.length - 2 }} trường khác...
                  </p>
                </div>
                <div v-else>
                  <h3>{{ channelLatestData[channel.id].value || 'N/A' }}</h3>
                </div>
                <p class="text-muted">
                  Cập nhật: {{ formatTime(channelLatestData[channel.id].timestamp) }}
                </p>
              </div>
              <div v-else class="text-center">
                <p class="text-muted">Chưa có dữ liệu</p>
              </div>
            </div>
            <div class="card-footer text-center">
              <router-link :to="`/sensor-data/${channel.id}`" class="btn btn-primary btn-sm">
                Xem chi tiết
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import Chart from 'chart.js/auto'
import Vue from 'vue'

export default {
  name: 'SensorDataView',
  data() {    return {      channelId: null,
      channelInfo: {},
      channels: [],
      channelLatestData: {},
      sensorData: [],
      latestData: null,
      loading: true,
      error: null,
      chart: null,
      selectedField: null,
      controlLoading: {}, // Object to track loading state per device field
      filters: {
        startDate: '',
        endDate: '',
        limit: 100
      }
    }
  },
  computed: {    
    channelFields() {
      if (this.channelInfo?.fields?.length) {
        return this.channelInfo.fields;
      }
      
      // Auto-detect fields with proper Vietnamese labels and icons
      if (this.latestData?.data && typeof this.latestData.data === 'object') {
        return Object.keys(this.latestData.data).map(key => ({
          name: key,
          label: this.getFieldDisplayName(key),
          unit: this.getFieldUnit(key),
          icon: this.getFieldIcon(key)
        }));
      }
      
      // Tương thích ngược với dữ liệu cũ
      if (this.latestData?.value !== undefined) {
        return [{
          name: 'value',
          label: 'Giá trị',
          unit: this.channelInfo.unit || ''
        }];
      }
      
      return [];
    }
  },
  created() {
    // Check if viewing specific channel data
    if (this.$route.params.id) {
      this.channelId = this.$route.params.id;
      this.fetchChannelInfo();
      this.fetchLatestData();
      this.fetchChannelData();
    } else {
      this.fetchAllChannelsData();
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.channelId && this.sensorData.length > 0) {
        this.initChart();
      }
    });
  },
  updated() {
    this.$nextTick(() => {
      if (this.channelId && this.sensorData.length > 0 && !this.chart) {
        this.initChart();
      }
    });
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    async fetchChannelInfo() {
      try {
        const response = await api.getChannel(this.channelId);
        this.channelInfo = response.data.data;
        
        // Chọn trường đầu tiên để hiển thị biểu đồ mặc định
        if (this.channelInfo.fields && this.channelInfo.fields.length > 0) {
          this.selectedField = this.channelInfo.fields[0].name;
        }
      } catch (err) {
        console.error('Error fetching channel info:', err);
        this.error = 'Không thể tải thông tin kênh';
      }
    },
    
    async fetchLatestData() {
      try {
        const response = await api.getLatestData(this.channelId);
        if (response.data.success && response.data.data) {
          this.latestData = response.data.data;
        }
      } catch (err) {
        console.error('Error fetching latest data:', err);
      }
    },
    
    async fetchChannelData() {
      this.loading = true;
      try {
        const params = { limit: this.filters.limit };
        if (this.filters.startDate) params.startDate = new Date(this.filters.startDate).toISOString();
        if (this.filters.endDate) params.endDate = new Date(this.filters.endDate).toISOString();
        
        const response = await api.getChannelData(this.channelId, params);
        this.sensorData = response.data.data;
        this.error = null;
        
        // Cập nhật biểu đồ nếu đã khởi tạo
        if (this.chart) {
          this.updateChart();
        }
      } catch (err) {
        console.error('Error fetching channel data:', err);
        this.error = 'Không thể tải dữ liệu cảm biến';
      } finally {
        this.loading = false;
      }
    },
    
    async fetchAllChannelsData() {
      this.loading = true;
      try {
        // Get all channels
        const channelsResponse = await api.getChannels();
        this.channels = channelsResponse.data.data;
        
        // Get latest data for each channel
        for (const channel of this.channels) {
          try {
            const response = await api.getLatestData(channel.id);
            if (response.data.success && response.data.data) {
              Vue.set(this.channelLatestData, channel.id, response.data.data);
            }
          } catch (error) {
            console.error(`Error fetching data for channel ${channel.id}:`, error);
          }
        }
        
        this.error = null;
      } catch (err) {
        console.error('Error fetching channels data:', err);
        this.error = 'Không thể tải dữ liệu kênh';
      } finally {
        this.loading = false;
      }
    },
    
    // Lấy giá trị của một trường từ dữ liệu
    getFieldValue(item, fieldName) {
      if (!item) return 'N/A';
      
      if (item.data && typeof item.data === 'object') {
        return item.data[fieldName] !== undefined ? item.data[fieldName] : 'N/A';
      } 
      else if (fieldName === 'value' && item.value !== undefined) {
        return item.value; // Tương thích ngược với cấu trúc cũ
      }
      
      return 'N/A';
    },
    
    initChart() {
      if (!this.$refs.chart || !this.sensorData.length || !this.selectedField) return;
      
      const ctx = this.$refs.chart.getContext('2d');
      
      // Sort data by timestamp
      const sortedData = [...this.sensorData].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      // Get field info
      const fieldInfo = this.channelFields.find(f => f.name === this.selectedField) || {
        name: this.selectedField,
        label: this.selectedField,
        unit: ''
      };
      
      // Prepare chart data
      const labels = sortedData.map(item => this.formatTime(item.timestamp));
      const values = sortedData.map(item => this.getFieldValue(item, this.selectedField));
      
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `${fieldInfo.label} (${fieldInfo.unit})`,
            data: values,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    },
    
    updateChart() {
      if (!this.chart || !this.selectedField) return;
      
      // Sort data by timestamp
      const sortedData = [...this.sensorData].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      // Get field info
      const fieldInfo = this.channelFields.find(f => f.name === this.selectedField) || {
        name: this.selectedField,
        label: this.selectedField,
        unit: ''
      };
      
      // Update chart data
      this.chart.data.labels = sortedData.map(item => this.formatTime(item.timestamp));
      this.chart.data.datasets[0].data = sortedData.map(item => this.getFieldValue(item, this.selectedField));
      this.chart.data.datasets[0].label = `${fieldInfo.label} (${fieldInfo.unit})`;
      
      this.chart.update();
    },
    
    formatTime(timestamp) {
      if (!timestamp) return 'N/A';
      const date = new Date(timestamp);
      return date.toLocaleString('vi-VN');
    },
    
    applyFilters() {
      this.fetchChannelData();
    },
    
    exportCsv() {
      if (this.sensorData.length === 0) {
        alert('Không có dữ liệu để xuất');
        return;
      }
      
      // Create headers
      const headers = ['ID', 'Timestamp'];
      this.channelFields.forEach(field => {
        headers.push(`${field.label} (${field.unit})`);
      });
      
      // Create CSV content
      let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\r\n';
      
      this.sensorData.forEach(row => {
        let rowData = [
          row.id,
          new Date(row.timestamp).toLocaleString('vi-VN')
        ];
        
        this.channelFields.forEach(field => {
          rowData.push(this.getFieldValue(row, field.name));
        });
        
        csvContent += rowData.join(',') + '\r\n';
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `sensor-data-channel-${this.channelId}.csv`);
      document.body.appendChild(link);
      
      // Download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
    },
    
    // Method để check xem field có phải là field điều khiển không
    isControlField(fieldName) {
      return ['fanStatus', 'pumpStatus', 'lightStatus', 'ledStatus'].includes(fieldName);
    },
    
    // Method để lấy tên hiển thị
    getFieldDisplayName(fieldName) {
      const fieldMap = {
        'temperature': 'Nhiệt độ',
        'soilMoisture': 'Độ ẩm đất',
        'soilHumidity': 'Độ ẩm đất',
        'humidity': 'Độ ẩm không khí',
        'airHumidity': 'Độ ẩm không khí',
        'lightIntensity': 'Cường độ ánh sáng',
        'lightLevel': 'Cường độ ánh sáng',
        'fanStatus': 'Trạng thái quạt',
        'pumpStatus': 'Trạng thái máy bơm', 
        'lightStatus': 'Trạng thái đèn',
        'ledStatus': 'Trạng thái đèn',
        'airQuality': 'Chất lượng không khí',
        'rainLevel': 'Lượng mưa'
      };
      
      return fieldMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    },
    
    // Method để lấy đơn vị
    getFieldUnit(fieldName) {
      const unitMap = {
        'temperature': '°C',
        'humidity': '%',
        'soilMoisture': '%',
        'soilHumidity': '%',
        'airHumidity': '%',
        'lightIntensity': 'lux',
        'lightLevel': 'lux',
        'fanStatus': '',
        'pumpStatus': '',
        'lightStatus': '',
        'ledStatus': '',
        'airQuality': 'ppm',
        'rainLevel': 'mm'
      };
      
      return unitMap[fieldName] || '';
    },
    
    // Method để lấy icon
    getFieldIcon(fieldName) {
      const iconMap = {
        'temperature': '🌡️',
        'humidity': '💧',
        'soilMoisture': '🌱',
        'soilHumidity': '🌱',
        'airHumidity': '💧',
        'lightIntensity': '💡',
        'lightLevel': '💡',
        'fanStatus': '🌀',
        'pumpStatus': '⚡',
        'lightStatus': '💡',
        'ledStatus': '💡',
        'airQuality': '🌬️',
        'rainLevel': '🌧️'
      };
      
      return iconMap[fieldName] || '📊';
    },
    
    // Method format giá trị hiển thị
    formatFieldValue(value, fieldName) {
      if (value === null || value === undefined) return 'N/A';
      
      // Xử lý trạng thái thiết bị (ON/OFF)
      if (['fanStatus', 'pumpStatus', 'lightStatus', 'ledStatus'].includes(fieldName)) {
        if (typeof value === 'boolean') {
          return value ? 'BẬT' : 'TẮT';
        }
        if (typeof value === 'number') {
          return value === 1 ? 'BẬT' : 'TẮT';
        }
        if (typeof value === 'string') {
          const upperValue = value.toUpperCase();
          if (upperValue === 'ON' || upperValue === '1' || upperValue === 'TRUE') return 'BẬT';
          if (upperValue === 'OFF' || upperValue === '0' || upperValue === 'FALSE') return 'TẮT';
        }
      }
      
      // Định dạng số với 1 chữ số thập phân cho các cảm biến
      if (typeof value === 'number' && !['fanStatus', 'pumpStatus', 'lightStatus', 'ledStatus'].includes(fieldName)) {
        return Number(value).toFixed(1);
      }
      
      return value;
    },
    
    // Method lấy class CSS cho trạng thái
    getStatusClass(value, fieldName) {
      if (!['fanStatus', 'pumpStatus', 'lightStatus', 'ledStatus'].includes(fieldName)) {
        return '';
      }
      
      const isOn = this.isDeviceOn(value);
      return isOn ? 'badge bg-success' : 'badge bg-secondary';
    },
    
    // Method check trạng thái ON/OFF
    isDeviceOn(value) {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value === 1;
      if (typeof value === 'string') {
        const upperValue = value.toUpperCase();
        return upperValue === 'ON' || upperValue === '1' || upperValue === 'TRUE';
      }
      return false;
    },      // Method điều khiển thiết bị - gửi lệnh xuống ESP32
    async controlDevice(deviceField, turnOn) {
      const loadingKey = `${deviceField}_${turnOn}`;
      
      if (this.controlLoading[loadingKey]) return; // Prevent multiple clicks
        // Set loading state for this specific button
      Vue.set(this.controlLoading, loadingKey, true);
      
      try {
        // Map device field to command (similar to Commands.vue)
        const commandMap = {
          'fanStatus': turnOn ? 'FAN_ON' : 'FAN_OFF',
          'pumpStatus': turnOn ? 'PUMP_ON' : 'PUMP_OFF',
          'lightStatus': turnOn ? 'LIGHT_ON' : 'LIGHT_OFF',
          'ledStatus': turnOn ? 'LED_ON' : 'LED_OFF'
        };
        
        const command = commandMap[deviceField];
        if (!command) {
          throw new Error('Unknown device field');
        }
        
        // Find deviceId from channelInfo or use default
        const deviceId = this.channelInfo.deviceId || 1;
        
        // Create parameters based on device type (matching Commands.vue)
        let parameters = {};
        switch (deviceField) {
          case 'fanStatus':
            parameters = turnOn ? { pin: 12, speed: 255 } : { pin: 12 };
            break;
          case 'pumpStatus':
            parameters = turnOn ? { pin: 13, power: 100 } : { pin: 13 };
            break;
          case 'lightStatus':
          case 'ledStatus':
            parameters = turnOn ? { pin: 14, brightness: 255 } : { pin: 14 };
            break;
        }
        
        // Send control command
        const response = await api.createCommand({
          deviceId: deviceId,
          command: command,
          parameters: parameters
        });
        
        if (response.data.success) {
          // Wait for ESP32 to process the command (simulate real execution time)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Optionally: Poll command status to verify execution
          // const commandStatus = await api.getCommandStatus(response.data.commandId);
          // if (commandStatus.data.status === 'executed') { ... }
          
          // Refresh data from server to get actual device state
          await this.fetchLatestData();
          
          const deviceName = this.getFieldDisplayName(deviceField);
          const action = turnOn ? 'bật' : 'tắt';
          
          // Show success message only after confirmation
          this.$toast?.success(`${deviceName} đã được ${action} thành công!`) || 
          alert(`${deviceName} đã được ${action} thành công!`);
          
        } else {
          throw new Error(response.data.message || 'Command creation failed');
        }
        
      } catch (err) {
        console.error('Error controlling device:', err);
        
        const deviceName = this.getFieldDisplayName(deviceField);
        const action = turnOn ? 'bật' : 'tắt';
        
        // Show specific error message
        let errorMessage = `Không thể ${action} ${deviceName}.`;
        if (err.response?.status === 404) {
          errorMessage += ' Thiết bị không tìm thấy.';
        } else if (err.response?.status >= 500) {
          errorMessage += ' Lỗi server.';
        } else if (!navigator.onLine) {
          errorMessage += ' Kiểm tra kết nối mạng.';
        } else {
          errorMessage += ' Vui lòng thử lại.';
        }
        
        this.$toast?.error(errorMessage) || alert(errorMessage);
        
      } finally {        // Clear loading state for this specific button
        Vue.set(this.controlLoading, loadingKey, false);
      }
    },
    
    // Helper method to check if a specific button is loading
    isControlLoading(deviceField, turnOn) {
      const loadingKey = `${deviceField}_${turnOn}`;
      return this.controlLoading[loadingKey] || false;
    },
  },
  watch: {
    '$route'(to) {
      // Handle route changes
      if (to.params.id) {
        this.channelId = to.params.id;
        this.fetchChannelInfo();
        this.fetchLatestData();
        this.fetchChannelData();
      } else {
        this.channelId = null;
        this.fetchAllChannelsData();
      }
    },
    selectedField() {
      if (this.chart) {
        this.updateChart();
      }
    },
    sensorData() {
      this.$nextTick(() => {
        if (this.channelId && this.sensorData.length > 0) {
          if (!this.chart) {
            this.initChart();
          } else {
            this.updateChart();
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.sensor-card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.sensor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.sensor-icon {
  font-size: 2rem;
}

.sensor-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.value-number {
  color: #3498db;
}

.badge {
  font-size: 0.9rem;
  padding: 0.5em 1em;
}

.bg-success {
  background-color: #28a745 !important;
}

.bg-secondary {
  background-color: #6c757d !important;
}

.card-title {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.table th {
  border-top: none;
  font-weight: 600;
  background-color: #f8f9fa;
}

.table-responsive {
  border-radius: 0.375rem;
  overflow: hidden;
}

/* Styles cho nút điều khiển thiết bị */
.device-control {
  margin-top: 0.5rem;
}

.device-control .btn-group {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 0.375rem;
  overflow: hidden;
}

.device-control .btn {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-control .btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.device-control .btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.device-control .btn-success {
  background: linear-gradient(45deg, #28a745, #20c997);
  border: none;
}

.device-control .btn-danger {
  background: linear-gradient(45deg, #dc3545, #fd7e14);
  border: none;
}

.device-control .btn-outline-success {
  border-color: #28a745;
  color: #28a745;
  background: transparent;
}

.device-control .btn-outline-danger {
  border-color: #dc3545;
  color: #dc3545;
  background: transparent;
}

.device-control .bi {
  font-size: 0.9rem;
}

/* Loading spinner styles */
.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
  border-width: 0.125rem;
}

/* Smooth loading transition */
.device-control .btn span {
  transition: opacity 0.2s ease;
}

.device-control .btn:disabled span {
  opacity: 0.8;
}
</style>