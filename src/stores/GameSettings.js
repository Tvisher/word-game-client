import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import testData from '../assets/testData.json';

const wordsGameId = document.querySelector('#app').dataset.id;
export const useGameSettings = defineStore("GameSettings", () => {
    // state refs
    const applicationData = ref({});
    const guessedWords = ref([]);
    // getters
    const currentWord = (ind) => computed(() => applicationData.value.wordsList.find((word, index) => ind == index));

    const setApplicationData = (data) => {
        applicationData.value = data;
        console.log(applicationData.value);
        document.body.style.setProperty("--app-color", applicationData.value.selectedColors.borderColor.value);
        document.body.style.setProperty("--app-text-color", applicationData.value.selectedColors.textColor.value);
    }
    // Actions
    const getAppData = async () => {
        return new Promise((resolve, reject) => {
            let postData = {
                id: wordsGameId,
            };

            axios.post('/ajax/someurl',
                postData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .then((response) => {
                    setApplicationData(response.data);
                    resolve();
                })
                .catch((error) => {
                    console.log("Ошибка!!!", error);
                    setApplicationData(testData);
                    if (process.env.NODE_ENV === "development") {
                        setApplicationData(testData);
                    }
                    reject();
                });
        })
    };


    return {
        guessedWords,
        applicationData,
        getAppData,
        currentWord
    }
}) 