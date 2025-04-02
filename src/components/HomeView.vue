<!-- filepath: src/views/HomeView.vue -->
<template>
  <main>
    <section class="hero">
      <div class="hero-content">
        <h1>MakeMeShort</h1>
        <p class="tagline">Powerful URL shortening with QR codes and analytics</p>
        <div class="cta-buttons">
          <router-link to="/shorten" class="cta-button primary">Shorten a URL</router-link>
          <router-link to="/urls" class="cta-button secondary">My URLs</router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">🔗</div>
        <h3>URL Shortening</h3>
        <p>Create compact, memorable links that are easy to share</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Click Analytics</h3>
        <p>Track engagement with detailed metrics for each shortened URL</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">📱</div>
        <h3>QR Codes</h3>
        <p>Generate QR codes for your URLs for easy mobile access</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">⏱️</div>
        <h3>Expiration Control</h3>
        <p>Set optional expiration dates for your URLs</p>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomeView',
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #4a90e2 0%, #9066ee 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 20px;
  font-weight: 800;
}

.tagline {
  font-size: 1.5rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.cta-button {
  padding: 15px 30px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: translateY(-3px);
}

.primary {
  background-color: white;
  color: #4a90e2;
}

.secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid white;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.5rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }

  .tagline {
    font-size: 1.2rem;
  }
}
</style>
