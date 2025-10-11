<script setup lang="ts">
// Footer component with author credit
</script>

<template>
  <footer class="app-footer">
    <div class="container footer-container">
      <div class="footer-content">
        <p class="copyright">© {{ new Date().getFullYear() }} Yi Hu</p>
        <p class="footer-tagline">Wisdom shared, one epigram at a time.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding: var(--spacing-md) 0;
  background-color: var(--light-100);
  border-top: 1px solid var(--light-200);
  margin-top: auto;
}

.footer-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-content {
  text-align: center;
}

.copyright {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-xs);
}

.footer-tagline {
  font-size: 0.75rem;
  color: var(--grey-400);
  font-style: italic;
}
</style>
