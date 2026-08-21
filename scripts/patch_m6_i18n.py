from pathlib import Path
import re

p = Path(r"C:\Users\bilou\Documents\work\SnoutScore\app\(app)\directory-chat.tsx")
text = p.read_text(encoding="utf-8")
if "AppChromeHeader" not in text:
    text = text.replace(
        "import { AppScreen } from '@/src/components/AppScreen';",
        "import { AppChromeHeader } from '@/src/components/AppChromeHeader';\n"
        "import { AppScreen } from '@/src/components/AppScreen';",
        1,
    )

    def repl(m):
        tag = m.group(0)
        if "edges=" not in tag:
            tag = (
                "<AppScreen edges={['bottom']}>"
                if tag == "<AppScreen>"
                else tag.replace("<AppScreen ", "<AppScreen edges={['bottom']} ", 1)
            )
        return f"{tag}\n      <AppChromeHeader />"

    text, _ = re.subn(r"<AppScreen[^>]*>", repl, text, count=1)
    p.write_text(text, encoding="utf-8")
    print("OK chat")
else:
    print("HAS chat")

i18n = Path(r"C:\Users\bilou\Documents\work\SnoutScore\src\i18n\index.ts")
t = i18n.read_text(encoding="utf-8")
reps = {
    "'directories.lead': 'Клініки, сіттери, транспорт і не лише'":
        "'directories.lead': 'Перевірені контакти навколо тварини'",
    "'directories.cat.transport': 'Транспорт'":
        "'directories.cat.transport': 'Перевізники'",
    "'directories.cat.sitters': 'Сіттери'":
        "'directories.cat.sitters': 'Петсіттери й грумери'",
    "'directories.catBody.vets': 'Клініки й практики'":
        "'directories.catBody.vets': 'Клініки й спеціалісти'",
    "'directories.catBody.breeders': 'Розплідники (мок)'":
        "'directories.catBody.breeders': 'Верифікація FCI'",
    "'directories.catBody.transport': 'Перевезення тварин'":
        "'directories.catBody.transport': 'Для кордону'",
    "'directories.catBody.sitters': 'Догляд вдома'":
        "'directories.catBody.sitters': 'Догляд, вигул'",
    "'directories.catBody.insurance': 'Поліси (UI shell)'":
        "'directories.catBody.insurance': 'Порівняння пакетів'",
    "'directories.verified': 'Верифіковано'":
        "'directories.verified': '✓ Перевірено'",
    "'directories.writePlace': 'Написати закладу'":
        "'directories.writePlace': 'Написати в чат'",
    "'directories.writeReview': 'Написати відгук'":
        "'directories.writeReview': 'Залишити відгук'",
    "'directories.reviewTitle': 'Відгук'":
        "'directories.reviewTitle': 'Відгук про заклад'",
    "'directories.submitReview': 'Зберегти відгук'":
        "'directories.submitReview': 'Опублікувати'",
    "'directories.submitReport': 'Надіслати в чергу'":
        "'directories.submitReport': 'Надіслати скаргу'",
    "'directories.reviewPlaceholder': 'Що сподобалось / ні…'":
        "'directories.reviewPlaceholder': 'Розкажіть про досвід...'",
}
for a, b in reps.items():
    if a in t:
        t = t.replace(a, b, 1)
        print("OK", a[:40])
    else:
        print("MISS", a[:40])

extra = """
  'directories.searchPlaceholder': 'Пошук за назвою або містом',
  'directories.verifiedCheck': '✓ Перевірено',
  'directories.verifiedFci': '✓ FCI',
  'directories.unverifiedShort': 'Не підтверджено',
  'directories.filterSpecialty': 'Спеціалізація',
  'directories.filterLang': 'Мова лікаря',
  'directories.filterCity': 'Місто',
  'directories.filter24h': 'Цілодобово',
  'directories.filterRoute': 'Напрямок',
  'directories.filterSpecies': 'Тип тварини',
  'directories.filterRating': 'Рейтинг',
  'directories.breedersWarn': 'Перевіряємо метрику FCI. Без бейджа — інформація не підтверджена, будьте уважні.',
  'directories.carriersWarn': 'Обирайте перевізників з підтвердженими документами. Уникайте пропозицій «вирішити питання на кордоні за гроші».',
  'directories.aboutPlace': 'Про заклад',
  'directories.reviewsCount': 'Відгуків',
  'directories.priceLevel': 'Ціни',
  'directories.docsChecked': 'Документи перевірено',
  'directories.reportProblem': 'Повідомити про проблему',
  'directories.reviewCost': 'Приблизна вартість візиту (опц.)',
  'directories.reviewCostPlaceholder': 'напр. 350 zł',
  'directories.reportReasonFalse': 'Неправдива інформація',
  'directories.reportReasonFraud': 'Шахрайство / вимагання грошей',
  'directories.reportReasonAnimal': 'Неналежне поводження з твариною',
"""
if "'directories.searchPlaceholder'" not in t:
    pos = t.find("'directories.lead'")
    t = t[:pos] + extra.strip() + "\n  " + t[pos:]
    print("INSERTED extras")

i18n.write_text(t, encoding="utf-8")
print("i18n done")
