<!-- filepath: src/views/UrlsView.vue -->
<template>
  <div class="urls-page">
    <h1>My URLs</h1>
    <p class="subtitle">Manage and track your shortened URLs</p>

    <UrlsList />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UrlsList from '@/components/UrlsList.vue'

export default defineComponent({
  name: 'UrlsView',
  components: {
    UrlsList,
  },
})
</script>

<style scoped>
.urls-page {
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
