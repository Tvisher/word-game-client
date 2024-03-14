<template>
  <div
    class="app__wrapper"
    :style="{ 'background-image': 'url(' + bgUrl + ')' }"
  >
    <AppContent v-if="aplicationReady && !showOnlyResTable" />
    <div class="app__inner" v-if="aplicationReady && showOnlyResTable">
      <div class="game-result">
        <div class="game-result__tabel">
          <div class="game-result__title">ТОП победителей</div>
          <div class="game-result__message">{{ resMessage }}</div>
          <div class="game-result__items">
            <div
              class="game-result__item"
              v-for="tableResultItem in tableResult"
            >
              <div class="game-result__name">{{ tableResultItem.UF_NICK }}</div>
              <div class="game-result__time">{{ tableResultItem.UF_TIME }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import AppContent from "@/components/AppContent.vue";
import { ref, watch } from "vue";
import { useGameSettings } from "./stores/GameSettings";
import axios from "axios";

const store = useGameSettings();
const resMessage = ref("");
const aplicationReady = ref(false);
const showOnlyResTable = ref(false);
const bgUrl = ref("");
const tableResult = ref([]);

store
  .getAppData()
  .then((res) => {
    if (!store.applicationData.additionalSettings.allowReplay) {
      const wordsGameId = document.querySelector("#app").dataset.gameId;
      let wordGameIDs = JSON.parse(localStorage.getItem("wordGameIDs"));
      if (wordGameIDs && wordGameIDs.includes(wordsGameId)) {
        axios
          .get("/ajax/gamewordtime.php", {
            params: {
              gameid: wordsGameId,
              onlyResult: true,
            },
          })
          .then((response) => {
            console.log(response.data);
            let ratingData = response.data;
            ratingData.sort((a, b) => {
              let timeA =
                parseInt(a.UF_TIME.split(":")[0]) * 60 +
                parseInt(a.UF_TIME.split(":")[1]);
              let timeB =
                parseInt(b.UF_TIME.split(":")[0]) * 60 +
                parseInt(b.UF_TIME.split(":")[1]);
              return timeA - timeB;
            });
            tableResult.value = ratingData;
            showOnlyResTable.value = true;
            aplicationReady.value = true;
            resMessage.value = store.applicationData.gameResultMessage;
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        aplicationReady.value = true;
      }
    } else {
      aplicationReady.value = true;
    }
  })
  .catch((err) => {
    console.log(err);

    // aplicationReady.value = true;
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
