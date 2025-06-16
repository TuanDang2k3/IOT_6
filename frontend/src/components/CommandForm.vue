<template>
  <form @submit.prevent="$emit('save')">
    <div class="mb-3">
      <label for="deviceId" class="form-label">Thiết bị</label>
      <select id="deviceId" v-model="modelValue.deviceId" class="form-select" required>
        <option value="">Chọn thiết bị</option>
        <option v-for="device in devices" :key="device.id" :value="device.id">
          {{ device.name }}
        </option>
      </select>
    </div>
    
    <div class="mb-3">
      <label for="commandType" class="form-label">Loại lệnh</label>
      <select id="commandType" v-model="modelValue.command" class="form-select" required>
        <option value="">Chọn loại lệnh</option>
        <option value="LED_ON">Bật LED</option>
        <option value="LED_OFF">Tắt LED</option>
        <option value="FAN_ON">Bật quạt</option>
        <option value="FAN_OFF">Tắt quạt</option>
        <option value="BUZZER_ON">Bật còi</option>
        <option value="BUZZER_OFF">Tắt còi</option>
        <option value="READ_SENSOR">Đọc cảm biến</option>
        <option value="RESTART">Khởi động lại</option>
        <option value="CONFIGURE">Cấu hình</option>
      </select>
    </div>
    
    <!-- LED_ON params -->
    <div v-if="modelValue.command === 'LED_ON'" class="mb-3">
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
    <div v-if="modelValue.command === 'LED_OFF'" class="mb-3">
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
    <div v-if="modelValue.command === 'FAN_ON'" class="mb-3">
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
    <div v-if="modelValue.command === 'FAN_OFF'" class="mb-3">
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
    
    <!-- DISPLAY_TEXT params -->
    <div v-if="modelValue.command === 'DISPLAY_TEXT'" class="mb-3">
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
    
    <!-- Add BUZZER_ON params -->
    <div v-if="modelValue.command === 'BUZZER_ON'" class="mb-3">
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
    <div v-if="modelValue.command === 'BUZZER_OFF'" class="mb-3">
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

    <!-- READ_SENSOR params -->
    <div v-if="modelValue.command === 'READ_SENSOR'" class="mb-3">
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
    <div v-if="modelValue.command === 'RESTART'" class="mb-3">
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
    <div v-if="modelValue.command === 'CONFIGURE'" class="mb-3">
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
      <slot name="buttons">
        <button type="button" class="btn btn-secondary me-2" @click="$emit('cancel')">
          Hủy
        </button>
        <button type="submit" class="btn btn-primary">
          Tạo lệnh
        </button>
      </slot>
    </div>
  </form>
</template>

<script>
export default {
  name: 'CommandForm',
  props: {
    modelValue: {
      type: Object,
      required: true
    },
    devices: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
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
      }
    }
  },
  watch: {
    'modelValue.command'() {
      this.updateParameters();
    }
  },
  methods: {
    updateParameters() {
      switch (this.modelValue.command) {
        case 'LED_ON':
          this.$emit('update:modelValue', {
            ...this.modelValue,
            parameters: { ...this.ledParams }
          });
          break;
        case 'LED_OFF':
          this.$emit('update:modelValue', {
            ...this.modelValue,
            parameters: { ...this.ledOffParams }
          });
          break;
        case 'FAN_ON':
          this.$emit('update:modelValue', {
            ...this.modelValue,
            parameters: { ...this.fanParams }
          });
          break;
        case 'FAN_OFF':
          this.$emit('update:modelValue', {
            ...this.modelValue,
            parameters: { pin: this.fanParams.pin }
          });
          break;
        case 'BUZZER_ON':
          this.$emit('update:modelValue', {
            ...this.modelValue,
            parameters: { ...this.buzzerParams }
          });
          break;
        case 'BUZZER_OFF':
          this.$emit('update:modelValue', {
            ...this.modelValue,
            parameters: { pin: this.buzzerParams.pin }
          });
          break;
        case 'DISPLAY_TEXT':
          this.$emit('update:modelValue', {
            ...this.modelValue,
            parameters: { ...this.displayParams }
          });
          break;
        case 'READ_SENSOR':
          this.$emit('update:modelValue', {
            ...this.modelValue,
            parameters: { ...this.sensorParams }
          });
          break;
        case 'RESTART':
          this.$emit('update:modelValue', {
            ...this.modelValue,
            parameters: { ...this.restartParams }
          });
          break;
        case 'CONFIGURE':
          this.$emit('update:modelValue', {
            ...this.modelValue,
            parameters: { ...this.configParams }
          });
          break;
      }
    }
  },
  emits: ['update:modelValue', 'save', 'cancel']
}
</script>