import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      "Tanks.io": "Танки.io",
      "Play Multiplayer": "Играть по сети",
      "Play vs Bots": "Играть против ботов",
      "Settings": "Настройки",
      "Language": "Язык",
      "English": "Английский",
      "Russian": "Русский",
      "Login with Google": "Войти через Google",
      "Logout": "Выйти",
      "Leaderboard": "Таблица лидеров",
      "Kills": "Убийства",
      "Deaths": "Смерти",
      "Matches": "Матчи",
      "Tactical Advisor": "Тактический советник",
      "Ask Advisor": "Спросить советника",
      "Thinking...": "Думаю...",
      "Health": "Здоровье",
      "Score": "Счет",
      "Respawning...": "Возрождение...",
      "Back to Menu": "В главное меню",
      "Nickname": "Никнейм",
      "Enter your name...": "Введите имя...",
      "PLAY NOW": "ИГРАТЬ",
      "Add Bot": "Добавить бота",
      "Clear Bots": "Удалить ботов",
      "Game Paused": "Игра на паузе",
      "Click anywhere to resume and lock cursor": "Кликните, чтобы продолжить",
      "Press F1 or ESC to unlock": "Нажмите ESC, чтобы освободить курсор",
      "Player": "Игрок",
      "was killed by": "был убит",
      "Bot was destroyed by": "Бот был уничтожен",
      "Ask about tactics...": "Спроси о тактике...",
      "Connecting to server...": "Подключение к серверу..."
    }
  },
  en: {
    translation: {
      "Tanks.io": "Tanks.io",
      "Play Multiplayer": "Play Multiplayer",
      "Play vs Bots": "Play vs Bots",
      "Settings": "Settings",
      "Language": "Language",
      "English": "English",
      "Russian": "Russian",
      "Login with Google": "Login with Google",
      "Logout": "Logout",
      "Leaderboard": "Leaderboard",
      "Kills": "Kills",
      "Deaths": "Deaths",
      "Matches": "Matches",
      "Tactical Advisor": "Tactical Advisor",
      "Ask Advisor": "Ask Advisor",
      "Thinking...": "Thinking...",
      "Health": "Health",
      "Score": "Score",
      "Respawning...": "Respawning...",
      "Back to Menu": "Back to Menu",
      "Nickname": "Nickname",
      "Enter your name...": "Enter your name...",
      "PLAY NOW": "PLAY NOW",
      "Add Bot": "Add Bot",
      "Clear Bots": "Clear Bots",
      "Game Paused": "Game Paused",
      "Click anywhere to resume and lock cursor": "Click anywhere to resume and lock cursor",
      "Press F1 or ESC to unlock": "Press F1 or ESC to unlock",
      "Player": "Player",
      "was killed by": "was killed by",
      "Bot was destroyed by": "Bot was destroyed by",
      "Ask about tactics...": "Ask about tactics...",
      "Connecting to server...": "Connecting to server..."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ru", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
