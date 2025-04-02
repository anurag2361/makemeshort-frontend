<!-- filepath: src/views/ShortenView.vue -->
<template>
  <div class="shorten-page">
    <h1>URL Shortener</h1>
    <p class="subtitle">Create compact, memorable links that redirect to your content</p>

    <ShortenUrl />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ShortenUrl from '@/components/ShortenUrl.vue'

export default defineComponent({
  name: 'ShortenView',
  components: {
    ShortenUrl,
  },
})
</script>

<style scoped>
.shorten-page {
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
</style>
