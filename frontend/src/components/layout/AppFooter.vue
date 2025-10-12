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
  width: 100%;
  max-width: var(--container-width, 1200px);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.copyright {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  line-height: 1.4;
}

.footer-tagline {
  font-size: 0.75rem;
  color: var(--grey-400);
  font-style: italic;
  line-height: 1.4;
}
</style>
