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
      
      <!-- Latest data -->
      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">Dữ liệu mới nhất</h5>
        </div>
        <div class="card-body">
          <div v-if="latestData" class="text-center">
  <div v-if="channelFields.length > 0" class="row">
    <div 
      v-for="field in channelFields" 
      :key="field.name" 
      class="col-md-4"
    >
      <div class="card mb-3">
        <div class="card-body">
          <h3 class="card-title">{{ field.label }}</h3>
          <h2 class="display-5">
            {{ getFieldValue(latestData, field.name) }}
            <small>{{ field.unit }}</small>
          </h2>
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
          <h5 class="mb-0">Biểu đồ dữ liệu</h5>
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
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th v-for="field in channelFields" :key="field.name">
                    {{ field.label }} ({{ field.unit }})
                  </th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="data in sensorData" :key="data.id">
                  <td>{{ data.id }}</td>
                  <td v-for="field in channelFields" :key="field.name">
                    {{ getFieldValue(data, field.name) }}
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

export default {
  name: 'SensorDataView',
  data() {
    return {
      channelId: null,
      channelInfo: {},
      channels: [],
      channelLatestData: {},
      sensorData: [],
      latestData: null,
      loading: true,
      error: null,
      chart: null,
      selectedField: null,
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
       // Auto-detect fields from nested data structure
      if (this.latestData?.data && typeof this.latestData.data === 'object') {
        return Object.keys(this.latestData.data).map(key => ({
          name: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          unit: key === 'temperature' ? '°C' : 
                key === 'humidity' ? '%' :
                key === 'airQuality' ? 'ppm' :
                key === 'rainLevel' ? 'mm' : ''
        }));
      }
      // Nếu không có fields được định nghĩa, tự động phát hiện từ dữ liệu
      // if (this.latestData?.data && typeof this.latestData.data === 'object') {
      //   return Object.keys(this.latestData.data).map(key => ({
      //     name: key,
      //     label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      //     unit: ''
      //   }));
      // }
      
      // // Tương thích ngược với dữ liệu cũ
      // if (this.latestData?.value !== undefined) {
      //   return [{
      //     name: 'value',
      //     label: 'Giá trị',
      //     unit: this.channelInfo.unit || ''
      //   }];
      // }
      
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
              this.$set(this.channelLatestData, channel.id, response.data.data);
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
    }
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