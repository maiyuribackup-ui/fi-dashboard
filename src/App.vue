<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue'
import BottomNav from './components/layout/BottomNav.vue'
import ChatWidget from './components/chatbot/ChatWidget.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 container mx-auto px-4 py-6 pb-24">
      <router-view />
    </main>
    <BottomNav />

    <!-- AI Chatbot Widget -->
    <ChatWidget />
  </div>
</template>
