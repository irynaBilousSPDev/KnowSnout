from pathlib import Path

p = Path(r"C:\Users\bilou\Documents\work\SnoutScore\src\i18n\index.ts")
t = p.read_text(encoding="utf-8")

replacements = {
    "'me.title': 'Мої дані'": "'me.title': 'Мій акаунт'",
    "'help.title': 'Допомога'": "'help.title': 'Довідка'",
    "'settings.title': 'Налаштування'": "'settings.title': 'Мова та підписка'",
    "'subscription.plan.plus': 'Plus'": "'subscription.plan.plus': 'KnowSnout Plus'",
    "'subscription.mockSubscribe': 'Mock subscribe'": "'subscription.mockSubscribe': 'Оформити Plus'",
    "'editAccount.title': 'Редагувати акаунт'": "'editAccount.title': 'Редагувати'",
}

for a, b in replacements.items():
    if a in t:
        t = t.replace(a, b, 1)
        print("OK", a)
    else:
        print("MISS", a)

insert_block = """
  'settings.langAndPlan': 'Мова та підписка',
  'settings.langPlanMeta': 'UA · Free',
  'settings.soon': 'Скоро',
  'settings.languageUi': 'Мова інтерфейсу',
  'notifications.toggleVaccines': 'Нагадування про щеплення',
  'notifications.toggleCare': 'Нагадування про гру/догляд',
  'notifications.toggleQuiz': 'Серія квізів',
  'notifications.toggleFeed': 'Активність у стрічці',
  'privacy.titleAndData': 'Приватність і дані',
  'privacy.policy': 'Політика приватності',
  'privacy.downloadData': 'Завантажити мої дані',
  'privacy.downloadSoon': 'Експорт даних з’явиться пізніше.',
  'help.titleAndSupport': 'Довідка і підтримка',
  'subscription.plusPitch': 'Необмежені AI-скани, улюбленці й нагадування',
  'subscription.getPlus': 'Оформити Plus',
  'subscription.currentPlan': 'Поточний план',
"""

if "'settings.langAndPlan'" not in t:
    pos = t.find("'settings.title'")
    t = t[:pos] + insert_block.strip() + "\n  " + t[pos:]
    print("INSERTED keys")

p.write_text(t, encoding="utf-8")
print("done")
