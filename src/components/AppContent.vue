<template>
  <div class="app__inner">
    <h1 class="app__title">{{ gameTitle }}</h1>
    <transition name="fade" mode="out-in">
      <div class="app__content" v-if="!showResult">
        <a
          :href="`/lk/gameword/public/?id=${wordsGameId}`"
          class="admin-edit"
          v-if="isAdmin"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_2041_44503)">
              <path
                d="M0.781333 12.7459C0.281202 13.2459 0.000151033 13.9241 0 14.6312L0 15.9999H1.36867C2.07585 15.9997 2.75402 15.7187 3.254 15.2186L12.1493 6.32325L9.67667 3.85059L0.781333 12.7459Z"
                fill="var(--app-color)"
              ></path>
              <path
                d="M15.4298 0.570239C15.2675 0.407729 15.0747 0.278809 14.8625 0.19085C14.6503 0.102891 14.4228 0.0576172 14.1931 0.0576172C13.9634 0.0576172 13.736 0.102891 13.5238 0.19085C13.3116 0.278809 13.1188 0.407729 12.9565 0.570239L10.6191 2.90824L13.0918 5.38091L15.4298 3.04357C15.5923 2.88123 15.7212 2.68845 15.8092 2.47626C15.8972 2.26406 15.9424 2.03661 15.9424 1.80691C15.9424 1.5772 15.8972 1.34975 15.8092 1.13755C15.7212 0.925358 15.5923 0.73258 15.4298 0.570239Z"
                fill="var(--app-color)"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0_2041_44503">
                <rect width="16" height="16" fill="white"></rect>
              </clipPath>
            </defs></svg
        ></a>
        <AppInform
          @startGame="startGame"
          @createUserName="createUserName"
          v-if="gameStart === false"
          :usernameStatus="usernameStatus"
          :showErr="showErr"
        />
        <transition name="fade" mode="out-in">
          <GameStep
            v-if="gameStart"
            :key="gameStep"
            :gameStep="gameStep"
            :gameStepsLength="wordsCount"
            @nextGameStep="nextGameStep"
            @attemptsEnd="attemptsEnd"
          >
            <vue-countdown
              v-if="gameStart && showTimer"
              :time="minutesLimit"
              :interval="500"
              v-slot="{ minutes, seconds }"
              @progress="checkprogress"
              @end="timeIsOver"
              ref="timerComponent"
            >
              {{ minutes >= 0 && minutes <= 9 ? "0" + minutes : minutes }}
              :
              {{ seconds >= 0 && seconds <= 9 ? "0" + seconds : seconds }}
            </vue-countdown>
            <span v-else> 00:00 </span>
            <div class="words-prompt" @click="showPromptModal = true"></div>
          </GameStep>
        </transition>
      </div>
      <div class="game-result" v-else>
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
        <button
          class="app-btn game-result__btn"
          @click="restartGame"
          v-if="allowReplay"
        >
          Угадывать слово снова
        </button>
      </div>
    </transition>
  </div>
  <transition name="fade" mode="out-in">
    <div class="app-modal" v-if="showPromptModal" @click="closePromptModal">
      <div class="app-modal__content">
        <div class="app-modal__close"></div>
        <div class="app-modal__title">Обозначение ячеек</div>
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
            <div class="letter-filed__text">
              Такой буквы нет в загаданном слове
            </div>
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

        <div class="app-modal__guessed-words" v-if="guessedWords.length > 0">
          <div class="app-modal__title">Угаданные слова :</div>
          <div class="guessed-word" v-for="word in guessedWords">
            {{ word }}
          </div>
        </div>
      </div>
    </div>
  </transition>
  <transition name="fade" mode="out-in">
    <div
      class="app-modal res-modal"
      v-if="showMessageModal"
      @click="closeMessageModal"
    >
      <div class="app-modal__content">
        <div class="app-modal__close"></div>
        <div class="app-modal__ico">
          <svg
            width="132"
            height="132"
            viewBox="0 0 132 132"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M93.4698 85.9361V127.904C81.147 127.904 71.1574 117.915 71.1574 105.592V19.028H95.3877C105.881 19.028 114.388 27.5346 114.388 38.028V65.0273L93.4698 85.9361Z"
              fill="var(--app-color)"
            />
            <path
              d="M91.9717 86.2754H13.5167L33.1305 19.0283H91.9717V86.2754Z"
              fill="url(#paint0_linear_2578_26083)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_2578_26083"
                x1="80.0633"
                y1="72.9661"
                x2="3.4717"
                y2="54.8234"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="var(--app-color)" stop-opacity="0" />
                <stop offset="1" stop-color="var(--app-color)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="app-modal__title">Увы! Вы проиграли!</div>
        <span class="app-modal__sub">{{ messageModalText }}</span>
        <button
          class="app-btn game-result__btn"
          @click="restartGame"
          v-if="allowReplay"
        >
          Угадывать слово снова
        </button>
      </div>
    </div>
  </transition>
  <div
    class="app__footer"
    v-if="!store.applicationData.additionalSettings.hideFooterBlock"
  >
    <a href="https://vnutricom.ru/" class="app__footer-logo">
      <span>Сделано в бесплатной версии</span>
      <svg
        width="128"
        height="27"
        viewBox="0 0 128 27"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.9828 23.1115H19.2969V9.94141H19.6674C19.76 9.94141 19.8526 9.94141 19.9452 9.94141C20.0378 9.94141 20.1304 9.94141 20.2231 9.94141C20.4083 9.94141 20.5935 9.94141 20.7788 10.0335C20.964 10.0335 21.1492 10.1256 21.3345 10.2177C21.5197 10.3098 21.705 10.494 21.7976 10.6782C21.8902 10.7703 21.9828 11.0466 21.9828 11.3229V23.1115Z"
          fill="white"
        />
        <path
          d="M32.5394 19.0633V9.94561H32.8173C32.9099 9.94561 33.0025 9.94561 33.0951 9.94561C33.1877 9.94561 33.2804 9.94561 33.373 9.94561C33.5582 9.94561 33.7434 9.94561 33.9287 10.0377C34.1139 10.0377 34.2992 10.1298 34.4844 10.2219C34.6696 10.314 34.7623 10.4982 34.9475 10.6824C35.0401 10.8666 35.1327 11.1429 35.1327 11.5113V23.2999H32.8173L27.1675 14.4584V23.2078H24.5742V9.94561C24.6668 9.85352 24.8521 9.85352 25.0373 9.85352C25.2225 9.85352 25.5004 9.85352 25.6856 9.85352C26.1487 9.85352 26.4266 9.94561 26.7044 10.0377C26.9823 10.2219 27.1675 10.4061 27.3528 10.6824L32.5394 19.0633Z"
          fill="white"
        />
        <path
          d="M40.7839 12.0639H36.6161C36.6161 11.8797 36.6161 11.7876 36.5234 11.6955C36.5234 11.6034 36.5234 11.4192 36.5234 11.3271C36.5234 10.9587 36.6161 10.6824 36.8939 10.314C37.1718 10.0377 37.6349 9.85352 38.1906 9.85352H47.545C47.545 10.1298 47.6377 10.4061 47.6377 10.6824C47.6377 11.0508 47.545 11.3271 47.2672 11.6034C46.9893 11.8797 46.6189 12.0639 45.9705 12.0639H43.4698V23.1157H40.6913V12.0639H40.7839Z"
          fill="white"
        />
        <path
          d="M56.1573 21.0895C56.8057 21.0895 57.2688 21.2737 57.454 21.55C57.7319 21.8263 57.8245 22.1947 57.8245 22.5631C57.8245 22.7473 57.8245 22.8394 57.8245 22.9315C57.8245 23.0236 57.8245 23.1157 57.8245 23.2999H49.2109V9.85352H57.5466C57.5466 10.0377 57.5466 10.1298 57.6392 10.2219C57.6392 10.314 57.6392 10.4061 57.6392 10.5903C57.6392 11.0508 57.5466 11.4192 57.2688 11.6034C56.9909 11.7876 56.6204 11.9718 55.9721 11.9718H52.0821V15.1952H56.3426V17.3135H52.0821V20.9974H56.1573V21.0895Z"
          fill="white"
        />
        <path
          d="M68.6614 13.721C68.6614 14.2736 68.5688 14.734 68.4762 15.1945C68.2909 15.5629 68.1057 15.9313 67.9205 16.2997C67.6426 16.576 67.3648 16.8523 67.0869 17.1286C66.8091 17.3128 66.4386 17.497 66.1607 17.5891L69.4024 23.0229C69.1245 23.115 68.8467 23.2071 68.5688 23.2992C68.291 23.3913 68.0131 23.3913 67.7352 23.3913C67.2722 23.3913 66.8091 23.2992 66.5312 23.115C66.1607 22.9308 65.8829 22.5624 65.605 22.1019L63.3822 18.1417H62.2707V23.115H59.4922V9.94494C60.1405 9.85284 60.7888 9.85284 61.4372 9.85284C62.0855 9.85284 62.6412 9.76074 63.1043 9.76074C65.0493 9.76074 66.4386 10.1291 67.3648 10.7738C68.1983 11.4185 68.6614 12.3395 68.6614 13.721ZM65.7903 13.9052C65.7903 13.0763 65.605 12.5237 65.1419 12.1553C64.6788 11.879 64.1231 11.6948 63.3822 11.6948C63.1043 11.6948 62.9191 11.6948 62.7338 11.6948C62.5486 11.6948 62.456 11.6948 62.2707 11.6948V16.2997H63.1969C64.0305 16.2997 64.5862 16.1155 65.0493 15.7471C65.605 15.3787 65.7903 14.734 65.7903 13.9052Z"
          fill="white"
        />
        <path
          d="M81.4502 22.3804C81.3576 22.4725 81.265 22.5646 81.0797 22.6567C80.8945 22.7488 80.6167 22.933 80.3388 23.0251C80.0609 23.1172 79.6905 23.2093 79.2274 23.3014C78.7643 23.3935 78.3012 23.3935 77.7455 23.3935C76.6341 23.3935 75.7079 23.2093 74.9669 22.8409C74.226 22.4725 73.5776 22.012 73.0219 21.3673C72.4662 20.7226 72.0957 19.9858 71.9105 19.1569C71.6327 18.3281 71.54 17.4071 71.54 16.394C71.54 15.3809 71.6327 14.4599 71.9105 13.6311C72.1884 12.8022 72.5588 12.0654 73.1146 11.4207C73.6703 10.776 74.3186 10.3155 75.0595 9.94712C75.8005 9.57873 76.7267 9.39453 77.8381 9.39453C78.3938 9.39453 78.8569 9.48663 79.2274 9.57873C79.6905 9.67082 79.9683 9.76292 80.3388 9.94712C80.6167 10.0392 80.8945 10.2234 81.0797 10.3155C81.265 10.4997 81.4502 10.5918 81.5428 10.6839C81.6355 10.776 81.7281 10.9602 81.8207 11.0523C81.9133 11.2365 81.9133 11.3286 81.9133 11.5128C81.9133 11.7891 81.8207 12.0654 81.6355 12.3417C81.4502 12.618 81.1724 12.8943 80.9871 13.0785C80.8019 12.8943 80.6166 12.8022 80.4314 12.618C80.2462 12.4338 79.9683 12.3417 79.7831 12.1575C79.5052 12.0654 79.2274 11.8812 78.9495 11.8812C78.6717 11.7891 78.3012 11.7891 77.9307 11.7891C77.2824 11.7891 76.7267 11.8812 76.2636 12.1575C75.8005 12.4338 75.43 12.8022 75.1522 13.2627C74.8743 13.7231 74.6891 14.1836 74.5964 14.7362C74.5038 15.2888 74.4112 15.8414 74.4112 16.4861C74.4112 17.1308 74.5038 17.6834 74.5964 18.236C74.6891 18.7886 74.9669 19.3411 75.2448 19.7095C75.5226 20.17 75.8931 20.5384 76.3562 20.7226C76.8193 20.9989 77.375 21.091 78.116 21.091C78.4864 21.091 78.8569 20.9989 79.1348 20.9068C79.4126 20.8147 79.6905 20.7226 79.9683 20.5384C80.2462 20.4463 80.4314 20.2621 80.6166 20.0779C80.8019 19.8937 80.9871 19.8016 81.0797 19.7095C81.1724 19.8016 81.265 19.8937 81.3576 20.0779C81.4502 20.17 81.5428 20.3542 81.6355 20.5384C81.7281 20.7226 81.8207 20.8147 81.9133 20.9989C82.0059 21.1831 82.0059 21.2752 82.0059 21.3673C82.0059 21.5515 82.0059 21.6436 81.9133 21.8278C81.7281 22.1041 81.6355 22.2883 81.4502 22.3804Z"
          fill="white"
        />
        <path
          d="M95.1574 16.4868C95.1574 17.4078 95.0648 18.3287 94.787 19.1576C94.6017 19.9865 94.2313 20.7233 93.6755 21.368C93.2125 22.0127 92.5641 22.4732 91.8232 22.8415C91.0822 23.2099 90.156 23.3941 89.0446 23.3941C87.9332 23.3941 87.007 23.2099 86.2661 22.8415C85.5251 22.4732 84.8768 21.9206 84.4137 21.2759C83.9506 20.6312 83.5801 19.8944 83.3949 19.0655C83.2097 18.2366 83.0244 17.3157 83.0244 16.3947C83.0244 15.4737 83.117 14.5527 83.3949 13.7238C83.6727 12.8949 84.0432 12.1582 84.5063 11.5135C84.9694 10.8688 85.6177 10.4083 86.4513 10.0399C87.1922 9.6715 88.1184 9.4873 89.2299 9.4873C90.2487 9.4873 91.1748 9.6715 91.9158 10.0399C92.6567 10.4083 93.3051 10.8688 93.7682 11.5135C94.2313 12.1582 94.6017 12.8949 94.787 13.7238C95.0648 14.6448 95.1574 15.4737 95.1574 16.4868ZM92.3789 16.4868C92.3789 15.8421 92.2863 15.2895 92.1936 14.6448C92.101 14.0922 91.9158 13.5396 91.6379 13.1712C91.3601 12.7107 91.0822 12.4344 90.6191 12.1582C90.2487 11.8819 89.6929 11.7898 89.1372 11.7898C88.4889 11.7898 88.0258 11.8819 87.5627 12.1582C87.0996 12.4344 86.8218 12.7107 86.5439 13.1712C86.2661 13.6317 86.0808 14.0922 85.9882 14.6448C85.8956 15.1974 85.803 15.8421 85.803 16.4868C85.803 17.1315 85.8956 17.684 85.9882 18.3287C86.0808 18.8813 86.2661 19.4339 86.5439 19.8944C86.8218 20.3549 87.0996 20.7233 87.5627 20.9996C87.9332 21.2759 88.4889 21.368 89.0446 21.368C89.6003 21.368 90.156 21.2759 90.5265 20.9996C90.897 20.7233 91.2675 20.3549 91.5453 19.8944C91.8232 19.4339 92.0084 18.9734 92.101 18.3287C92.2863 17.7761 92.3789 17.1315 92.3789 16.4868Z"
          fill="white"
        />
        <path
          d="M99.5098 9.7666C99.9729 9.7666 100.251 9.8587 100.529 10.0429C100.806 10.2271 100.992 10.5034 101.084 10.8718L104.141 17.9633L107.197 10.9639C107.382 10.5034 107.66 10.2271 107.938 10.0429C108.216 9.8587 108.494 9.7666 108.864 9.7666C109.142 9.7666 109.42 9.7666 109.698 9.8587C109.976 9.8587 110.161 9.9508 110.254 9.9508L111.18 23.1208H108.586L107.938 14.3715L105.252 20.3579H102.937L100.343 14.5557L99.7876 23.1208H97.1943L98.2131 9.9508C98.3058 9.9508 98.5836 9.8587 98.7688 9.8587C98.9541 9.8587 99.2319 9.7666 99.5098 9.7666Z"
          fill="white"
        />
        <path
          d="M115.533 9.7666C115.996 9.7666 116.274 9.8587 116.552 10.0429C116.83 10.2271 117.015 10.5034 117.108 10.8718L120.164 17.9633L123.221 10.9639C123.406 10.5034 123.684 10.2271 123.962 10.0429C124.24 9.8587 124.517 9.7666 124.888 9.7666C125.166 9.7666 125.444 9.7666 125.721 9.8587C125.999 9.8587 126.185 9.9508 126.277 9.9508L127.203 23.1208H124.61L123.962 14.3715L121.276 20.3579H119.053L116.46 14.5557L115.904 23.1208H113.311L114.329 9.9508C114.422 9.9508 114.7 9.8587 114.885 9.8587C114.978 9.8587 115.256 9.7666 115.533 9.7666Z"
          fill="white"
        />
        <path
          d="M12.6662 9.9126C9.52892 8.65977 5.84786 9.32794 3.33806 11.8336C-0.0501852 15.2162 -0.0501852 20.6869 3.33806 24.0695C5.84786 26.5752 9.52892 27.2434 12.6662 25.9905V21.9815C12.0387 22.2738 11.3694 22.4409 10.6583 22.4409C8.14852 22.4409 6.14067 20.4363 6.14067 17.9307C6.14067 15.425 8.14852 13.4205 10.6583 13.4205C11.3694 13.4205 12.0806 13.5876 12.6662 13.8799V9.9126Z"
          fill="#FA0056"
        />
        <path
          d="M11.2446 5.8946C12.4803 4.65575 12.4803 2.60524 11.2446 1.32367C10.0088 0.0848188 7.96342 0.0848188 6.68505 1.32367C5.40668 2.56252 5.4493 4.61303 6.68505 5.8946C7.96342 7.13345 10.0088 7.13345 11.2446 5.8946Z"
          fill="#FA0056"
        />
      </svg>
    </a>
  </div>
