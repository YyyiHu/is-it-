<script setup lang="ts">
defineProps<{
  text: string;
  author?: string;
}>();
</script>

<template>
  <div class="epigram-card">
    <div class="epigram-content" :class="{ 'no-author': !author }">
      <p class="epigram-text">
        {{ text }}
      </p>
      <p v-if="author" class="epigram-author">— {{ author }}</p>
    </div>
  </div>
</template>

<style scoped>
.epigram-card {
  position: relative;
  background-color: var(--background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  padding: var(--spacing-xl);
  text-align: center;
  width: min(78vw, 620px);
  height: min(50vh, 400px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.epigram-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.epigram-content.no-author {
  padding-bottom: 1.5rem;
}

.epigram-text {
  font-family: var(--font-display);
  font-size: 1.75rem;
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  margin: 0;
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  text-align: center;
  max-width: 100%;
  padding: 0 var(--spacing-sm);
  display: inline-block;
}

.epigram-author {
  font-family: var(--font-primary);
  font-size: 1.125rem;
  color: var(--text-tertiary);
  font-style: italic;
  font-weight: var(--font-weight-regular);
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  width: calc(100% - 60px); /* Make space for the refresh button */
  word-wrap: break-word;
  overflow-wrap: break-word;
  padding-right: 50px; /* Add padding on the right side */
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.epigram-card::-webkit-scrollbar {
  width: 8px;
}

.epigram-card::-webkit-scrollbar-track {
  background: var(--background-secondary);
  border-radius: var(--radius-full);
}

.epigram-card::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: var(--radius-full);
}

.epigram-card::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

@media (min-width: 768px) {
  .epigram-text {
    font-size: 2rem;
  }

  .epigram-author {
    font-size: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .epigram-text {
    font-size: 2rem;
    padding-top: var(--spacing-lg);
  }

  .epigram-author {
    font-size: 1.375rem;
  }

  .epigram-card {
    padding-top: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);
  }
}

@media (max-width: 480px) {
  .epigram-card {
    width: min(95vw, 350px);
    height: min(60vh, 300px);
    padding: var(--spacing-md) var(--spacing-sm);
  }

  .epigram-text {
    font-size: 1.125rem;
    line-height: 1.4;
    padding: 0 var(--spacing-xs);
    letter-spacing: -0.01em;
    text-align: center;
  }

  .epigram-author {
    font-size: 0.875rem;
    text-align: center;
    margin-top: var(--spacing-md);
    width: calc(100% - 40px); /* Smaller space for mobile */
    padding-right: 35px;
  }

  .epigram-content {
    align-items: center;
  }
}

@media (min-width: 481px) and (max-width: 767px) {
  .epigram-card {
    width: min(85vw, 600px);
    height: min(45vh, 350px);
    padding: var(--spacing-lg);
  }

  .epigram-text {
    font-size: 1.5rem;
    line-height: 1.5;
    padding: 0 var(--spacing-sm);
  }
}
</style>
