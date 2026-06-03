<template>
  <div class="app-shell">
    <AppHeader />
    <RouterView v-slot="{ Component }">
      <Transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
</script>
