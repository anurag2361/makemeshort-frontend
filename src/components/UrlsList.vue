<!-- filepath: src/components/UrlsList.vue -->
<template>
  <div class="urls-list-container">
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search URLs..."
        class="search-input"
        @input="debouncedSearch"
      />
    </div>

    <div v-if="isLoading" class="loading">
      <p>Loading...</p>
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="urls.length === 0" class="empty-state">
      <p>No URLs found. Start shortening some links!</p>
      <router-link to="/shorten" class="create-button">Create Short URL</router-link>
    </div>

    <div v-else class="urls-table-container">
      <table class="urls-table">
        <thead>
          <tr>
            <th>Short Code</th>
            <th>Original URL</th>
            <th>Created</th>
            <th>Clicks</th>
            <th>QR Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="url in urls" :key="url.short_code">
            <td>
              <a :href="getRedirectUrl(url.short_code)" target="_blank">
                {{ url.short_code }}
              </a>
            </td>
            <td class="url-cell">
              <div class="url-truncate">{{ url.original_url }}</div>
            </td>
            <td>{{ formatDate(url.created_at) }}</td>
            <td>
              <div class="clicks-info">
                <span class="total-clicks">{{ url.clicks }}</span>
                <span class="unique-clicks">({{ url.unique_clicks }} unique)</span>
              </div>
            </td>
            <td>
              <div class="qr-status">
                <span v-if="url.has_shortened_qr || url.has_original_qr" class="qr-available">
                  Available
                </span>
                <span v-else class="qr-unavailable"> Not Generated </span>
              </div>
            </td>
            <td>
              <div class="actions">
                <router-link
                  :to="{ name: 'analytics', params: { code: url.short_code } }"
                  class="analytics-link"
                >
                  View Analytics
                </router-link>
                <button @click="showQrCodePopup(url.short_code)" class="action-button qr-button">
                  QR
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- QR Code Modal -->
    <div v-if="qrModalVisible" class="modal-backdrop" @click.self="closeQrCodePopup">
      <div class="modal">
        <div class="modal-header">
          <h3>QR Code for {{ selectedShortCode }}</h3>
          <button @click="closeQrCodePopup" class="close-button">&times;</button>
        </div>
        <div class="modal-body qr-modal-body">
          <div v-if="qrImageLoading" class="loading">
            <p>Loading QR Code...</p>
          </div>
          <div v-else-if="qrImageError" class="error-message">
            {{ qrImageError }}
          </div>
          <img v-else-if="qrImageUrl" :src="qrImageUrl" alt="QR Code" class="qr-image-popup" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useUrlStore } from '@/stores/url'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

