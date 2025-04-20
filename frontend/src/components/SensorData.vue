<template>
  <div class="sensor-data">
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary"></div>
      <p>Đang tải dữ liệu cảm biến...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else-if="data.length === 0" class="alert alert-info">
      Không có dữ liệu cảm biến nào.
    </div>
    
    <div v-else>
      <!-- Chọn trường dữ liệu khi có nhiều trường -->
      <div v-if="availableFields.length > 0" class="mb-3">
        <label for="fieldSelector" class="form-label">Chọn trường dữ liệu:</label>
        <select id="fieldSelector" v-model="selectedField" class="form-select">
          <option v-for="field in availableFields" :key="field.name" :value="field.name">
            {{ field.label }} ({{ field.unit }})
          </option>
        </select>
      </div>

      <!-- Biểu đồ dữ liệu -->
      <div v-if="showChart" class="mb-4">
        <canvas ref="chartCanvas" width="400" height="200"></canvas>
      </div>
      
      <!-- Bảng dữ liệu -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th v-if="showChannel">Kênh</th>
              <th v-for="field in availableFields" :key="field.name">
                {{ field.label }} ({{ field.unit }})
              </th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data" :key="item.id">
              <td>{{ item.id }}</td>
              <td v-if="showChannel">{{ item.channelName || `Kênh #${item.channelId}` }}</td>
              <td v-for="field in availableFields" :key="field.name">
                {{ getFieldValue(item, field.name) }} {{ field.unit }}
              </td>
              <td>{{ formatDateTime(item.timestamp) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Phân trang -->
      <div v-if="totalPages > 1" class="d-flex justify-content-center mt-3">
        <nav aria-label="Phân trang">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="$emit('page-change', currentPage - 1)">
                Trước
              </a>
            </li>
            <li v-for="page in paginationRange" :key="page" class="page-item" :class="{ active: currentPage === page }">
              <a class="page-link" href="#" @click.prevent="$emit('page-change', page)">
                {{ page }}
              </a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="$emit('page-change', currentPage + 1)">
                Sau
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'SensorData',
  props: {
    data: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    channelFields: {
      type: Array,
      default: () => []
    },
    showChannel: {
      type: Boolean,
      default: false
    },
    showChart: {
      type: Boolean,
      default: true
    },
    currentPage: {
      type: Number,
      default: 1
    },
    totalPages: {
      type: Number,
      default: 1
    },
    channelName: {
      type: String,
      default: 'Dữ liệu cảm biến'
    }
  },
  emits: ['page-change'],
  data() {
    return {
      chart: null,
      selectedField: null
    }
  },
  computed: {
    paginationRange() {
      const range = [];
      const delta = 2; // Số trang hiển thị trước và sau trang hiện tại
      
      for (let i = Math.max(1, this.currentPage - delta); i <= Math.min(this.totalPages, this.currentPage + delta); i++) {
        range.push(i);
      }
      
      return range;
    },
    // Trích xuất danh sách trường từ dữ liệu
    availableFields() {
      // Ưu tiên sử dụng fields được định nghĩa từ kênh
      if (this.channelFields && this.channelFields.length > 0) {
        return this.channelFields;
      }
      
      // Nếu không có fields từ kênh, tự động phát hiện từ dữ liệu
      if (this.data.length === 0) return [];
      
      const fields = [];
      const firstItem = this.data[0];
      
      if (firstItem && firstItem.data && typeof firstItem.data === 'object') {
        Object.keys(firstItem.data).forEach(key => {
          fields.push({
            name: key,
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            unit: ''
          });
        });
      } else if (firstItem && firstItem.value !== undefined) {
        // Tương thích ngược với cấu trúc cũ
        fields.push({
          name: 'value',
          label: 'Giá trị',
          unit: ''
        });
      }
      
      return fields;
    }
  },
  watch: {
    data: {
      handler() {
        this.updateChart();
      },
      deep: true
    },
    availableFields: {
      handler(newFields) {
        // Chọn trường đầu tiên khi danh sách trường thay đổi
        if (newFields.length > 0 && !this.selectedField) {
          this.selectedField = newFields[0].name;
        }
      },
      immediate: true
    },
    selectedField() {
      // Cập nhật biểu đồ khi thay đổi trường được chọn
      if (this.chart) {
        this.updateChart();
      }
    }
  },
  mounted() {
    if (this.showChart && this.data.length > 0) {
      this.createChart();
    }
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return 'N/A';
      const date = new Date(dateTimeStr);
      return date.toLocaleString('vi-VN');
    },
    // Lấy giá trị của một trường từ dữ liệu
    getFieldValue(item, fieldName) {
      if (item.data && typeof item.data === 'object') {
        return item.data[fieldName] || 'N/A';
      } else if (fieldName === 'value' && item.value !== undefined) {
        return item.value; // Tương thích ngược với cấu trúc cũ
      }
      return 'N/A';
    },
    createChart() {
      if (!this.$refs.chartCanvas || this.availableFields.length === 0) return;
      
      const ctx = this.$refs.chartCanvas.getContext('2d');
      
      this.updateChartData(ctx);
    },
    updateChart() {
      if (!this.chart || !this.showChart || this.availableFields.length === 0) return;
      
      const fieldInfo = this.availableFields.find(f => f.name === this.selectedField) || this.availableFields[0];
      
      // Sort data by timestamp
      const sortedData = [...this.data].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      // Update chart data
      this.chart.data.labels = sortedData.map(item => this.formatDateTime(item.timestamp));
      this.chart.data.datasets[0].data = sortedData.map(item => this.getFieldValue(item, this.selectedField));
      this.chart.data.datasets[0].label = `${fieldInfo.label} (${fieldInfo.unit})`;
      
      this.chart.update();
    },
    updateChartData(ctx) {
      if (!this.selectedField && this.availableFields.length > 0) {
        this.selectedField = this.availableFields[0].name;
      }
      
      const fieldInfo = this.availableFields.find(f => f.name === this.selectedField) || this.availableFields[0];
      
      // Sort data by timestamp
      const sortedData = [...this.data].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      // Prepare data for chart
      const labels = sortedData.map(item => this.formatDateTime(item.timestamp));
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
    }
  }
}
</script>