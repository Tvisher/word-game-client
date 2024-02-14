<template>
  <div class="app__wrapper" v-if="aplicationReady">
    <AppContent />
  </div>
</template>
<script setup>
import AppContent from "@/components/AppContent.vue";
import { ref } from "vue";
import { useGameSettings } from "./stores/GameSettings";
const store = useGameSettings();

const aplicationReady = ref(false);
store
  .getAppData()
  .then((res) => (aplicationReady.value = true))
  .catch((err) => {
    console.log(err);
    if (process.env.NODE_ENV === "development") {
      aplicationReady.value = true;
    }
  });
</script>
<style></style>
