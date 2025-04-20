<template>
  <div class="channels">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Quản lý kênh dữ liệu</h1>
      <button class="btn btn-primary" @click="showAddModal">Thêm kênh mới</button>
    </div>
    
    <!-- Sử dụng ChannelList component đã được cập nhật -->
    <ChannelList 
      :channels="channels" 
      :loading="loading" 
      :error="error"
      @view-data="viewChannelData"
      @edit="editChannel"
      @regenerate-api-key="regenerateApiKey"
      @show-api-key="showApiKey"
      @delete="confirmDelete"
    />
    
    <!-- Modal thêm/sửa kênh -->
    <div class="modal fade" id="channelModal" ref="channelModalEl" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Sửa kênh' : 'Thêm kênh mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <ChannelForm 
              :modelValue="currentChannel"
              @update:modelValue="currentChannel = $event"
              :isEditing="isEditing"
              @save="saveChannel"
              @cancel="closeChannelModal"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal API Key -->
    <div class="modal fade" id="apiKeyModal" ref="apiKeyModalEl" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">API Key</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>API Key cho kênh <strong>{{ currentChannel.name }}</strong>:</p>
            <div class="alert alert-info">
              <code>{{ currentChannel.apiKey }}</code>
            </div>
            <p class="text-muted">
              Hãy lưu API Key này ở nơi an toàn. API Key được sử dụng để gửi dữ liệu đến kênh này.
            </p>
            <div class="alert alert-warning">
              <strong>Ví dụ POST request:</strong>
              <pre><code>
POST /api/sensor/api/{{ currentChannel.apiKey }}
Content-Type: application/json

{
  {{ currentChannel.fields && currentChannel.fields.length > 0 
    ? currentChannel.fields.map(f => `"${f.name}": value`).join(',\n  ') 
    : '"example_field": value' }}
}
              </code></pre>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" @click="copyApiKey">
              Sao chép API Key
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal xác nhận xóa -->
    <div class="modal fade" id="deleteModal" ref="deleteModalEl" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa kênh "{{ currentChannel.name }}" không?</p>
            <div class="alert alert-danger">
              <strong>Cảnh báo:</strong> Tất cả dữ liệu cảm biến của kênh này sẽ bị xóa vĩnh viễn!
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="deleteChannel">Xóa</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import { Modal } from 'bootstrap'
import ChannelList from '../components/ChannelList.vue'
import ChannelForm from '../components/ChannelForm.vue'

