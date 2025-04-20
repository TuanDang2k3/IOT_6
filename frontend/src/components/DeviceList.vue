<template>
  <div class="device-list">
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary"></div>
      <p>Đang tải danh sách thiết bị...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
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
            <td>
              <span :class="getStatusBadgeClass(device.lastSeen, device.isActive)">
                {{ getStatusText(device.lastSeen, device.isActive) }}
              </span>
            </td>
            <td>{{ formatDateTime(device.lastSeen) }}</td>
            <td>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-info" @click="$emit('view', device)">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-primary" @click="$emit('edit', device)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-success" @click="$emit('ping', device.macAddress)">
                  <i class="bi bi-broadcast"></i>
                </button>
                <button class="btn btn-danger" @click="$emit('delete', device)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceList',
  props: {
    devices: {
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
    }
  },
  emits: ['view', 'edit', 'ping', 'delete'],
  methods: {
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return 'Chưa kết nối';
      const date = new Date(dateTimeStr);
      return date.toLocaleString('vi-VN');
    },
    getStatusText(lastSeen, isActive) {
      if (!isActive) return 'Vô hiệu hóa';
      if (!lastSeen) return 'Chưa kết nối';
      
      const now = new Date();
      const lastSeenDate = new Date(lastSeen);
      const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
      
      if (diffMinutes < 5) return 'Online';
      if (diffMinutes < 60) return 'Gần đây';
      return 'Offline';
    },
    getStatusBadgeClass(lastSeen, isActive) {
      if (!isActive) return 'badge bg-secondary';
      if (!lastSeen) return 'badge bg-secondary';
      
      const now = new Date();
      const lastSeenDate = new Date(lastSeen);
      const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
      
      if (diffMinutes < 5) return 'badge bg-success';
      if (diffMinutes < 60) return 'badge bg-warning';
      return 'badge bg-danger';
    }
  }
}
</script>