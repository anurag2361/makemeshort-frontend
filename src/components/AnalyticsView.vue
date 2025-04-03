<!-- filepath: src/views/AnalyticsView.vue -->
<template>
  <div class="analytics-view">
    <h1>URL Analytics</h1>
    <p class="subtitle">View detailed performance metrics for your shortened URLs</p>

    <div class="lookup-container">
      <div class="input-group">
        <input
          v-model="shortCode"
          type="text"
          placeholder="Enter short code (e.g., abc123)"
          class="code-input"
          @keyup.enter="fetchAnalytics"
        />
        <button @click="fetchAnalytics" class="fetch-button" :disabled="isLoading || !shortCode">
          {{ isLoading ? 'Loading...' : 'View Analytics' }}
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <div v-if="analytics" class="analytics-container">
      <div class="header-section">
        <h2>Analytics for: {{ analytics.short_code }}</h2>
        <div class="url-box">
          <span class="label">Original URL:</span>
          <a :href="analytics.original_url" target="_blank" class="original-url">
            {{ analytics.original_url }}
          </a>
        </div>
        <div class="short-url-box">
          <span class="label">Short URL:</span>
          <a :href="getShortUrl()" target="_blank" class="short-url">
            {{ getShortUrl() }}
          </a>
          <button @click="copyShortUrl" class="copy-button">
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">{{ analytics.clicks }}</div>
          <div class="metric-label">Total Clicks</div>
        </div>

        <div class="metric-card">
          <div class="metric-value">{{ analytics.unique_clicks }}</div>
          <div class="metric-label">Unique Visitors</div>
        </div>

        <div class="metric-card">
          <div class="metric-value">
            {{ formatDate(analytics.created_at) }}
          </div>
          <div class="metric-label">Created On</div>
        </div>

        <div class="metric-card">
          <div class="metric-value">
            {{ analytics.expires_at ? formatDate(analytics.expires_at) : 'Never' }}
          </div>
          <div class="metric-label">Expires On</div>
        </div>
      </div>

      <div class="qr-section">
        <h3>QR Codes</h3>
        <div class="qr-grid">
          <div class="qr-card" :class="{ active: analytics.has_shortened_qr }">
            <div class="qr-status">
              <span v-if="analytics.has_shortened_qr" class="status-active">✓ Active</span>
              <span v-else class="status-inactive">✕ Not Generated</span>
            </div>
            <h4>Shortened URL QR Code</h4>
            <p>Points to your shortened URL</p>
            <div v-if="analytics.has_shortened_qr" class="qr-image">
              <img :src="getShortenedQrUrl()" alt="Shortened URL QR Code" />
              <div class="qr-actions">
                <a :href="getShortenedQrUrl()" download="shortened-qr.svg" class="download-button">
                  Download
                </a>
                <button @click="regenerateQr('shortened')" class="regenerate-button">
                  Regenerate
                </button>
              </div>
            </div>
            <div v-else class="qr-generate">
              <button @click="generateQr('shortened')" class="generate-button">
                Generate QR Code
              </button>
            </div>
          </div>

          <div class="qr-card" :class="{ active: analytics.has_original_qr }">
            <div class="qr-status">
              <span v-if="analytics.has_original_qr" class="status-active">✓ Active</span>
              <span v-else class="status-inactive">✕ Not Generated</span>
            </div>
            <h4>Original URL QR Code</h4>
            <p>Points directly to original destination</p>
            <div v-if="analytics.has_original_qr" class="qr-image">
              <img :src="getOriginalQrUrl()" alt="Original URL QR Code" />
              <div class="qr-actions">
                <a :href="getOriginalQrUrl()" download="original-qr.svg" class="download-button">
                  Download
                </a>
                <button @click="regenerateQr('original')" class="regenerate-button">
                  Regenerate
                </button>
              </div>
            </div>
            <div v-else class="qr-generate">
              <button @click="generateQr('original')" class="generate-button">
                Generate QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Future enhancement: Add click timeline chart here -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/services/api'
import type { UrlAnalytics } from '@/types/api'

