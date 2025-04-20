<template>
  <div class="commands">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Quản lý lệnh điều khiển</h1>
      <button class="btn btn-primary" @click="showAddModal">Tạo lệnh mới</button>
    </div>
    
    <div class="card mb-4">
      <div class="card-header bg-light">
        <h5 class="mb-0">Bộ lọc</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <div class="mb-3">
              <label for="deviceFilter" class="form-label">Thiết bị:</label>
              <select id="deviceFilter" v-model="filters.deviceId" class="form-select">
                <option value="">Tất cả thiết bị</option>
                <option v-for="device in devices" :key="device.id" :value="device.id">
                  {{ device.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label for="statusFilter" class="form-label">Trạng thái:</label>
              <select id="statusFilter" v-model="filters.status" class="form-select">
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Đang chờ</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="FAILED">Thất bại</option>
                <option value="EXPIRED">Hết hạn</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label for="commandFilter" class="form-label">Loại lệnh:</label>
              <select id="commandFilter" v-model="filters.command" class="form-select">
                <option value="">Tất cả lệnh</option>
                <option value="LED_ON">Bật LED</option>
                <option value="LED_OFF">Tắt LED</option>
                <option value="FAN_ON">Bật quạt</option>
                <option value="FAN_OFF">Tắt quạt</option>
                <option value="BUZZER_ON">Bật còi</option>
                <option value="BUZZER_OFF">Tắt còi</option>
                <option value="DISPLAY_TEXT">Hiển thị văn bản</option>
                <option value="READ_SENSOR">Đọc cảm biến</option>
                <option value="RESTART">Khởi động lại</option>
                <option value="CONFIGURE">Cấu hình</option>
              </select>
            </div>
          </div>
        </div>
        <div class="text-end">
          <button class="btn btn-primary" @click="applyFilters">Áp dụng</button>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary"></div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    
    <div v-else-if="filteredCommands.length === 0" class="alert alert-info">
      Không có lệnh nào phù hợp với bộ lọc.
    </div>
    
    <div v-else class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Thiết bị</th>
            <th>Lệnh</th>
            <th>Trạng thái</th>
            <th>Thời gian tạo</th>
            <th>Tham số</th>
            <th>Kết quả</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="command in filteredCommands" :key="command.id">
            <td>{{ command.id }}</td>
            <td>{{ getDeviceName(command.deviceId) }}</td>
            <td>{{ command.command }}</td>
            <td>
              <span :class="getStatusClass(command.status)">
                {{ getStatusText(command.status) }}
              </span>
            </td>
            <td>{{ formatTime(command.createdAt) }}</td>
            <td>
              <button class="btn btn-sm btn-info" @click="showParams(command)">
                Xem
              </button>
            </td>
            <td>
              <button v-if="command.result" class="btn btn-sm btn-primary" @click="showResult(command)">
                Xem
              </button>
              <span v-else>-</span>
            </td>
            <td>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-danger" @click="confirmDelete(command)">Xóa</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Modal thêm lệnh -->
    <div class="modal fade" id="commandModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tạo lệnh mới</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCommand">
              <div class="mb-3">
                <label for="deviceId" class="form-label">Thiết bị</label>
                <select id="deviceId" v-model="currentCommand.deviceId" class="form-select" required>
                  <option value="">Chọn thiết bị</option>
                  <option v-for="device in devices" :key="device.id" :value="device.id">
                    {{ device.name }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="commandType" class="form-label">Loại lệnh</label>
                <select id="commandType" v-model="currentCommand.command" class="form-select" required>
                  <option value="">Chọn loại lệnh</option>
                  <option value="LED_ON">Bật LED</option>
                  <option value="LED_OFF">Tắt LED</option>
                  <option value="FAN_ON">Bật quạt</option>
                  <option value="FAN_OFF">Tắt quạt</option>
                  <option value="BUZZER_ON">Bật còi</option>
                  <option value="BUZZER_OFF">Tắt còi</option>
                  <option value="DISPLAY_TEXT">Hiển thị văn bản</option>
                  <option value="READ_SENSOR">Đọc cảm biến</option>
                  <option value="RESTART">Khởi động lại</option>
                  <option value="CONFIGURE">Cấu hình</option>
                </select>
              </div>
              
              <!-- LED_ON params -->
              <div v-if="currentCommand.command === 'LED_ON'" class="mb-3">
                <label class="form-label">Tham số</label>
                <div class="card">
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="ledPin" class="form-label">Chân LED</label>
                      <input type="number" id="ledPin" v-model="ledParams.pin" class="form-control" required>
                    </div>
                    <div class="mb-3">
                      <label for="brightness" class="form-label">Độ sáng (0-255)</label>
                      <input type="number" id="brightness" v-model="ledParams.brightness" class="form-control" min="0" max="255">
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- LED_OFF params -->
              <div v-if="currentCommand.command === 'LED_OFF'" class="mb-3">
                <label class="form-label">Tham số</label>
                <div class="card">
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="ledPinOff" class="form-label">Chân LED</label>
                      <input type="number" id="ledPinOff" v-model="ledOffParams.pin" class="form-control" required>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- FAN_ON params -->
              <div v-if="currentCommand.command === 'FAN_ON'" class="mb-3">
                <label class="form-label">Tham số</label>
                <div class="card">
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="fanPin" class="form-label">Chân quạt</label>
                      <input type="number" id="fanPin" v-model="fanParams.pin" class="form-control" required>
                    </div>
                    <div class="mb-3">
                      <label for="fanSpeed" class="form-label">Tốc độ quạt (0-255)</label>
                      <input type="number" id="fanSpeed" v-model="fanParams.speed" class="form-control" min="0" max="255">
                    </div>
                  </div>
                </div>
              </div>

              <!-- FAN_OFF params -->
              <div v-if="currentCommand.command === 'FAN_OFF'" class="mb-3">
                <label class="form-label">Tham số</label>
                <div class="card">
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="fanPinOff" class="form-label">Chân quạt</label>
                      <input type="number" id="fanPinOff" v-model="fanParams.pin" class="form-control" required>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BUZZER_ON params -->
              <div v-if="currentCommand.command === 'BUZZER_ON'" class="mb-3">
                <label class="form-label">Tham số</label>
                <div class="card">
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="buzzerPin" class="form-label">Chân điều khiển còi</label>
                      <input type="number" id="buzzerPin" v-model="buzzerParams.pin" class="form-control" required>
                    </div>
                    <div class="mb-3">
                      <label for="buzzerDuration" class="form-label">Thời gian kêu (ms)</label>
                      <input type="number" id="buzzerDuration" v-model="buzzerParams.duration" class="form-control" min="100">
                    </div>
                    <div class="mb-3">
                      <label for="buzzerPattern" class="form-label">Kiểu âm thanh</label>
                      <select id="buzzerPattern" v-model="buzzerParams.pattern" class="form-select">
                        <option value="CONTINUOUS">Liên tục</option>
                        <option value="BEEP">Ngắt quãng</option>
                        <option value="SOS">SOS (khẩn cấp)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BUZZER_OFF params -->
              <div v-if="currentCommand.command === 'BUZZER_OFF'" class="mb-3">
                <label class="form-label">Tham số</label>
                <div class="card">
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="buzzerPinOff" class="form-label">Chân điều khiển còi</label>
                      <input type="number" id="buzzerPinOff" v-model="buzzerParams.pin" class="form-control" required>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- DISPLAY_TEXT params -->
              <div v-if="currentCommand.command === 'DISPLAY_TEXT'" class="mb-3">
                <label class="form-label">Tham số</label>
                <div class="card">
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="displayText" class="form-label">Văn bản</label>
                      <input type="text" id="displayText" v-model="displayParams.text" class="form-control" required>
                    </div>
                    <div class="mb-3">
                      <label for="fontSize" class="form-label">Cỡ chữ</label>
                      <select id="fontSize" v-model="displayParams.fontSize" class="form-select">
                        <option value="12">Nhỏ (12px)</option>
                        <option value="16">Vừa (16px)</option>
                        <option value="24">Lớn (24px)</option>
                      </select>
                    </div>
                    <div class="mb-3">
                      <label for="duration" class="form-label">Thời gian hiển thị (ms)</label>
                      <input type="number" id="duration" v-model="displayParams.duration" class="form-control" min="1000">
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- READ_SENSOR params -->
              <div v-if="currentCommand.command === 'READ_SENSOR'" class="mb-3">
                <label class="form-label">Tham số</label>
                <div class="card">
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="sensorType" class="form-label">Loại cảm biến</label>
                      <select id="sensorType" v-model="sensorParams.sensorType" class="form-select" required>
                        <option value="DHT11">DHT11 (Nhiệt độ & Độ ẩm)</option>
                        <option value="DHT22">DHT22 (Nhiệt độ & Độ ẩm)</option>
                        <option value="MQ135">MQ135 (Chất lượng không khí)</option>
                        <option value="RAIN">Cảm biến lượng mưa</option>
                        <option value="BMP280">BMP280 (Áp suất & Nhiệt độ)</option>
                        <option value="SOIL">Độ ẩm đất</option>
                        <option value="LDR">Cảm biến ánh sáng</option>
                      </select>
                    </div>
                    <div class="mb-3">
                      <label for="sensorPin" class="form-label">Chân cảm biến</label>
                      <input type="number" id="sensorPin" v-model="sensorParams.pin" class="form-control" required>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- RESTART params -->
              <div v-if="currentCommand.command === 'RESTART'" class="mb-3">
                <label class="form-label">Tham số</label>
                <div class="card">
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="delay" class="form-label">Độ trễ (ms)</label>
                      <input type="number" id="delay" v-model="restartParams.delay" class="form-control" min="0">
                    </div>
                    <div class="mb-3 form-check">
                      <input type="checkbox" class="form-check-input" id="clearSettings" v-model="restartParams.clearSettings">
                      <label class="form-check-label" for="clearSettings">Xóa cài đặt</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- CONFIGURE params -->
              <div v-if="currentCommand.command === 'CONFIGURE'" class="mb-3">
                <label class="form-label">Tham số</label>
                <div class="card">
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="readInterval" class="form-label">Chu kỳ đọc dữ liệu (ms)</label>
                      <input type="number" id="readInterval" v-model="configParams.readInterval" class="form-control" min="1000">
                    </div>
                    <div class="mb-3 form-check">
                      <input type="checkbox" class="form-check-input" id="deepSleepEnabled" v-model="configParams.deepSleepEnabled">
                      <label class="form-check-label" for="deepSleepEnabled">Bật chế độ ngủ sâu</label>
                    </div>
                    <div class="mb-3" v-if="configParams.deepSleepEnabled">
                      <label for="deepSleepDuration" class="form-label">Thời gian ngủ sâu (ms)</label>
                      <input type="number" id="deepSleepDuration" v-model="configParams.deepSleepDuration" class="form-control" min="10000">
                    </div>
                    <div class="mb-3">
                      <label for="wifiTimeout" class="form-label">Timeout kết nối WiFi (ms)</label>
                      <input type="number" id="wifiTimeout" v-model="configParams.wifiTimeout" class="form-control" min="5000">
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xem tham số -->
    <div class="modal fade" id="paramsModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tham số lệnh</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <pre class="bg-light p-3 rounded">{{ currentParams }}</pre>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xem kết quả -->
    <div class="modal fade" id="resultModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Kết quả thực hiện</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <pre class="bg-light p-3 rounded">{{ currentResult }}</pre>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận xóa -->
    <div class="modal fade" id="deleteModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            Bạn có chắc chắn muốn xóa lệnh này không?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="deleteCommand">Xóa</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import { Modal } from 'bootstrap'

export default {
  name: 'Commands',
  data() {
    return {
      commands: [],
      devices: [],
      loading: true,
      error: null,
      currentCommand: {
        id: null,
        deviceId: '',
        command: '',
        parameters: {}
      },
      currentParams: '',
      currentResult: '',
      commandModal: null,
      paramsModal: null,
      resultModal: null,
      deleteModal: null,
      ledParams: {
        pin: 13,
        brightness: 255
      },
      ledOffParams: {
        pin: 13
      },
      displayParams: {
        text: '',
        fontSize: 16,
        duration: 5000
      },
      fanParams: {
        pin: 12,
        speed: 255
      },
      buzzerParams: {
        pin: 14,
        duration: 1000,
        pattern: 'CONTINUOUS'
      },
      sensorParams: {
        sensorType: 'DHT22',
        pin: 4
      },
      restartParams: {
        delay: 5000,
        clearSettings: false
      },
      configParams: {
        readInterval: 60000,
        deepSleepEnabled: false,
        deepSleepDuration: 300000,
        wifiTimeout: 10000
      },
      filters: {
        deviceId: '',
        status: '',
        command: ''
      }
    }
  },
  computed: {
    filteredCommands() {
      return this.commands.filter(command => {
        if (this.filters.deviceId && command.deviceId != this.filters.deviceId) return false
        if (this.filters.status && command.status !== this.filters.status) return false
        if (this.filters.command && command.command !== this.filters.command) return false
        return true
      })
    }
  },
  mounted() {
    this.fetchCommands()
    this.fetchDevices()
  },
  methods: {
    async fetchCommands() {
      this.loading = true
      try {
        const response = await api.getCommands()
        this.commands = response.data.data
        this.error = null
      } catch (err) {
        console.error('Error fetching commands:', err)
        this.error = 'Không thể tải danh sách lệnh'
      } finally {
        this.loading = false
      }
    },
    
    async fetchDevices() {
      try {
        const response = await api.getDevices()
        this.devices = response.data.data
      } catch (err) {
        console.error('Error fetching devices:', err)
      }
    },
    
    getDeviceName(deviceId) {
      const device = this.devices.find(d => d.id === deviceId)
      return device ? device.name : `Thiết bị #${deviceId}`
    },
    
    formatTime(timestamp) {
      if (!timestamp) return 'N/A'
      const date = new Date(timestamp)
      return date.toLocaleString('vi-VN')
    },
    
    getStatusText(status) {
      switch (status) {
        case 'PENDING': return 'Đang chờ'
        case 'COMPLETED': return 'Hoàn thành'
        case 'FAILED': return 'Thất bại'
        case 'EXPIRED': return 'Hết hạn'
        default: return status
      }
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'PENDING': return 'badge bg-warning'
        case 'COMPLETED': return 'badge bg-success'
        case 'FAILED': return 'badge bg-danger'
        case 'EXPIRED': return 'badge bg-secondary'
        default: return 'badge bg-info'
      }
    },
    
    showAddModal() {
      // Reset các tham số
      this.currentCommand = {
        id: null,
        deviceId: '',
        command: '',
        parameters: {}
      }
      this.ledParams = { pin: 13, brightness: 255 }
      this.ledOffParams = { pin: 13 }
      this.displayParams = { text: '', fontSize: 16, duration: 5000 }
      this.fanParams = { pin: 12, speed: 255 }
      this.buzzerParams = { pin: 14, duration: 1000, pattern: 'CONTINUOUS' }
      this.sensorParams = { sensorType: 'DHT22', pin: 4 }
      this.restartParams = { delay: 5000, clearSettings: false }
      this.configParams = {
        readInterval: 60000,
        deepSleepEnabled: false,
        deepSleepDuration: 300000,
        wifiTimeout: 10000
      }
      
      if (!this.commandModal) {
        this.commandModal = new Modal(document.getElementById('commandModal'))
      }
      this.commandModal.show()
    },
    
    showParams(command) {
      this.currentParams = JSON.stringify(command.parameters, null, 2)
      
      if (!this.paramsModal) {
        this.paramsModal = new Modal(document.getElementById('paramsModal'))
      }
      this.paramsModal.show()
    },
    
    showResult(command) {
      this.currentResult = JSON.stringify(command.result, null, 2)
      
      if (!this.resultModal) {
        this.resultModal = new Modal(document.getElementById('resultModal'))
      }
      this.resultModal.show()
    },
    
    confirmDelete(command) {
      this.currentCommand = { ...command }
      
      if (!this.deleteModal) {
        this.deleteModal = new Modal(document.getElementById('deleteModal'))
      }
      this.deleteModal.show()
    },
    
    applyFilters() {
      // Các bộ lọc đã được áp dụng qua computed property
    },
    
    async saveCommand() {
      // Chuẩn bị tham số dựa trên loại lệnh
      let parameters = {}
      
      switch (this.currentCommand.command) {
        case 'LED_ON':
          parameters = { ...this.ledParams }
          break
        case 'LED_OFF':
          parameters = { pin: this.ledOffParams.pin }
          break
        case 'FAN_ON':
          parameters = { ...this.fanParams }
          break
        case 'FAN_OFF':
          parameters = { pin: this.fanParams.pin }
          break
        case 'BUZZER_ON':
          parameters = { ...this.buzzerParams }
          break
        case 'BUZZER_OFF':
          parameters = { pin: this.buzzerParams.pin }
          break
        case 'DISPLAY_TEXT':
          parameters = { ...this.displayParams }
          break
        case 'READ_SENSOR':
          parameters = { ...this.sensorParams }
          break
        case 'RESTART':
          parameters = { ...this.restartParams }
          break
        case 'CONFIGURE':
          parameters = { ...this.configParams }
          break
      }
      
      try {
        await api.createCommand({
          deviceId: this.currentCommand.deviceId,
          command: this.currentCommand.command,
          parameters
        })
        
        this.commandModal.hide()
        await this.fetchCommands()
      } catch (err) {
        console.error('Error creating command:', err)
        alert('Không thể tạo lệnh. Vui lòng thử lại sau.')
      }
    },
    
    async deleteCommand() {
      try {
        await api.deleteCommand(this.currentCommand.id)
        this.deleteModal.hide()
        await this.fetchCommands()
      } catch (err) {
        console.error('Error deleting command:', err)
        alert('Không thể xóa lệnh. Vui lòng thử lại sau.')
      }
    }
  }
}
</script>