from pathlib import Path

p = Path(r"C:\Users\bilou\Documents\work\SnoutScore\src\i18n\index.ts")
t = p.read_text(encoding="utf-8")

replacements = {
    "'quizHub.title': 'Квіз'": "'quizHub.title': 'Квізи'",
    "'quizHub.breedTitle': 'Вгадай породу'": "'quizHub.breedTitle': 'Вгадай породу за фото'",
    "'quizHub.originTitle': 'Звідки порода?'": "'quizHub.originTitle': 'Звідки ця порода?'",
    "'quizHub.groupTitle': 'Група тварин'": "'quizHub.groupTitle': 'Яка це група тварин?'",
    "'quizStreak.dailyTitle': 'Квіз дня'": "'quizStreak.dailyTitle': 'Виклик дня'",
    "'quizStreak.playDaily': 'Грати квіз дня'": "'quizStreak.playDaily': 'Грати виклик дня'",
}
for a, b in replacements.items():
    if a in t:
        t = t.replace(a, b, 1)
        print("OK", a)
    else:
        print("MISS", a)

if "'quizHub.chipDaily'" not in t:
    pos = t.find("'quizStreak.dailyTitle'")
    insert = (
        "  'quizHub.chipDaily': 'Виклик дня',\n"
        "  'quizHub.chipNew': 'Новий формат',\n"
        "  'quizHub.chipQuestions': '12 питань',\n"
        "  'quizHub.chipBreedQs': '15 питань',\n"
        "  'quizHub.friendsTop': 'Топ тижня серед друзів',\n"
        "  'quizHub.friendsTopHint': 'Ти — у рейтингу · відкрий таблицю XP',\n"
        "  'quizStreak.daysInARow': '{count} днів поспіль',\n"
        "  'quizStreak.toRecord': 'До рекорду ({record}) — {left} днів',\n"
        "  'quizStreak.xpLine': 'Рівень {level} · {xp}/{next} XP',\n\n"
    )
    t = t[:pos] + insert + t[pos:]
    print("INSERTED chips")

old_note = (
    "'quizHub.wikidataNote':\n"
    "    'Повний список джерел і ліцензій — у «Мої дані» → «Джерела даних».'"
)
new_note = (
    "'quizHub.wikidataNote':\n"
    "    'Питання генеруються з Wikidata + відкритих джерел про породи'"
)
if old_note in t:
    t = t.replace(old_note, new_note)
    print("OK wiki note")

p.write_text(t, encoding="utf-8")
print("done")
