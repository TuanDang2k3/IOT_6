<template>
  <div class="channel-list">
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary"></div>
      <p>Đang tải danh sách kênh dữ liệu...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else-if="channels.length === 0" class="alert alert-info">
      Chưa có kênh dữ liệu nào. Hãy thêm kênh mới!
    </div>
    
    <div v-else class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên kênh</th>
            <th>Mô tả</th>
            <th>API Key</th>
            <th>Các trường dữ liệu</th>
            <th>Công khai</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="channel in channels" :key="channel.id">
            <td>{{ channel.id }}</td>
            <td>{{ channel.name }}</td>
            <td>{{ channel.description || 'N/A' }}</td>
            <td>
              <code>{{ maskApiKey(channel.apiKey) }}</code>
              <button class="btn btn-sm btn-outline-secondary ms-2" @click="$emit('show-api-key', channel)">
                <i class="bi bi-eye"></i>
              </button>
            </td>
            <td>
              <span v-if="channel.fields && channel.fields.length > 0">
                <span v-for="(field, index) in channel.fields" :key="field.name" class="badge bg-info me-1">
                  {{ field.label }} ({{ field.unit }})
                  <span v-if="index < channel.fields.length - 1">, </span>
                </span>
              </span>
              <span v-else class="text-muted">Chưa có trường dữ liệu</span>
            </td>
            <td>
              <span :class="channel.isPublic ? 'badge bg-success' : 'badge bg-warning'">
                {{ channel.isPublic ? 'Có' : 'Không' }}
              </span>
            </td>
            <td>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-info" @click="$emit('view-data', channel.id)">
                  <i class="bi bi-graph-up"></i>
                </button>
                <button class="btn btn-primary" @click="$emit('edit', channel)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-warning" @click="$emit('regenerate-api-key', channel.id)">
                  <i class="bi bi-key"></i>
                </button>
                <button class="btn btn-danger" @click="$emit('delete', channel)">
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
  name: 'ChannelList',
  props: {
    channels: {
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
  emits: ['view-data', 'edit', 'regenerate-api-key', 'show-api-key', 'delete'],
  methods: {
    maskApiKey(apiKey) {
      if (!apiKey) return '';
      return apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
    }
  }
}
</script>