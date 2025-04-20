<template>
  <div class="devices">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Quản lý thiết bị</h1>
      <button class="btn btn-primary" @click="showAddModal">Thêm thiết bị mới</button>
    </div>
    
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary"></div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    
    <div v-else-if="devices.length === 0" class="alert alert-info">
      Chưa có thiết bị nào. Hãy thêm thiết bị mới!
    </div>
    
    <div v-else class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên thiết bị</th>
            <th>MAC Address</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Lần cuối hoạt động</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="device in devices" :key="device.id">
            <td>{{ device.id }}</td>
            <td>{{ device.name }}</td>
            <td>{{ device.macAddress }}</td>
            <td>{{ device.description || 'N/A' }}</td>
            <td>
              <span :class="getStatusClass(device.lastSeen, device.isActive)">
                {{ getStatusText(device.lastSeen, device.isActive) }}
              </span>
            </td>
            <td>{{ formatTime(device.lastSeen) }}</td>
            <td>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-info" @click="editDevice(device)">Sửa</button>
                <button class="btn btn-success" @click="pingDevice(device.macAddress)">Ping</button>
                <button class="btn btn-danger" @click="confirmDelete(device)">Xóa</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Modal thêm/sửa thiết bị -->
    <div class="modal fade" id="deviceModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Sửa thiết bị' : 'Thêm thiết bị mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDevice">
              <div class="mb-3">
                <label for="deviceName" class="form-label">Tên thiết bị</label>
                <input type="text" class="form-control" id="deviceName" v-model="currentDevice.name" required>
              </div>
              
              <div class="mb-3">
                <label for="macAddress" class="form-label">MAC Address</label>
                <input type="text" class="form-control" id="macAddress" v-model="currentDevice.macAddress" 
                       :disabled="isEditing" required>
              </div>
              
              <div class="mb-3">
                <label for="description" class="form-label">Mô tả</label>
                <textarea class="form-control" id="description" v-model="currentDevice.description"></textarea>
              </div>
              
              <div class="mb-3 form-check" v-if="isEditing">
                <input type="checkbox" class="form-check-input" id="isActive" v-model="currentDevice.isActive">
                <label class="form-check-label" for="isActive">Kích hoạt</label>
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
    
    <!-- Modal xác nhận xóa -->
    <div class="modal fade" id="deleteModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            Bạn có chắc chắn muốn xóa thiết bị "{{ currentDevice.name }}" không?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="deleteDevice">Xóa</button>
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
  name: 'Devices',
  data() {
    return {
      devices: [],
      loading: true,
      error: null,
      isEditing: false,
      currentDevice: {
        id: null,
        name: '',
        macAddress: '',
        description: '',
        isActive: true
      },
      deviceModal: null,
      deleteModal: null
    }
  },
  mounted() {
    this.fetchDevices()
  },
  methods: {
    async fetchDevices() {
      this.loading = true
      try {
        const response = await api.getDevices()
        this.devices = response.data.data
        this.error = null
      } catch (err) {
        console.error('Error fetching devices:', err)
        this.error = 'Không thể tải danh sách thiết bị'
      } finally {
        this.loading = false
      }
    },
    
    formatTime(timestamp) {
      if (!timestamp) return 'N/A'
      const date = new Date(timestamp)
      return date.toLocaleString('vi-VN')
    },
    
    getStatusText(lastSeen, isActive) {
      if (!isActive) return 'Vô hiệu hóa'
      if (!lastSeen) return 'Chưa kết nối'
      
      const now = new Date()
      const lastSeenDate = new Date(lastSeen)
      const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60))
      
      if (diffMinutes < 5) return 'Online'
      if (diffMinutes < 60) return 'Gần đây'
      return 'Offline'
    },
    
    getStatusClass(lastSeen, isActive) {
      if (!isActive) return 'badge bg-secondary'
      if (!lastSeen) return 'badge bg-secondary'
      
      const now = new Date()
      const lastSeenDate = new Date(lastSeen)
      const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60))
      
      if (diffMinutes < 5) return 'badge bg-success'
      if (diffMinutes < 60) return 'badge bg-warning'
      return 'badge bg-danger'
    },
    
    showAddModal() {
      this.isEditing = false
      this.currentDevice = {
        id: null,
        name: '',
        macAddress: '',
        description: '',
        isActive: true
      }
      
      if (!this.deviceModal) {
        this.deviceModal = new Modal(document.getElementById('deviceModal'))
      }
      this.deviceModal.show()
    },
    
    editDevice(device) {
      this.isEditing = true
      this.currentDevice = { ...device }
      
      if (!this.deviceModal) {
        this.deviceModal = new Modal(document.getElementById('deviceModal'))
      }
      this.deviceModal.show()
    },
    
    async saveDevice() {
      try {
        if (this.isEditing) {
          await api.updateDevice(this.currentDevice.id, {
            name: this.currentDevice.name,
            description: this.currentDevice.description,
            isActive: this.currentDevice.isActive
          })
        } else {
          await api.createDevice({
            name: this.currentDevice.name,
            macAddress: this.currentDevice.macAddress,
            description: this.currentDevice.description
          })
        }
        
        this.deviceModal.hide()
        await this.fetchDevices()
      } catch (err) {
        console.error('Error saving device:', err)
        alert('Không thể lưu thiết bị. Vui lòng thử lại sau.')
      }
    },
    
    confirmDelete(device) {
      this.currentDevice = { ...device }
      
      if (!this.deleteModal) {
        this.deleteModal = new Modal(document.getElementById('deleteModal'))
      }
      this.deleteModal.show()
    },
    
    async deleteDevice() {
      try {
        await api.deleteDevice(this.currentDevice.id)
        this.deleteModal.hide()
        await this.fetchDevices()
      } catch (err) {
        console.error('Error deleting device:', err)
        alert('Không thể xóa thiết bị. Vui lòng thử lại sau.')
      }
    },
    
    async pingDevice(macAddress) {
      try {
        await api.pingDevice(macAddress)
        await this.fetchDevices()
      } catch (err) {
        console.error('Error pinging device:', err)
        alert('Không thể ping thiết bị. Vui lòng thử lại sau.')
      }
    }
  }
}
</script>