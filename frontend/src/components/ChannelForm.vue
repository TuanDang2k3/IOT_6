<template>
  <form @submit.prevent="$emit('save')">
    <div class="mb-3">
      <label for="channelName" class="form-label">Tên kênh</label>
      <input 
        type="text" 
        class="form-control" 
        id="channelName" 
        v-model="localValue.name" 
        @input="updateModelValue"
        required
      >
    </div>
    
    <div class="mb-3">
      <label for="description" class="form-label">Mô tả</label>
      <textarea 
        class="form-control" 
        id="description" 
        v-model="localValue.description"
        @input="updateModelValue"
        rows="3"
      ></textarea>
    </div>
    
    <div class="mb-3">
      <label class="form-label">Các trường dữ liệu</label>
      <div class="alert alert-info mb-2">
        <small>Mỗi trường dữ liệu cần có tên định danh (không dấu, không khoảng trắng), nhãn hiển thị và đơn vị đo tùy chọn.</small>
      </div>
      
      <div class="card mb-2" v-for="(field, index) in localValue.fields" :key="index">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-4">
              <label :for="`fieldName${index}`" class="form-label">Tên định danh</label>
              <input 
                type="text" 
                class="form-control"
                :id="`fieldName${index}`" 
                v-model="field.name" 
                @input="updateModelValue"
                required
                pattern="[a-zA-Z0-9_]+"
              >
              <small class="form-text">Không dấu, không khoảng trắng (VD: temperature)</small>
            </div>
            <div class="col-md-4">
              <label :for="`fieldLabel${index}`" class="form-label">Nhãn hiển thị</label>
              <input 
                type="text" 
                class="form-control" 
                :id="`fieldLabel${index}`" 
                v-model="field.label" 
                @input="updateModelValue"
                required
              >
              <small class="form-text">Tên hiển thị (VD: Nhiệt độ)</small>
            </div>
            <div class="col-md-3">
              <label :for="`fieldUnit${index}`" class="form-label">Đơn vị</label>
              <input 
                type="text" 
                class="form-control" 
                :id="`fieldUnit${index}`" 
                v-model="field.unit"
                @input="updateModelValue"
              >
              <small class="form-text">VD: °C, %, hPa...</small>
            </div>
            <div class="col-md-1 d-flex align-items-center pt-4">
              <button type="button" class="btn btn-danger" @click="removeField(index)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <button type="button" class="btn btn-outline-primary" @click="addField">
        <i class="bi bi-plus-circle"></i> Thêm trường dữ liệu
      </button>
    </div>
    
    <div class="mb-3 form-check">
      <input 
        type="checkbox" 
        class="form-check-input" 
        id="isPublic" 
        v-model="localValue.isPublic"
        @input="updateModelValue"
      >
      <label class="form-check-label" for="isPublic">Công khai</label>
      <div class="form-text">
        Kênh công khai có thể được xem bởi tất cả người dùng
      </div>
    </div>
    
    <div class="text-end">
      <slot name="buttons">
        <button type="button" class="btn btn-secondary me-2" @click="$emit('cancel')">
          Hủy
        </button>
        <button type="submit" class="btn btn-primary">Lưu</button>
      </slot>
    </div>
  </form>
</template>

<script>
export default {
  name: 'ChannelForm',
  props: {
    modelValue: {
      type: Object,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localValue: {
        id: null,
        name: '',
        description: '',
        fields: [],
        apiKey: '',
        isPublic: true
      }
    }
  },
  watch: {
    modelValue: {
      handler(newValue) {
        // Đảm bảo rằng localValue luôn phản ánh modelValue với fields là mảng
        this.localValue = {
          ...newValue,
          fields: Array.isArray(newValue.fields) ? [...newValue.fields] : []
        };
      },
      immediate: true,
      deep: true
    }
  },
  emits: ['update:modelValue', 'save', 'cancel'],
  methods: {
    updateModelValue() {
      this.$emit('update:modelValue', {...this.localValue});
    },
    addField() {
      this.localValue.fields.push({
        name: '',
        label: '',
        unit: ''
      });
      this.updateModelValue();
    },
    removeField(index) {
      this.localValue.fields.splice(index, 1);
      this.updateModelValue();
    }
  }
}
</script>