export default defineComponent({
  name: 'UrlsList',

  setup() {
    const store = useUrlStore()
    const urlStore = useUrlStore()
    const authStore = useAuthStore()
    const searchQuery = ref('')
    let searchTimeout: number | null = null

    const urls = computed(() => store.urls)
    const isLoading = computed(() => store.isLoading)
    const error = computed(() => store.error)

    // Get the current user ID from auth store
    const userId = computed(() => authStore.user?.id)

    // State for QR Code Modal
    const qrModalVisible = ref(false)
    const selectedShortCode = ref<string | null>(null)
    const qrImageUrl = ref<string | null>(null)
    const qrImageLoading = ref(false)
    const qrImageError = ref<string | null>(null)

    // Add watcher to log URL data when it changes
    watch(
      () => urlStore.urls,
      (newUrls) => {
        if (newUrls.length > 0 && newUrls[0]) {
          // Added null check for newUrls[0]
          console.log('URLs from store, first ID:', newUrls[0].id)
        }
      },
    )

    onMounted(() => {
      // Check if we have a user ID and fetch user-specific URLs
      if (userId.value) {
        console.log('Fetching URLs for user:', userId.value)
        urlStore.fetchUserUrls(userId.value)
      } else {
        // Fallback to the general URL fetch if no user ID is available
        console.log('No user ID available, fetching all URLs')
        urlStore.fetchUrls()
      }
    })

    const debouncedSearch = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      searchTimeout = window.setTimeout(() => {
        // Use the user-specific search if a user ID is available
        if (userId.value) {
          urlStore.fetchUserUrls(userId.value, searchQuery.value)
        } else {
          urlStore.fetchUrls(searchQuery.value)
        }
      }, 300)
    }

    const formatDate = (timestamp?: number): string => {
      if (!timestamp) return 'N/A'
      return new Date(timestamp).toLocaleDateString()
    }

    const getRedirectUrl = (shortCode: string): string => {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      return `${baseUrl}/r/${shortCode}`
    }

    // const getQrCodeUrl = (shortCode: string): string => {
    //   return api.getQrCodeUrl(shortCode)
    // }
    const showQrCodePopup = async (shortCode: string) => {
      selectedShortCode.value = shortCode
      qrModalVisible.value = true
      qrImageLoading.value = true
      qrImageError.value = null
      if (qrImageUrl.value) {
        URL.revokeObjectURL(qrImageUrl.value)
        qrImageUrl.value = null
      }

      try {
        // Use regenerateQr, assuming force=false returns existing if available
        const response = await api.regenerateQr(shortCode, 'shortened', false)
        const blob = response.data
        qrImageUrl.value = URL.createObjectURL(blob)
      } catch (err: never) {
        console.error('Error fetching QR code:', err)
        qrImageError.value = err.response?.data?.error || 'Failed to load QR code.'
      } finally {
        qrImageLoading.value = false
      }
    }

    const closeQrCodePopup = () => {
      qrModalVisible.value = false
      if (qrImageUrl.value) {
        URL.revokeObjectURL(qrImageUrl.value)
        qrImageUrl.value = null
      }
      selectedShortCode.value = null
      qrImageError.value = null
    }

    return {
      urls,
      isLoading,
      error,
      searchQuery,
      debouncedSearch,
      formatDate,
      getRedirectUrl,
      // getQrCodeUrl, // No longer needed for the button's direct href
      qrModalVisible,
      selectedShortCode,
      qrImageUrl,
      qrImageLoading,
      qrImageError,
      showQrCodePopup,
      closeQrCodePopup,
    }
  },
})
</script>

<style scoped>
.urls-list-container {
  width: 100%;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
}

.search-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.loading,
.empty-state {
  padding: 30px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
}

.create-button {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
}

.urls-table-container {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.urls-table {
  width: 100%;
  border-collapse: collapse;
}

.urls-table th,
.urls-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.urls-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.urls-table tr:last-child td {
  border-bottom: none;
}

.url-cell {
  max-width: 300px;
}

.url-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.clicks-info {
  display: flex;
  flex-direction: column;
}

.total-clicks {
  font-weight: 600;
  color: #333;
}

.unique-clicks {
  font-size: 0.85rem;
  color: #666;
}

.qr-status {
  font-size: 0.9rem;
}

.qr-available {
  color: #4caf50;
}

.qr-unavailable {
  color: #999;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 6px 12px;
  background-color: #4a90e2;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.85rem;
  text-align: center;
}

.qr-button {
  background-color: #9c27b0;
}

@media (max-width: 768px) {
  .urls-table th:nth-child(3),
  .urls-table td:nth-child(3) {
    display: none; /* Hide the Created column on mobile */
  }

  .url-truncate {
    max-width: 150px;
  }
}
/* Styles for QR Code Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px; /* Adjust as needed */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  color: #888;
  padding: 0;
}

.close-button:hover {
  color: #555;
}

.modal-body {
  padding: 20px;
  text-align: center;
}

.qr-modal-body .loading,
.qr-modal-body .error-message {
  padding: 20px; /* Reset padding if inherited */
  box-shadow: none; /* Reset box-shadow if inherited */
  background-color: transparent; /* Reset background if inherited */
}

.qr-image-popup {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  padding: 10px;
  background-color: white; /* Ensure QR is visible if it has transparency */
  border-radius: 4px;
}
</style>
