<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useEpigramStore } from "@/stores/epigram";
import { autoReloadService } from "@/services/auto-reload";
import EpigramCard from "@/components/epigram/EpigramCard.vue";
import RefreshButton from "@/components/ui/buttons/RefreshButton.vue";
import AutoReloadTimer from "@/components/ui/AutoReloadTimer.vue";

const epigramStore = useEpigramStore();
const showTitle = ref(false);

const loadNewEpigram = async () => {
  console.log("Manual refresh clicked");
  showTitle.value = false; // Hide title during loading
  await epigramStore.loadNextEpigram("manual-refresh");
  // Manual refresh = start full timer
  autoReloadService.startFullTimer();
};

// Watch for when epigram is loaded to show title immediately
watch(
  () => epigramStore.currentEpigram,
  (newEpigram) => {
    if (newEpigram) {
      // Show title immediately when epigram loads
      showTitle.value = true;
      console.log("Epigram changed:", newEpigram.id);
    }
  },
  { immediate: true }
);

// Load initial epigram when component mounts (only if no current epigram exists)
onMounted(() => {
  // Don't reload if we already have an epigram (prevents reload when returning from panels)
  if (!epigramStore.currentEpigram) {
    console.log("HomeView mounted - loading initial epigram");
    epigramStore.loadInitialEpigram().then(() => {
      autoReloadService.startFullTimer();
    });
  } else {
    console.log("HomeView mounted - epigram exists, starting timer");
    autoReloadService.startFullTimer();
  }
});
</script>

<template>
  <div class="home-view">
    <!-- Loading state -->
    <div
      v-if="epigramStore.isLoading && !epigramStore.currentEpigram"
      class="loading-state"
    >
      <div class="loading-spinner"></div>
      <p>Loading epigram...</p>
    </div>

    <!-- Error state -->
    <div
      v-else-if="epigramStore.error && !epigramStore.currentEpigram"
      class="error-state"
    >
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ epigramStore.error }}</p>
      <button @click="epigramStore.loadInitialEpigram()" class="retry-button">
        Try Again
      </button>
    </div>

    <!-- Epigram display with flexible layout -->
    <div v-else-if="epigramStore.currentEpigram" class="epigram-container">
      <!-- Flexible container for epigram -->
      <div class="epigram-wrapper">
        <EpigramCard
          :text="epigramStore.currentEpigram.text"
          :author="epigramStore.currentEpigram.author"
        />
        <!-- Refresh button positioned on the epigram card -->
        <RefreshButton
          :loading="epigramStore.isLoading"
          @click="loadNewEpigram"
        />

        <!-- Auto-reload timer -->
        <AutoReloadTimer class="auto-reload-timer-position" />
      </div>

      <!-- Fixed height container for "Is It?" title -->
      <div class="question-container">
        <div
          v-if="showTitle"
          class="question-title"
          :class="{ 'slide-in': showTitle }"
        >
          Is It?
        </div>
      </div>
    </div>

    <!-- No epigrams state -->
    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <p>No epigrams available</p>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  font-family: var(--font-primary);
  display: flex;
  flex-direction: column;
  min-height: 100%;
  justify-content: center; /* Center content vertically */
  padding-top: 3rem; /* More space from header on desktop */
}

.epigram-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  justify-content: center; /* Center the entire epigram section */
  max-height: 100vh; /* Prevent container from exceeding viewport */
  overflow: visible; /* Allow content to be visible */
}

/* Flexible wrapper that adapts to content size */
.epigram-wrapper {
  position: relative; /* For absolute positioned refresh button */
  display: flex;
  align-items: flex-start; /* Align to top */
  justify-content: center;
  width: 100%;
  flex-shrink: 1; /* Allow shrinking if needed */
  min-height: 0; /* Allow flex item to shrink below content size */
}

.auto-reload-timer-position {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: var(--z-base);
}

/* Fixed height container to reserve space for the title */
.question-container {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--spacing-sm) 0;
  flex-shrink: 0; /* Don't shrink this container */
}

.question-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: var(--font-weight-semibold);
  text-align: center;
  color: var(--text-primary);
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.4s ease-out;
}

.question-title.slide-in {
  opacity: 1;
  transform: translateY(0);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
  font-family: var(--font-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

.error-state {
  text-align: center;
  padding: var(--spacing-xl);
  font-family: var(--font-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.error-message {
  color: var(--error-red);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-lg);
  font-family: var(--font-primary);
}

.retry-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    var(--accent-hover) 100%
  );
  color: var(--white-000);
  border: none;
  outline: none;
  border-radius: var(--radius-full);
  font-family: var(--font-primary);
  font-weight: var(--font-weight-medium);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 12px rgba(57, 84, 94, 0.3);
  transform: translateY(0);
}

.retry-button:hover {
  background: linear-gradient(
    135deg,
    var(--accent-hover) 0%,
    var(--dark-800) 100%
  );
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(57, 84, 94, 0.4);
}

.retry-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(57, 84, 94, 0.3);
}

.retry-button:focus {
  outline: none;
  box-shadow: 0 4px 12px rgba(57, 84, 94, 0.3), 0 0 0 3px rgba(57, 84, 94, 0.2);
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .home-view {
    padding-top: 4rem; /* More space from header on mobile */
  }

  .question-title {
    font-size: 2rem;
  }

  .question-container {
    height: 60px;
  }
}

@media (max-width: 480px) {
  .home-view {
    padding-top: 5rem; /* Even more space from header on small mobile */
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
  }

  .question-title {
    font-size: 1.75rem;
  }

  .question-container {
    height: 50px;
  }

  .auto-reload-timer-position {
    bottom: 8px;
    left: 8px; /* Align closer to the left edge */
  }
}

/* Handle very long epigrams */
@media (max-height: 600px) {
  .home-view {
    justify-content: flex-start;
    padding-top: var(--spacing-lg);
  }

  .epigram-container {
    justify-content: flex-start;
  }
}
</style>
