<template>
  <div>
    <div class="content-block__info">
      <strong>Тематика:</strong> {{ wordData.theme }}
    </div>

    <div class="content-block__info">
      <strong>Подсказка:</strong> {{ wordData.prompt }}
    </div>
    <div class="timer-container">
      <slot></slot>
    </div>

    <div class="words-table">
      <div class="word-row" v-for="(row, ind) in testWordsCount" :key="ind">
        <input
          :readonly="wordStep != ind"
          type="text"
          v-for="(letter, letterInd) in wordLength"
          class="letter-filed__cube _empty"
          @input="editLetter($event, letterInd)"
          @focus="focusInput"
          @keydown="handleKeyDown($event, letterInd)"
          :class="{
            '_no-in-word':
              !word.includes(guessedWords[ind][letterInd]) && wordStep > ind,
            '_has-but-no':
              guessedWords[ind][letterInd] != word[letterInd] &&
              word.includes(guessedWords[ind][letterInd]) &&
              wordStep > ind,
            '_letter-guessed':
              guessedWords[ind][letterInd] == word[letterInd] &&
              word.includes(guessedWords[ind][letterInd]) &&
              wordStep > ind,
          }"
        />
      </div>
    </div>
    <button class="app-btn" @click="checkWord">Проверить слово</button>
    <p class="cont-descr">
      При перезагрузке или закрытии окна - игра завершится автоматически
    </p>
  </div>
</template>
<script setup>
import { defineProps, defineEmits, ref } from "vue";
import { useGameSettings } from "@/stores/GameSettings";
const store = useGameSettings();
const emits = defineEmits(["nextGameStep"]);
const props = defineProps({
  gameStep: Number,
});

const wordData = ref(store.currentWord(props.gameStep));
const word = wordData.value.word.toLowerCase().split("");
const wordLength = word.length;
const testWordsCount = Number(store.applicationData.testWordsCount);
const wordStep = ref(0);

const guessedWordsTemplate = {};
for (let index = 0; index < testWordsCount; index++) {
  guessedWordsTemplate[index] = [];
}
const guessedWords = ref(guessedWordsTemplate);
const isKeyDownEvent = ref(false);

const editLetter = ($event, index) => {
  let value = $event.target.value.toLowerCase();
  value = value[value.length - 1];
  const russianLettersRegex = /^[а-яё]+$/i;
  if (!russianLettersRegex.test(value)) {
    value = "";
  }
  $event.target.value = value;
  guessedWords.value[wordStep.value][index] = value;
  if (!isKeyDownEvent.value) {
    const nextInput = $event.target.nextSibling;
    if (nextInput.tagName == "INPUT" && value) {
      nextInput.focus();
    }
  }
  isKeyDownEvent.value = false;
};
const focusInput = (e) => {
  const target = e.target;
  if (!e.target.value) {
    const parentBlock = target.closest(".word-row");
    const letterInputs = [
      ...parentBlock.querySelectorAll(".letter-filed__cube"),
    ];
    const emptyLetter = letterInputs.find((letter) => !letter.value);
    emptyLetter.focus();
  }
};
const handleKeyDown = ($event, index) => {
  if ($event.keyCode === 8 && $event.target.value == "") {
    console.log("handleKeyDown");

    isKeyDownEvent.value = true;
    const prevInput = $event.target.previousSibling;
    if (prevInput.tagName == "INPUT") {
      prevInput.focus();
    }
  } else {
    isKeyDownEvent.value = false;
  }
};

const checkWord = () => {
  if (wordStep.value >= testWordsCount) {
    return;
  }
  const currentStepWord = guessedWords.value[wordStep.value]
    .filter((letter) => letter)
    .join("")
    .trim();
  if (currentStepWord == wordData.value.word) {
    emits("nextGameStep");
    return;
  }
  if (currentStepWord.length == wordLength) {
    wordStep.value++;
  }
  if (wordStep.value == testWordsCount) {
    console.log("Проиграл");
  }
};
</script>
<style scoped>
.content-block__info {
  margin-bottom: 10px;
}
</style>
