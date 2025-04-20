<template>
    <div class="command-list">
      <div v-if="loading" class="text-center my-4">
        <div class="spinner-border text-primary"></div>
        <p>Đang tải danh sách lệnh điều khiển...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div v-else-if="commands.length === 0" class="alert alert-info">
        Không có lệnh điều khiển nào.
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
            <tr v-for="command in commands" :key="command.id">
              <td>{{ command.id }}</td>
              <td>{{ getDeviceName(command.deviceId) }}</td>
              <td>{{ command.command }}</td>
              <td>
                <span :class="getStatusBadgeClass(command.status)">
                  {{ getStatusText(command.status) }}
                </span>
              </td>
              <td>{{ formatDateTime(command.createdAt) }}</td>
              <td>
                <button class="btn btn-sm btn-info" @click="$emit('view-params', command)">
                  <i class="bi bi-list-ul"></i>
                </button>
              </td>
              <td>
                <button v-if="command.result" class="btn btn-sm btn-primary" @click="$emit('view-result', command)">
                  <i class="bi bi-eye"></i>
                </button>
                <span v-else>-</span>
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button v-if="command.status === 'PENDING'" class="btn btn-warning" @click="$emit('mark-expired', command.id)">
                    <i class="bi bi-clock-history"></i>
                  </button>
                  <button class="btn btn-danger" @click="$emit('delete', command)">
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
    name: 'CommandList',
    props: {
      commands: {
        type: Array,
        required: true
      },
      devices: {
        type: Array,
        default: () => []
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
    emits: ['view-params', 'view-result', 'mark-expired', 'delete'],
    methods: {
      formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return 'N/A';
        const date = new Date(dateTimeStr);
        return date.toLocaleString('vi-VN');
      },
      getDeviceName(deviceId) {
        const device = this.devices.find(d => d.id === deviceId);
        return device ? device.name : `Thiết bị #${deviceId}`;
      },
      getStatusText(status) {
        switch (status) {
          case 'PENDING': return 'Đang chờ';
          case 'COMPLETED': return 'Hoàn thành';
          case 'FAILED': return 'Thất bại';
          case 'EXPIRED': return 'Hết hạn';
          default: return status;
        }
      },
      getStatusBadgeClass(status) {
        switch (status) {
          case 'PENDING': return 'badge bg-warning';
          case 'COMPLETED': return 'badge bg-success';
          case 'FAILED': return 'badge bg-danger';
          case 'EXPIRED': return 'badge bg-secondary';
          default: return 'badge bg-info';
        }
      }
    }
  }
  </script>