export default {
  name: 'Channels',
  components: {
    ChannelList,
    ChannelForm
  },
  data() {
    return {
      channels: [],
      loading: true,
      error: null,
      isEditing: false,
      currentChannel: {
        id: null,
        name: '',
        description: '',
        fields: [],
        apiKey: '',
        isPublic: true
      },
      channelModal: null,
      apiKeyModal: null,
      deleteModal: null
    }
  },
  mounted() {
    this.fetchChannels();
    // Khởi tạo modals sau khi component được mount
    this.$nextTick(() => {
      this.initModals();
    });
  },
  methods: {
    // Khởi tạo tất cả modal
    initModals() {
      if (document.getElementById('channelModal')) {
        this.channelModal = new Modal(document.getElementById('channelModal'));
      }
      if (document.getElementById('apiKeyModal')) {
        this.apiKeyModal = new Modal(document.getElementById('apiKeyModal'));
      }
      if (document.getElementById('deleteModal')) {
        this.deleteModal = new Modal(document.getElementById('deleteModal'));
      }
    },
  

  },
  methods: {

    async fetchChannels() {
      this.loading = true
      try {
        const response = await api.getChannels()
        // Transform backend data format to frontend format
        this.channels = response.data.data.map(channel => {
          return {
            ...channel,
            // Convert field_name string to fields array if it exists
            fields: channel.field_name ? 
              channel.field_name.split(',').map(name => ({ 
                name, 
                label: name, // Default label to name
                unit: '' // Default empty unit
              })) : [],
            // Convert snake_case to camelCase
            isPublic: channel.isPublic,
            apiKey: channel.apiKey
          }
        })
        this.error = null
      } catch (err) {
        console.error('Error fetching channels:', err)
        this.error = 'Không thể tải danh sách kênh'
      } finally {
        this.loading = false
      }
    },
    
    viewChannelData(channelId) {
      this.$router.push(`/sensor-data/${channelId}`);
    },
    
    showAddModal() {
      // Reset currentChannel trước khi hiển thị modal
      this.isEditing = false
      this.currentChannel = {
        id: null,
        name: '',
        description: '',
        fields: [], // Đảm bảo fields là một mảng trống
        isPublic: true
      }
      
      if (!this.channelModal) {
        this.initModals();
      }
      
      if (this.channelModal) {
        this.channelModal.show();
      } else {
        console.error('Channel modal not initialized');
      }
    },
    
    editChannel(channel) {
      this.isEditing = true
      // Đảm bảo tạo một bản sao sâu để tránh tham chiếu trực tiếp
      this.currentChannel = JSON.parse(JSON.stringify(channel))
      
      // Đảm bảo fields là một mảng
      if (!this.currentChannel.fields) {
        this.currentChannel.fields = [];
      }
      
      if (!this.channelModal) {
        this.initModals();
      }
      
      if (this.channelModal) {
        this.channelModal.show()
      } else {
        console.error('Channel modal not initialized');
      }
    },
    
    closeChannelModal() {
      if (this.channelModal) {
        this.channelModal.hide()
      }
    },
    
 // Add this to your saveChannel method to see more details
 async saveChannel() {
  try {
    // Validate fields
    if (this.currentChannel.fields) {
      const invalidFields = this.currentChannel.fields.filter(
        field => !field.name || !field.label
      );
      
      if (invalidFields.length > 0) {
        alert('Mỗi trường dữ liệu phải có tên định danh và nhãn hiển thị.');
        return;
      }
    }
    
    // Check for empty name
    if (!this.currentChannel.name || this.currentChannel.name.trim() === '') {
      alert('Tên kênh không được để trống.');
      return;
    }
    
    // Transform data structure to match backend requirements
    const channelData = {
      name: this.currentChannel.name,
      description: this.currentChannel.description || '',
      // Convert fields array to comma-separated string
      field_name: this.currentChannel.fields && this.currentChannel.fields.length > 0 ? 
        this.currentChannel.fields.map(f => f.name).join(',') : '',
      // Use snake_case for is_public
      isPublic: this.currentChannel.isPublic !== undefined ? this.currentChannel.isPublic : true
    };
    
    console.log('Channel data being sent:', JSON.stringify(channelData));
    
    let response;
    if (this.isEditing) {
      response = await api.updateChannel(this.currentChannel.id, channelData);
    } else {
      response = await api.createChannel(channelData);
    }
    
    console.log('API response:', response);
    this.closeChannelModal();
    await this.fetchChannels();
  } catch (err) {
    console.error('Error saving channel:', err);
    // Check for specific error details from backend
    const errorMessage = err.response && err.response.data ? 
      (err.response.data.message || err.response.data.error || err.response.statusText) : 
      err.message;
    alert(`Không thể lưu kênh: ${errorMessage}`);
  }
},
    
    showApiKey(channel) {
      this.currentChannel = { ...channel }
      
      if (!this.apiKeyModal) {
        this.initModals();
      }
      
      if (this.apiKeyModal) {
        this.apiKeyModal.show()
      }
    },
    
    copyApiKey() {
      navigator.clipboard.writeText(this.currentChannel.apiKey)
        .then(() => {
          alert('API Key đã được sao chép vào clipboard!')
        })
        .catch(err => {
          console.error('Could not copy text: ', err)
        })
    },
    
    async regenerateApiKey(id) {
      if (!confirm('Bạn có chắc chắn muốn làm mới API Key không?\nLưu ý: API Key cũ sẽ không còn hoạt động!')) {
        return
      }
      
      try {
        const response = await api.regenerateApiKey(id)
        alert(`API Key mới: ${response.data.data.apiKey}\nHãy lưu lại API Key này ngay!`)
        await this.fetchChannels()
      } catch (err) {
        console.error('Error regenerating API key:', err)
        alert('Không thể làm mới API Key. Vui lòng thử lại sau.')
      }
    },
    
    confirmDelete(channel) {
      this.currentChannel = { ...channel }
      
      if (!this.deleteModal) {
        this.initModals();
      }
      
      if (this.deleteModal) {
        this.deleteModal.show()
      }
    },
    
    async deleteChannel() {
      try {
        await api.deleteChannel(this.currentChannel.id)
        
        if (this.deleteModal) {
          this.deleteModal.hide()
        }
        
        await this.fetchChannels()
      } catch (err) {
        console.error('Error deleting channel:', err)
        alert('Không thể xóa kênh. Vui lòng thử lại sau.')
      }
    }
  }
}
</script>