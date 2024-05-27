# API
New API written in FastAPI for [BugTracker](https://github.com/Haenes/bugtracker) and [telegram-bot](https://github.com/Haenes/telegram-bot).

The main goal of the project is to write an asynchronous API for an asynchronous bot, as well as to explore a new technology.

The main changes compared to the previous version (written in DRF), in addition to asynchrony, are:
1) A new endpoint structure that matches the structure of the main application for a more convenient and understandable operation
   (it will help a lot in the future when adding [aiogram-dialog](https://github.com/Tishka17/aiogram_dialog) to the bot);
2) Authentication via JWT (to be implemented in the near future).

<b>Immediate plans:</b>
1) Add Authentication;
2) Add caching;
3) Add tests.

<h2>License</h2>

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
