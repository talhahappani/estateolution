<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 font-sans">
    <!-- Navbar -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-indigo-600">estateolution</h1>
        <nav class="flex space-x-6">
          <NuxtLink to="/" class="text-gray-600 hover:text-indigo-600 font-medium active:text-indigo-800">Transactions</NuxtLink>
          <NuxtLink to="/agents" class="text-gray-600 hover:text-indigo-600 font-medium active:text-indigo-800">Agents</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <NuxtPage />
    </main>
  </div>
</template>
