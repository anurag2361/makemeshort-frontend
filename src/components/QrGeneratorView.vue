<template>
  <div class="qr-generator-page">
    <h1>QR Code Generator</h1>
    <p class="subtitle">Create QR codes for any URL</p>

    <div class="generator-container">
      <div class="card">
        <h2 class="card-title">Generate a QR Code</h2>

        <div class="input-group">
          <input
            v-model="url"
            type="url"
            placeholder="Enter a URL"
            class="url-input"
            @keyup.enter="generateQr"
          />

          <div class="size-group">
            <label for="size">Size:</label>
            <select v-model="size" id="size" class="size-select">
              <option value="200">Small (200px)</option>
              <option value="300">Medium (300px)</option>
              <option value="400">Large (400px)</option>
              <option value="600">Extra Large (600px)</option>
            </select>
          </div>

          <button @click="generateQr" class="generate-button" :disabled="isLoading || !url">
            <span v-if="isLoading">Generating...</span>
            <span v-else>Generate QR Code</span>
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <div v-if="qrCodeUrl" class="card result-card">
        <h3>Your QR Code</h3>
        <div class="qr-preview">
          <img :src="qrCodeUrl" alt="QR Code" class="qr-image" />
        </div>

        <div class="actions">
          <a :href="qrCodeUrl" download="qrcode.svg" class="download-button">Download QR Code</a>
        </div>

        <div class="url-details">
          <div class="detail-item">
            <span class="detail-label">URL:</span>
            <span class="detail-value">{{ url }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Size:</span>
            <span class="detail-value">{{ size }}px</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import api from '@/services/api'

export default defineComponent({
  name: 'QrGeneratorView',

  setup() {
    const url = ref('')
    const size = ref('300')
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const qrCodeUrl = ref('')

    const generateQr = async () => {
      if (!url.value) {
        error.value = 'Please enter a URL'
        return
      }

      if (!url.value.startsWith('http://') && !url.value.startsWith('https://')) {
        url.value = 'https://' + url.value
      }

      isLoading.value = true
      error.value = null

      try {
        const response = await api.generateDirectQr({
          url: url.value,
          size: parseInt(size.value),
        })

        // Create a blob URL for the QR code image
        const blob = new Blob([response.data], { type: 'image/svg+xml' })
        if (qrCodeUrl.value) {
          URL.revokeObjectURL(qrCodeUrl.value)
        }
        qrCodeUrl.value = URL.createObjectURL(blob)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        error.value = err.response?.data?.error || 'Failed to generate QR code'
        console.error('Error generating QR code:', err)
      } finally {
        isLoading.value = false
      }
    }

    return {
      url,
      size,
      isLoading,
      error,
      qrCodeUrl,
      generateQr,
    }
  },
})
</script>

<style scoped>
.qr-generator-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  text-align: center;
  margin-bottom: 10px;
  color: #333;
  font-size: 2.5rem;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-size: 1.2rem;
}

.generator-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.card-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5rem;
}

.input-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.url-input {
  flex: 1;
  min-width: 250px;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.url-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.size-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
}

.generate-button {
  padding: 12px 24px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.generate-button:hover {
  background-color: #3a7fcb;
}

.generate-button:disabled {
  background-color: #a5c7f0;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
}

.result-card {
  border-top: 5px solid #4caf50;
}

.qr-preview {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qr-image {
  border: 1px solid #eee;
  padding: 15px;
  max-width: 100%;
  background-color: white;
  border-radius: 8px;
}

.actions {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.download-button {
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.download-button:hover {
  background-color: #43a047;
}

.url-details {
  margin: 20px 0;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
}

.detail-item {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
}

.detail-label {
  min-width: 60px;
  font-weight: 600;
  color: #555;
}

.detail-value {
  color: #333;
  word-break: break-all;
}

@media (max-width: 600px) {
  .input-group {
    flex-direction: column;
  }

  .url-input,
  .size-group,
  .generate-button {
    width: 100%;
  }

  .size-group {
    justify-content: space-between;
  }
}
</style>
