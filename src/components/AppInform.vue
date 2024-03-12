<template>
  <div class="app__inform">
    <div class="content-block">
      <div class="content-block__info">
        <strong>Описание игры:</strong>
        {{ store.applicationData.gameDescription }}
      </div>
    </div>
    <div class="letters-state">
      <div class="letter-filed">
        <input type="text" class="letter-filed__cube _empty" readonly />
        <div class="letter-filed__text">Пустая клетка</div>
      </div>
      <div class="letter-filed">
        <input
          type="text"
          class="letter-filed__cube _no-in-word"
          value="A"
          readonly
        />
        <div class="letter-filed__text">Такой буквы нет в загаданном слове</div>
      </div>

      <div class="letter-filed">
        <input
          type="text"
          class="letter-filed__cube _has-but-no"
          value="A"
          readonly
        />
        <div class="letter-filed__text">
          Буква есть в слове, но стоит не на своем месте
        </div>
      </div>

      <div class="letter-filed">
        <input
          type="text"
          class="letter-filed__cube _letter-guessed"
          value="A"
          readonly
        />
        <div class="letter-filed__text">
          Буква есть в слове и стоит на своем месте
        </div>
      </div>
    </div>
    <div class="app__descr">
      При перезагрузке или закрытии окна - игра завершится автоматически
    </div>
    <div class="app__user">
      <div class="app__user-title">
        Придумайте себе никнейм для рейтинга
        <span class="red-selection">*</span>
      </div>
      <input
        type="text"
        class="add-user-name"
        placeholder="Придумайте себе username для таблицы лидеров"
        @input="$emit('createUserName', $event)"
      />
      <div class="nickname-error" v-if="showErr">
        {{ props.usernameStatus }}
      </div>
    </div>
    <button class="app-btn" @click="$emit('startGame')">Начинаем!</button>
  </div>
</template>

<script setup>
const props = defineProps(["usernameStatus", "showErr"]);

import { useGameSettings } from "@/stores/GameSettings";
const store = useGameSettings();
</script>

<style></style>