export default defineComponent({
  name: 'AnalyticsView',

  data() {
    return {
      shortCode: '',
      isLoading: false,
      error: null as string | null,
      analytics: null as UrlAnalytics | null,
      copied: false,
    }
  },

  created() {
    // Check if there's a short code in the route params
    if (this.$route.params.code) {
      this.shortCode = this.$route.params.code as string
      this.fetchAnalytics()
    }
  },

  methods: {
    async fetchAnalytics() {
      if (!this.shortCode) {
        this.error = 'Please enter a short code'
        return
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await api.getAnalytics(this.shortCode)
        this.analytics = response.data

        // Update URL with short code for easy sharing/bookmarking
        this.$router.replace({
          name: 'analytics',
          params: { code: this.shortCode },
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to fetch analytics'
        this.analytics = null
        console.error('Error fetching analytics:', err)
      } finally {
        this.isLoading = false
      }
    },

    formatDate(timestamp?: number) {
      if (!timestamp) return 'N/A'

      const date = new Date(timestamp)
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },

    getShortUrl() {
      if (!this.analytics) return ''

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
      return `${baseUrl}/r/${this.analytics.short_code}`
    },

    getShortenedQrUrl() {
      if (!this.analytics) return ''
      return api.getQrCodeUrl(this.analytics.short_code, 'shortened')
    },

    getOriginalQrUrl() {
      if (!this.analytics) return ''
      return api.getQrCodeUrl(this.analytics.short_code, 'original')
    },

    copyShortUrl() {
      if (!this.analytics) return

      navigator.clipboard
        .writeText(this.getShortUrl())
        .then(() => {
          this.copied = true
          setTimeout(() => (this.copied = false), 2000)
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err)
        })
    },

    async generateQr(type: 'shortened' | 'original') {
      if (!this.analytics) return

      try {
        await api.regenerateQr(this.analytics.short_code, type)
        // Refresh analytics to show updated QR code status
        await this.fetchAnalytics()
      } catch (err) {
        this.error = `Failed to generate ${type} QR code`
        console.error('Error generating QR code:', err)
      }
    },

    async regenerateQr(type: 'shortened' | 'original') {
      if (!this.analytics) return

      try {
        await api.regenerateQr(this.analytics.short_code, type, true)
        // Refresh analytics to show updated QR code
        await this.fetchAnalytics()
      } finally {
        // This line is intentionally empty
      }
    },
  },
})
</script>

<style scoped lang="scss">
.analytics-view {
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 10px;
  }

  .subtitle {
    text-align: center;
    color: #666;
    max-width: 600px;
    margin: 0 auto 40px;
    font-size: 1.1rem;
  }

  .lookup-container {
    max-width: 700px;
    margin: 0 auto 50px;
    background-color: #fff;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    .input-group {
      display: flex;
      gap: 10px;

      .code-input {
        flex: 1;
        padding: 12px 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;

        &:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }
      }

      .fetch-button {
        padding: 12px 20px;
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
        white-space: nowrap;

        &:hover {
          background-color: #3a80d2;
        }

        &:disabled {
          background-color: #b3cef2;
          cursor: not-allowed;
        }
      }
    }

    .error-message {
      margin-top: 15px;
      color: #e74c3c;
      padding: 10px;
      background-color: #fde2e2;
      border-radius: 4px;
    }
  }

  .analytics-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .header-section {
      padding: 25px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #eaecf0;

      h2 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #2c3e50;
      }

      .url-box,
      .short-url-box {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 10px;
        padding: 12px 15px;
        background-color: #fff;
        border-radius: 4px;
        border: 1px solid #eaecf0;

        .label {
          font-weight: 600;
          color: #555;
          margin-right: 10px;
          white-space: nowrap;
        }

        a {
          color: #4a90e2;
          text-decoration: none;
          word-break: break-all;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .short-url-box {
        margin-bottom: 0;

        .copy-button {
          margin-left: auto;
          padding: 6px 12px;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background-color: #3a80d2;
          }
        }
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 25px;

      .metric-card {
        background-color: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        border: 1px solid #eaecf0;

        .metric-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #4a90e2;
          line-height: 1.2;
          margin-bottom: 10px;
          word-break: break-word;
          font-size: 2rem;
          min-height: 5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-label {
          color: #64748b;
          font-weight: 500;
        }
      }
    }

    .qr-section {
      padding: 25px;
      border-top: 1px solid #eaecf0;

      h3 {
        margin-top: 0;
        margin-bottom: 20px;
        color: #2c3e50;
      }

      .qr-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;

        .qr-card {
          position: relative;
          background-color: #f8fafc;
          padding: 25px;
          border-radius: 8px;
          border: 1px solid #eaecf0;
          transition:
            transform 0.2s,
            box-shadow 0.2s;

          &.active {
            background-color: white;
            border-color: #d1e0f6;
            box-shadow: 0 4px 12px rgba(74, 144, 226, 0.1);
          }

          .qr-status {
            position: absolute;
            top: 15px;
            right: 15px;

            .status-active {
              color: #27ae60;
              font-weight: 600;
            }

            .status-inactive {
              color: #e74c3c;
              font-weight: 600;
            }
          }

          h4 {
            margin-top: 0;
            margin-bottom: 5px;
            color: #2c3e50;
          }

          p {
            color: #64748b;
            margin-bottom: 20px;
          }

          .qr-image {
            display: flex;
            flex-direction: column;
            align-items: center;

            img {
              max-width: 200px;
              margin-bottom: 15px;
              border: 1px solid #eee;
              padding: 10px;
              background-color: white;
            }

            .qr-actions {
              display: flex;
              gap: 10px;

              .download-button,
              .regenerate-button {
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
                text-decoration: none;
                transition: background-color 0.2s;
              }

              .download-button {
                background-color: #27ae60;
                color: white;

                &:hover {
                  background-color: #219653;
                }
              }

              .regenerate-button {
                background-color: #f1c40f;
                color: #333;
                border: none;

                &:hover {
                  background-color: #f39c12;
                }
              }
            }
          }

          .qr-generate {
            display: flex;
            justify-content: center;

            .generate-button {
              padding: 10px 20px;
              background-color: #4a90e2;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
              transition: background-color 0.2s;

              &:hover {
                background-color: #3a80d2;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .analytics-view {
    .lookup-container .input-group {
      flex-direction: column;
    }

    .header-section {
      .short-url-box .copy-button {
        margin-left: 0;
        margin-top: 10px;
      }
    }
  }
}
</style>
