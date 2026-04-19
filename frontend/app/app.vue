<template>
  <div class="min-h-screen font-sans transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    <!-- Navbar -->
    <header class="shadow-sm border-b transition-colors duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center gap-4">
        <NuxtLink to="/" class="text-lg md:text-2xl font-bold transition-colors duration-300 text-teal-600 dark:text-teal-400">estateolution</NuxtLink>
        <div class="flex items-center md:space-x-6 space-x-3">
          <nav class="flex md:space-x-6 space-x-3">
            <NuxtLink to="/" class="text-sm md:text-base font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400 text-slate-600 dark:text-slate-300">Transactions</NuxtLink>
            <NuxtLink to="/agents" class="text-sm md:text-base font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400 text-slate-600 dark:text-slate-300">Agents</NuxtLink>
          </nav>

          <!-- Divider -->
          <div class="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

          <!-- Theme Toggle Button -->
          <button @click="toggleTheme" class="p-2 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400" aria-label="Toggle Dark Mode">
            <!-- Sun Icon (shows in dark mode) -->
            <svg v-if="colorMode.value === 'dark'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon Icon (shows in light mode) -->
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <NuxtPage />
    </main>
  </div>
</template>
<script setup lang="ts">
const colorMode = useColorMode();

const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};
</script>
