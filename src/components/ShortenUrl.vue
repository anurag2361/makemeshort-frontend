<!-- filepath: src/components/ShortenUrl.vue -->
<template>
  <div class="shorten-container">
    <div class="card">
      <h2 class="card-title">Shorten a URL</h2>

      <div class="input-group">
        <input
          v-model="urlToShorten"
          type="url"
          placeholder="Enter a long URL"
          class="url-input"
          @keyup.enter="shortenUrl"
        />

        <div class="expiry-group">
          <label for="expiry">Expires in:</label>
          <select v-model="expiryDays" id="expiry" class="expiry-select">
            <option value="">Never</option>
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </select>
        </div>

        <button @click="shortenUrl" class="shorten-button" :disabled="isLoading || !urlToShorten">
          <span v-if="isLoading">Shortening...</span>
          <span v-else>Shorten</span>
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <div v-if="currentUrl" class="card result-card">
      <h3>Shortened URL</h3>
      <div class="result-url">
        <a :href="currentUrl.short_url" target="_blank">{{ currentUrl.short_url }}</a>
        <button @click="copyToClipboard" class="copy-button">
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <div class="url-details">
        <div class="detail-item">
          <span class="detail-label">Original URL:</span>
          <span class="detail-value">{{ currentUrl.original_url }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Short Code:</span>
          <span class="detail-value">{{ currentUrl.short_code }}</span>
        </div>
        <div v-if="currentUrl.expires_at" class="detail-item">
          <span class="detail-label">Expires:</span>
          <span class="detail-value">{{ formatDate(currentUrl.expires_at) }}</span>
        </div>
      </div>

      <div class="qr-section">
        <button @click="showQrCode = true" class="qr-button" v-if="!showQrCode">
          Show QR Code
        </button>

        <div v-if="showQrCode" class="qr-display">
          <img :src="qrCodeUrl" alt="QR Code" class="qr-image" />
          <div class="qr-actions">
            <a :href="qrCodeUrl" download="qrcode.svg" class="download-button">Download</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { useUrlStore } from '@/stores/url'
import api from '@/services/api'
//import type { ShortenUrlResponse } from '@/types/api'

export default defineComponent({
  name: 'ShortenUrl',

  setup() {
    const store = useUrlStore()

    const urlToShorten = ref('')
    const expiryDays = ref('')
    const copied = ref(false)
    const showQrCode = ref(false)
    const qrCodeUrl = ref('')

    const currentUrl = computed(() => store.currentUrl)
    const isLoading = computed(() => store.isLoading)
    const error = computed(() => store.error)

    // Watch for changes in the shortened URL to update QR code
    watch(
      () => currentUrl.value?.short_code,
      (newCode) => {
        if (newCode) {
          qrCodeUrl.value = api.getQrCodeUrl(newCode)
        }
      },
    )

    // Shorten the URL
    const shortenUrl = async () => {
      if (!urlToShorten.value) {
        return
      }

      try {
        await store.shortenUrl(
          urlToShorten.value,
          expiryDays.value ? parseInt(expiryDays.value) : undefined,
        )
        urlToShorten.value = ''
        showQrCode.value = false
      } catch (err) {
        // Error is already handled in the store
        console.error('Error shortening URL:', err)
      }
    }

    // Copy the shortened URL to clipboard
    const copyToClipboard = () => {
      if (!currentUrl.value) return

      navigator.clipboard
        .writeText(currentUrl.value.short_url)
        .then(() => {
          copied.value = true
          setTimeout(() => (copied.value = false), 2000)
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err)
        })
    }

    // Format date for display
    const formatDate = (timestamp: number): string => {
      return new Date(timestamp).toLocaleString()
    }

    return {
      urlToShorten,
      expiryDays,
      copied,
      showQrCode,
      qrCodeUrl,
      currentUrl,
      isLoading,
      error,
      shortenUrl,
      copyToClipboard,
      formatDate,
    }
  },
})
</script>

<style scoped>
.shorten-container {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
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

.expiry-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expiry-select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
}

.shorten-button {
  padding: 12px 24px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.shorten-button:hover {
  background-color: #3a7fcb;
}

.shorten-button:disabled {
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

.result-url {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
}

.result-url a {
  flex: 1;
  color: #4a90e2;
  font-weight: 500;
  word-break: break-all;
  text-decoration: none;
}

.result-url a:hover {
  text-decoration: underline;
}

.copy-button {
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 12px;
}

.url-details {
  margin: 20px 0;
}

.detail-item {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
}

.detail-label {
  min-width: 120px;
  font-weight: 600;
  color: #555;
}

.detail-value {
  color: #333;
  word-break: break-all;
}

.qr-section {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-button {
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.qr-display {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-image {
  max-width: 200px;
  border: 1px solid #eee;
  padding: 8px;
  background-color: white;
  border-radius: 8px;
}

.qr-actions {
  margin-top: 12px;
}

.download-button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  display: inline-block;
}

@media (max-width: 600px) {
  .input-group {
    flex-direction: column;
  }

  .url-input {
    width: 100%;
  }

  .expiry-group {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
