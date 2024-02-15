<template>
  <div class="app__inner">
    <h1 class="app__title">Игра в Слова</h1>
    <div class="app__content">
      <AppInform @startGame="startGame" v-if="gameStart === false" />
      <transition name="fade" mode="out-in">
        <GameStep
          v-if="gameStart"
          :key="gameStep"
          :gameStep="gameStep"
          :gameStepsLength="wordsCount"
          @nextGameStep="nextGameStep"
        >
          <vue-countdown
            v-if="gameStart"
            :time="minutesLimit"
            :interval="500"
            v-slot="{ minutes, seconds }"
            @progress="checkprogress"
            @end="timeIsOver"
          >
            {{ minutes >= 0 && minutes <= 9 ? "0" + minutes : minutes }}
            :
            {{ seconds >= 0 && seconds <= 9 ? "0" + seconds : seconds }}
          </vue-countdown>
          <div class="words-complited-list" v-if="guessedWords.length > 0">
            Угаданные <br />
            слова
          </div>
        </GameStep>
      </transition>
    </div>
  </div>
  <div class="app__footer"></div>
</template>
<script setup>
import { ref } from "vue";
import AppInform from "@/components/AppInform.vue";
import GameStep from "@/components/GameStep.vue";
import VueCountdown from "@chenfengyuan/vue-countdown";

import { useGameSettings } from "@/stores/GameSettings";
import { storeToRefs } from "pinia";
const store = useGameSettings();
const { guessedWords } = storeToRefs(store);
const timeLimitData = store.applicationData.additionalSettings.limitPlayTime;
const defaultMinutesLimit =
  (timeLimitData.enable ? timeLimitData.minutesCount : 60) * 60 * 1001;
const minutesLimit = ref(defaultMinutesLimit);
const gameStart = ref(false);
const gameStep = ref(0);
const wordsCount = store.applicationData.wordsList.length;

const startGame = () => {
  gameStart.value = !0;
};
const nextGameStep = () => {
  if (guessedWords.value.length === wordsCount) return;
  const currentWord = store.currentWord(gameStep.value).value.word;
  guessedWords.value.push(currentWord);
  if (gameStep.value < wordsCount - 1) {
    gameStep.value++;
  } else {
    console.log("Конец игры, все слова отгаданы");
    alert("Конец игры, все слова отгаданы");

    const userResultTime = msecToString(
      defaultMinutesLimit - minutesLimit.value
    );
    console.log(userResultTime);
  }
};
const checkprogress = (data) => {
  minutesLimit.value = data.totalMilliseconds;
};
const timeIsOver = () => {
  console.log("Конец игры, так как вышло время");
  alert("Конец игры, так как вышло время");
};

function msecToString(milliseconds) {
  var minutes = Math.floor(milliseconds / 60000);
  var seconds = ((milliseconds % 60000) / 1000).toFixed(0);
  return (
    (minutes < 10 ? "0" : "") +
    minutes +
    ":" +
    (seconds < 10 ? "0" : "") +
    seconds
  );
}
</script>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
