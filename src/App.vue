<!-- filepath: src/App.vue -->
<template>
  <header>
    <nav class="navbar">
      <div class="logo">
        <router-link to="/"> MakeMeShort </router-link>
      </div>

      <div class="nav-links">
        <router-link to="/shorten">Shorten</router-link>
        <router-link to="/urls">My URLs</router-link>
      </div>
    </nav>
  </header>

  <router-view />

  <footer>
    <div class="footer-content">
      <p>© {{ new Date().getFullYear() }} MakeMeShort. All rights reserved.</p>
    </div>
  </footer>
</template>

<style>
/* Global styles */
:root {
  --primary: #4a90e2;
  --primary-dark: #3a7fcb;
  --secondary: #9066ee;
  --text-dark: #333;
  --text-light: #666;
  --bg-light: #f8f9fa;
  --bg-white: #ffffff;
  --success: #4caf50;
  --danger: #d32f2f;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Arial,
    sans-serif;
  line-height: 1.6;
  color: var(--text-dark);
  background-color: var(--bg-light);
  min-height: 100vh;
}

/* Layout styles */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: var(--bg-white);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.logo a {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: var(--text-light);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.nav-links a:hover {
  background-color: rgba(74, 144, 226, 0.1);
  color: var(--primary);
}

.nav-links a.router-link-active {
  color: var(--primary);
  background-color: rgba(74, 144, 226, 0.1);
}

main {
  flex: 1;
}

footer {
  background-color: var(--bg-white);
  padding: 24px;
  margin-top: auto;
  border-top: 1px solid #eee;
}

.footer-content {
  text-align: center;
  color: var(--text-light);
  font-size: 0.9rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 16px;
  }

  .nav-links {
    width: 100%;
    justify-content: center;
  }
}
</style>
