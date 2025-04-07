<template>
  <div class="qr-codes-page">
    <h1>QR Codes Library</h1>
    <p class="subtitle">View and manage all generated QR codes</p>

    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search QR codes by URL..."
        class="search-input"
        @input="debouncedSearch"
      />
    </div>

    <div v-if="isLoading && qrCodes.length === 0" class="loading">
      <p>Loading QR codes...</p>
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="qrCodes.length === 0" class="empty-state">
      <p>No QR codes found. Generate some QR codes first!</p>
      <router-link to="/qr-generator" class="create-button">Create QR Code</router-link>
    </div>

    <div v-else class="qr-codes-grid">
      <div v-for="qrCode in qrCodes" :key="qrCode.id" class="qr-code-card">
        <div class="qr-code-image">
          <img
            :src="getQrImageUrl(qrCode.short_code, qrCode.target_type, qrCode.svg_content)"
            :alt="`QR code for ${qrCode.original_url}`"
          />
        </div>
        <div class="qr-code-info">
          <h3 class="qr-code-title">{{ truncateText(qrCode.original_url, 30) }}</h3>
          <div class="qr-code-details">
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">
                {{ qrCode.is_direct ? 'Direct QR' : 'URL Shortener QR' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Target:</span>
              <span class="detail-value">
                {{ qrCode.target_type === 'original' ? 'Original URL' : 'Shortened URL' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ formatDate(qrCode.generated_at) }}</span>
            </div>
          </div>
          <div class="qr-code-actions">
            <a
              :href="getQrImageUrl(qrCode.short_code, qrCode.target_type, qrCode.svg_content)"
              :download="`qrcode-${qrCode.short_code}.svg`"
              class="download-button"
            >
              Download
            </a>
            <button @click="confirmDelete(qrCode)" class="delete-button">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button @click="cancelDelete" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete this QR code for
            <strong>{{ qrToDelete?.original_url }}</strong
            >?
          </p>
          <p>This action cannot be undone.</p>
          <div class="modal-actions">
            <button @click="cancelDelete" class="cancel-button">Cancel</button>
            <!-- <button @click="deleteQrCode" class="confirm-delete-button" :disabled="isDeletingQr">
              {{ isDeletingQr ? 'Deleting...' : 'Delete QR Code' }}
            </button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useQrCodeStore } from '@/stores/qr'
import { useAuthStore } from '@/stores/auth'
import type { QrCode, QrTargetType } from '@/types/api'

export default defineComponent({
  name: 'QrCodesView',

  setup() {
    const qrCodeStore = useQrCodeStore()
    const authStore = useAuthStore()

    const qrCodes = computed(() => qrCodeStore.qrCodes)
    const isLoading = computed(() => qrCodeStore.isLoading)
    const error = computed(() => qrCodeStore.error)
    const canManageQr = computed(() => true)

    // Get the current user ID from auth store
    const userId = computed(() => authStore.user?.id)

    const showDeleteModal = ref(false)
    const isDeletingQr = ref(false)
    const qrToDelete = ref<QrCode | null>(null)

    const searchQuery = ref('')
    let searchTimeout: number | null = null

    // Add watcher to log URL data when it changes
    watch(
      () => qrCodeStore.qrCodes,
      (newUrls) => {
        if (newUrls.length > 0) {
          console.log('URLs from store:', newUrls[0].id)
        }
      },
    )

    onMounted(() => {
      // Check if we have a user ID and fetch user-specific URLs
      if (userId.value) {
        console.log('Fetching URLs for user:', userId.value)
        qrCodeStore.fetchUserQrCodes(userId.value)
      } else {
        // Fallback to the general URL fetch if no user ID is available
        console.log('No user ID available, fetching all URLs')
        urlStore.fetchQrCodes()
      }
    })

    // Add debounced search function
    const debouncedSearch = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      searchTimeout = window.setTimeout(() => {
        // Use the user-specific search if a user ID is available
        if (userId.value) {
          qrCodeStore.fetchUserQrCodes(userId.value, searchQuery.value)
        } else {
          urlStore.fetchQrCodes()
        }
      }, 300)
    }

    const formatDate = (timestamp: number): string => {
      return new Date(timestamp).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    const truncateText = (text: string, maxLength: number): string => {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    const getQrImageUrl = (shortCode: string, type: QrTargetType, svgContent: string): string => {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
    }

    const confirmDelete = (qrCode: QrCode) => {
      qrToDelete.value = qrCode
      showDeleteModal.value = true
    }

    const cancelDelete = () => {
      showDeleteModal.value = false
      qrToDelete.value = null
    }

    // const deleteQrCode = async () => {
    //   if (!qrToDelete.value) return

    //   isDeletingQr.value = true
    //   try {
    //     await qrCodeStore.deleteQrCode(qrToDelete.value.id)
    //     showDeleteModal.value = false
    //   } catch (err) {
    //     console.error('Error deleting QR code:', err)
    //   } finally {
    //     isDeletingQr.value = false
    //     qrToDelete.value = null
    //   }
    // }

    return {
      qrCodes,
      isLoading,
      error,
      canManageQr,
      showDeleteModal,
      isDeletingQr,
      qrToDelete,
      formatDate,
      truncateText,
      getQrImageUrl,
      confirmDelete,
      cancelDelete,
      //deleteQrCode,
      debouncedSearch,
      searchQuery,
    }
  },
})
</script>

<style scoped>
.qr-codes-page {
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

.qr-codes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.qr-code-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.qr-code-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.qr-code-image {
  padding: 20px;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #eee;
}

.qr-code-image img {
  max-width: 200px;
  max-height: 200px;
}

.qr-code-info {
  padding: 20px;
}

.qr-code-title {
  margin-top: 0;
  margin-bottom: 12px;
  color: #333;
  font-size: 1.2rem;
  word-break: break-all;
}

.qr-code-details {
  margin-bottom: 20px;
}

.detail-item {
  margin-bottom: 8px;
  display: flex;
}

.detail-label {
  min-width: 80px;
  font-weight: 600;
  color: #555;
}

.detail-value {
  color: #666;
  word-break: break-all;
}

.qr-code-actions {
  display: flex;
  gap: 12px;
}

.download-button,
.delete-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
}

.download-button {
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  flex: 1;
}

.delete-button {
  background-color: #f44336;
  color: white;
  border: none;
  flex: 1;
}

.download-button:hover {
  background-color: #43a047;
}

.delete-button:hover {
  background-color: #e53935;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
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
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button,
.confirm-delete-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.cancel-button {
  background-color: #f1f1f1;
  color: #666;
}

.confirm-delete-button {
  background-color: #f44336;
  color: white;
}

.cancel-button:hover {
  background-color: #e5e5e5;
}

.confirm-delete-button:hover {
  background-color: #e53935;
}

.confirm-delete-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .qr-codes-grid {
    grid-template-columns: 1fr;
  }
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
</style>