</template>

<script setup>
import axios from "axios";

import { ref } from "vue";
import AppInform from "@/components/AppInform.vue";
import GameStep from "@/components/GameStep.vue";
import VueCountdown from "@chenfengyuan/vue-countdown";
import { useGameSettings } from "@/stores/GameSettings";
import { storeToRefs } from "pinia";
const wordsGameId = document.querySelector("#app").dataset.gameId;
const isAdmin = document.querySelector("#app").hasAttribute("data-admin");
const store = useGameSettings();
const isDisableRepeatUsername =
  store.applicationData.additionalSettings.disableRepeatUsername;
const resMessage = store.applicationData.gameResultMessage;

const allowReplay = store.applicationData.additionalSettings.allowReplay;
const gameTitle = store.applicationData.gameTitle;
const { guessedWords } = storeToRefs(store);
const timeLimitData = store.applicationData.additionalSettings.limitPlayTime;
const defaultMinutesLimit =
  (timeLimitData.enable ? timeLimitData.minutesCount : 60) * 60 * 1000.1;
const minutesLimit = ref(defaultMinutesLimit);
const gameStart = ref(false);
const gameStep = ref(0);
const wordsCount = store.applicationData.wordsList.length;
const showPromptModal = ref(false);
const showMessageModal = ref(false);
const messageModalText = ref("");
const timerComponent = ref(null);
const showTimer = ref(true);
const userName = ref("");
const showResult = ref(false);
const tableResult = ref([]);
const usernameStatus = ref("поле не может быть пустым");
const showErr = ref(false);

