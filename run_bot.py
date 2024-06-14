import asyncio
from bot import main as telegram_main

if __name__ == "__main__":
    print("Starting bot...")  # Debug message
    with open("bot.log", "a") as log_file:
        log_file.write("Starting bot...\n")  # Log message
    asyncio.run(telegram_main())
