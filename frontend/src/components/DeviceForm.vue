<template>
    <form @submit.prevent="$emit('save')">
      <div class="mb-3">
        <label for="deviceName" class="form-label">Tên thiết bị</label>
        <input 
          type="text" 
          class="form-control" 
          id="deviceName" 
          v-model="modelValue.name" 
          required
        >
      </div>
      
      <div class="mb-3">
        <label for="macAddress" class="form-label">MAC Address</label>
        <input 
          type="text" 
          class="form-control" 
          id="macAddress" 
          v-model="modelValue.macAddress" 
          :disabled="isEditing" 
          required
          pattern="([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})"
          title="Định dạng MAC address: XX:XX:XX:XX:XX:XX"
        >
        <div class="form-text">
          Ví dụ: 30:AE:A4:1F:B3:C5
        </div>
      </div>
      
      <div class="mb-3">
        <label for="description" class="form-label">Mô tả</label>
        <textarea 
          class="form-control" 
          id="description" 
          v-model="modelValue.description"
          rows="3"
        ></textarea>
      </div>
      
      <div class="mb-3 form-check" v-if="isEditing">
        <input 
          type="checkbox" 
          class="form-check-input" 
          id="isActive" 
          v-model="modelValue.isActive"
        >
        <label class="form-check-label" for="isActive">Kích hoạt</label>
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
    name: 'DeviceForm',
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
    emits: ['update:modelValue', 'save', 'cancel']
  }
  </script>