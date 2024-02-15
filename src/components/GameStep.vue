<template>
  <div>
    <div class="game-step-head">
      <div class="game-step-head__info">
        <div class="content-block__info">
          <strong>Тематика:</strong> {{ wordData.theme }}
        </div>

        <div class="content-block__info">
          <strong>Подсказка:</strong> {{ wordData.prompt }}
        </div>
      </div>
      <div class="game-step-num">
        Слово <strong>{{ gameStep + 1 }}</strong> из
        <strong>{{ gameStepsLength }}</strong>
      </div>
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
              !word.includes(guessedWords[ind].word[letterInd]) &&
              guessedWords[ind].filled,
            '_has-but-no':
              guessedWords[ind][letterInd] != word[letterInd] &&
              word.includes(guessedWords[ind].word[letterInd]) &&
              guessedWords[ind].filled,
            '_letter-guessed':
              guessedWords[ind].word[letterInd] == word[letterInd] &&
              word.includes(guessedWords[ind].word[letterInd]) &&
              guessedWords[ind].filled,
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
import { ref, onMounted, nextTick } from "vue";
import { useGameSettings } from "@/stores/GameSettings";
const store = useGameSettings();
const emits = defineEmits(["nextGameStep"]);
const props = defineProps({
  gameStep: Number,
  gameStepsLength: Number,
});

const wordData = ref(store.currentWord(props.gameStep));
const word = wordData.value.word.toLowerCase().split("");
const wordLength = word.length;
const testWordsCount = Number(store.applicationData.testWordsCount);
const wordStep = ref(0);

const guessedWordsTemplate = {};
for (let index = 0; index < testWordsCount; index++) {
  guessedWordsTemplate[index] = {
    word: [],
    filled: false,
  };
}
const guessedWords = ref(guessedWordsTemplate);
const isKeyDownEvent = ref(false);
const focusInCurrentInput = () => {
  const wordsTable = document.querySelector(".words-table");
  const currentInput = [
    ...wordsTable.querySelectorAll(".letter-filed__cube"),
  ].filter((input) => !input.hasAttribute("readonly"));
  currentInput[0] && currentInput[0].focus();
};

const editLetter = ($event, index) => {
  let value = $event.target.value.toLowerCase();
  value = value[value.length - 1];
  const russianLettersRegex = /^[а-яё]+$/i;
  if (!russianLettersRegex.test(value)) {
    value = "";
  }
  $event.target.value = value;
  guessedWords.value[wordStep.value].word[index] = value;
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
  if ($event.keyCode == 13) {
    checkWord();
    $event.target.blur();
    return;
  }
  if ($event.keyCode === 8 && $event.target.value == "") {
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
  const currentStepWord = guessedWords.value[wordStep.value].word
    .filter((letter) => letter)
    .join("")
    .trim();
  if (currentStepWord == wordData.value.word) {
    guessedWords.value[wordStep.value].filled = true;
    setTimeout(() => {
      emits("nextGameStep");
    }, 1000);
    return;
  }
  if (currentStepWord.length == wordLength) {
    guessedWords.value[wordStep.value].filled = true;
    wordStep.value++;
    nextTick(() => focusInCurrentInput());
  }
  if (wordStep.value == testWordsCount) {
    console.log("Кончились попытки, ты проиграл");
    alert("Кончились попытки, ты проиграл");
  }
};

onMounted(() => {
  focusInCurrentInput();
});
</script>
<style scoped>
.content-block__info {
  margin-bottom: 10px;
}

.game-step-head {
  display: flex;
  align-items: flex-start;
}
.game-step-num {
  margin-left: auto;
  padding-left: 20px;
}
</style>
