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
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
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

/* Responsive styles moved to centralized responsive/epigram-card.css */
</style>
