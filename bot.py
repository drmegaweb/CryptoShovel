import sqlite3
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
import logging


logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    conn = sqlite3.connect('game.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            coins INTEGER,
            energy INTEGER,
            max_energy INTEGER,
            level INTEGER,
            tap_profit INTEGER,
            bonus_points INTEGER,
            chance_multiplier REAL,
            skin_multiplier REAL,
            skin_improved BOOLEAN
        )
    ''')
    conn.commit()
    conn.close()
    logger.info("Database initialized")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.message.from_user
    user_id = user.id
    first_name = user.first_name

    logger.info(f"Received /start command from user: {user_id}")

    conn = sqlite3.connect('game.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE user_id=?', (user_id,))
    user_data = cursor.fetchone()

    if not user_data:
        logger.info(f"No user found with id: {user_id}, creating new user")
        cursor.execute('''
            INSERT INTO users (user_id, coins, energy, max_energy, level, tap_profit, bonus_points, chance_multiplier, skin_multiplier, skin_improved)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, 10, 6000, 6000, 1, 50, 0, 1.0, 1.0, False))
        conn.commit()
        logger.info(f"User {user_id} created")

    conn.close()

    profile_photos = await context.bot.get_user_profile_photos(user_id)
    avatar_url = None
    if profile_photos.total_count > 0:
        avatar_file = profile_photos.photos[0][-1] 
        file_info = await context.bot.get_file(avatar_file.file_id)
        avatar_url = file_info.file_path 
        logger.info(f"Avatar file info: {file_info.file_path}")
    else:
        logger.info(f"No profile photos found for user {user_id}")

    # Генерация URL с ID пользователя
    web_app = WebAppInfo(url=f"https://vps-artem.ru/?user_id={user_id}&first_name={first_name}&avatar_url={avatar_url}&tgWebApp=true")
    logger.info(f"Generated WebApp URL for user {user_id}: {web_app.url}")

    keyboard = [
        [InlineKeyboardButton("Открыть тапалку", web_app=web_app)]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text('Открыть тапалку:', reply_markup=reply_markup)
    logger.info(f"Sent reply to user {user_id}")

def main():
    init_db()
    application = Application.builder().token("*****************************************************").build()
    application.add_handler(CommandHandler("start", start))

    logger.info("Starting bot")
    application.run_polling()

if __name__ == '__main__':
    main()
