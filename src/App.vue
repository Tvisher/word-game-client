<template>
  <div
    class="app__wrapper"
    :style="{ 'background-image': 'url(' + bgUrl + ')' }"
    v-if="aplicationReady"
  >
    <AppContent />
  </div>
</template>
<script setup>
import AppContent from "@/components/AppContent.vue";
import { ref, watch } from "vue";
import { useGameSettings } from "./stores/GameSettings";
const store = useGameSettings();
const aplicationReady = ref(false);
const bgUrl = ref("");
store
  .getAppData()
  .then((res) => (aplicationReady.value = true))
  .catch((err) => {
    console.log(err);
    aplicationReady.value = true;

    if (process.env.NODE_ENV === "development") {
      aplicationReady.value = true;
    }
  });

watch(aplicationReady, (newVal, oldVal) => {
  if (newVal == true) {
    const appBackground = store.applicationData.backgroundUrl;
    if (appBackground.path != "") {
      bgUrl.value = appBackground.path;
      console.log(bgUrl.value);
    }
  }
});
</script>
<style></style>
