"""Localized UI strings for the store mock-ups, mirroring src/i18n.ts.

Kept in sync with the game so screenshots show exactly what players see.
"""

LANGS = ("ru", "en", "tr")


def _ru_plural(n, one, few, many):
    m10, m100 = n % 10, n % 100
    if m10 == 1 and m100 != 11:
        return one
    if 2 <= m10 <= 4 and not (10 <= m100 < 20):
        return few
    return many


STRINGS = {
    "en": {
        "heading": "Count The Stars",
        "intro": "Count the stars by clicking them as they appear in the sky. "
                 "Try to count as many of them as you can.",
        "start": "Start",
        "retry": "Retry",
        "countedStars": "Counted stars:",
        "mistakesLeft": "Mistakes left:",
        "end_score": lambda n: f"You have counted {n} {'star' if n == 1 else 'stars'}",
        "best": lambda n: f"Best: {n}",
        "newRecord": "New record!",
        "slogan": "A calm game of counting stars",
    },
    "ru": {
        "heading": "Count The Stars",
        "intro": "Считайте звёзды, кликая по ним, когда они появляются в небе. "
                 "Постарайтесь насчитать как можно больше.",
        "start": "Начать",
        "retry": "Заново",
        "countedStars": "Сосчитано звёзд:",
        "mistakesLeft": "Осталось ошибок:",
        "end_score": lambda n: f"Вы насчитали {n} {_ru_plural(n, 'звезду', 'звезды', 'звёзд')}",
        "best": lambda n: f"Рекорд: {n}",
        "newRecord": "Новый рекорд!",
        "slogan": "Сколько звёзд ты насчитаешь?",
    },
    "tr": {
        "heading": "Count The Stars",
        "intro": "Gökyüzünde belirdikçe yıldızlara tıklayarak onları sayın. "
                 "Olabildiğince çoğunu saymaya çalışın.",
        "start": "Başla",
        "retry": "Tekrar",
        "countedStars": "Sayılan yıldız:",
        "mistakesLeft": "Kalan hata:",
        "end_score": lambda n: f"{n} yıldız saydınız",
        "best": lambda n: f"Rekor: {n}",
        "newRecord": "Yeni rekor!",
        "slogan": "Yıldızları say, sakince",
    },
}