const startGame = () => {
  if (userName.value.trim().length > 0) {
    if (store.applicationData.additionalSettings.disableRepeatUsername) {
      axios
        .get("/ajax/gamewordtime.php", {
          params: {
            nickname: userName.value,
            gameid: wordsGameId,
            isDisableRepeatUsername,
          },
        })
        .then((response) => {
          console.log(response);
          if (response.data) {
            gameStart.value = !0;
          } else {
            usernameStatus.value = "Данный ник уже занят";
            showErr.value = true;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      gameStart.value = !0;
    }
  } else {
    usernameStatus.value = "поле не может быть пустым";
    showErr.value = true;
  }
};

const restartGame = () => {
  showMessageModal.value = false;
  showResult.value = false;
  gameStart.value = true;
  gameStep.value = 0;
  minutesLimit.value = defaultMinutesLimit;
  showTimer.value = true;
  console.log(timerComponent);
  guessedWords.value = [];
  showErr.value = false;
  messageModalText.value = "";
};

const createUserName = (e) => {
  showErr.value = false;
  userName.value = e.target.value.trim();
};

const nextGameStep = () => {
  if (guessedWords.value.length === wordsCount) return;
  const currentWord = store.currentWord(gameStep.value).value.word;
  guessedWords.value.push(currentWord);
  if (gameStep.value < wordsCount - 1) {
    gameStep.value++;
  } else {
    timerComponent.value.pause();
    showTimer.value = false;
    console.log("Конец игры, все слова отгаданы");

    const userResultTime = msecToString(
      defaultMinutesLimit - minutesLimit.value
    );

    axios
      .get("/ajax/gamewordtime.php", {
        params: {
          nick: userName.value,
          gameid: wordsGameId,
          time: userResultTime,
        },
      })
      .then((response) => {
        console.log(response);
        let ratingData = response.data;
        if (!allowReplay) {
          let wordGameIDs = JSON.parse(localStorage.getItem("wordGameIDs"));
          if (wordGameIDs) {
            wordGameIDs.push(wordsGameId);
            localStorage.setItem("wordGameIDs", JSON.stringify(wordGameIDs));
          } else {
            localStorage.setItem("wordGameIDs", JSON.stringify([wordsGameId]));
          }
        }
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
        showResult.value = true;
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

const attemptsEnd = () => {
  timerComponent.value.pause();
  showTimer.value = false;
  endGame("Кончились попытки, Вы проиграли");
};
const checkprogress = (data) => (minutesLimit.value = data.totalMilliseconds);

const timeIsOver = () => {
  endGame("Кончилось время, Вы проиграли");
};
const endGame = (message) => {
  messageModalText.value = message;
  showMessageModal.value = true;
  const wordsGameId = document.querySelector("#app").dataset.gameId;
  if (!allowReplay) {
    let wordGameIDs = JSON.parse(localStorage.getItem("wordGameIDs"));
    if (wordGameIDs) {
      wordGameIDs.push(wordsGameId);
      localStorage.setItem("wordGameIDs", JSON.stringify(wordGameIDs));
    } else {
      localStorage.setItem("wordGameIDs", JSON.stringify([wordsGameId]));
    }
  }
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
      showResult.value = true;
    })
    .catch((error) => {
      console.log(error);
    });
};

const closePromptModal = (e) => {
  const target = e.target;
  if (
    (target.closest(".app-modal") && !target.closest(".app-modal__content")) ||
    target.closest(".app-modal__close")
  ) {
    showPromptModal.value = false;
  }
};

const closeMessageModal = (e) => {
  const target = e.target;
  if (
    (target.closest(".app-modal") && !target.closest(".app-modal__content")) ||
    target.closest(".app-modal__close")
  ) {
    showMessageModal.value = false;
  }
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
