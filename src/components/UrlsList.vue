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
                <a
                  :href="getQrCodeUrl(url.short_code)"
                  target="_blank"
                  class="action-button qr-button"
                >
                  QR
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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

    // Add watcher to log URL data when it changes
    watch(
      () => urlStore.urls,
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

    const getQrCodeUrl = (shortCode: string): string => {
      return api.getQrCodeUrl(shortCode)
    }

    return {
      urls,
      isLoading,
      error,
      searchQuery,
      debouncedSearch,
      formatDate,
      getRedirectUrl,
      getQrCodeUrl,
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
</style>
