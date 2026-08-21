from pathlib import Path

ROOT = Path(r"C:\Users\bilou\Documents\work\SnoutScore")

STUBS = {
    "spotlight-admin.tsx": ("admin.spotlight", "admin.spotlightBody", [
        ("Літо з хвостиком 2026", "активний"),
        ("Осінній лапоть", "чернетка"),
    ]),
    "blog-admin.tsx": ("admin.blog", "admin.stubBody", [
        ("Харчування · 4 статті", "опубліковано"),
        ("Подорожі · чернетка", "draft"),
    ]),
    "products-admin.tsx": ("admin.products", "admin.stubBody", [
        ("Корм · каталог seed", "stub"),
        ("Ласощі · очікує імпорт", "stub"),
    ]),
    "quiz-bank.tsx": ("admin.quizBank", "admin.stubBody", [
        ("Wikidata origin · 120", "готово"),
        ("Zoom · новий формат", "чернетка"),
    ]),
    "monetization.tsx": ("admin.monetization", "admin.stubBody", [
        ("KnowSnout Plus", "Free / Plus"),
        ("AI-скани ліміт", "мок"),
    ]),
    "team.tsx": ("admin.team", "admin.teamBody", [
        ("Марта К.", "content · owner"),
        ("Олег Т.", "moderator"),
    ]),
}

template = """import {{ ScrollView, StyleSheet, Text, View }} from 'react-native';

import {{ AppChromeHeader }} from '@/src/components/AppChromeHeader';
import {{ AppScreen }} from '@/src/components/AppScreen';
import {{ ScrHeader }} from '@/src/components/ScrHeader';
import {{ t }} from '@/src/i18n';
import {{ brand, fonts }} from '@/src/theme/brand';

const ROWS = {rows};

/** HTML kit · Admin stub screen. */
export default function AdminStubScreen() {{
  return (
    <AppScreen edges={{['bottom', 'top']}}>
      <AppChromeHeader />
      <ScrHeader title={{t('{titleKey}')}} titleSize={{20}} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{styles.pad}}>
          <Text style={{styles.lead}}>{{t('{bodyKey}')}}</Text>
          {{ROWS.map((row) => (
            <View key={{row.title}} style={{styles.card}}>
              <Text style={{styles.title}}>{{row.title}}</Text>
              <Text style={{styles.meta}}>{{row.meta}}</Text>
            </View>
          ))}}
          <Text style={{styles.hint}}>{{t('admin.stubHint')}}</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}}

const styles = StyleSheet.create({{
  pad: {{
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 10,
  }},
  lead: {{
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  }},
  card: {{
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  }},
  title: {{
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  }},
  meta: {{
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  }},
  hint: {{
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  }},
}});
"""

for name, (titleKey, bodyKey, rows) in STUBS.items():
    rows_lit = (
        "[\n"
        + ",\n".join(
            f"  {{ title: {title!r}, meta: {meta!r} }}" for title, meta in rows
        )
        + "\n]"
    )
    # Fix quotes for TS - use single quotes in output
    rows_ts = "[\n" + ",\n".join(
        f"  {{ title: '{title}', meta: '{meta}' }}" for title, meta in rows
    ) + "\n]"
    content = template.format(
        rows=rows_ts, titleKey=titleKey, bodyKey=bodyKey
    )
    (ROOT / "app" / "(admin)" / name).write_text(content, encoding="utf-8")
    print("OK", name)

# i18n
p = ROOT / "src" / "i18n" / "index.ts"
t = p.read_text(encoding="utf-8")
reps = {
    "'admin.title': 'Адмінка'": "'admin.title': 'KnowSnout Admin'",
    "'admin.subtitle': 'Mock web shell'": "'admin.subtitle': 'Дашборд модерації й контенту'",
    "'admin.cms': 'CMS правил'": "'admin.cms': 'Контент-CMS'",
    "'admin.moderationBody': 'Єдина черга place / post / rule'":
        "'admin.moderationBody': 'Єдина черга закладів, постів і скарг'",
    "'admin.approve': 'Схвалити'": "'admin.approve': 'Підтвердити'",
    "'admin.approved': 'Схвалено локально'": "'admin.approved': 'Підтверджено локально'",
}
for a, b in reps.items():
    if a in t:
        t = t.replace(a, b, 1)
        print("i18n", a[:36])

extra = """
  'admin.managerLine': 'Content-менеджер: Марта К.',
  'admin.sections': 'Розділи',
  'admin.recentActions': 'Останні дії модерації',
  'admin.statQueue': 'У черзі модерації',
  'admin.statComplaints': 'Скарги на розгляді',
  'admin.statVerified': 'Заклади «Перевірено»',
  'admin.statRules': 'Правила потребують ревʼю',
  'admin.queueCount': '{count} записів',
  'admin.filterAll': 'Усі',
  'admin.filterPlaces': 'Заклади F',
  'admin.filterPosts': 'Пости/форум',
  'admin.filterContent': 'Контент',
  'admin.filterComplaints': 'Скарги',
  'admin.typePlace': 'Новий заклад',
  'admin.typePost': 'Скарга / пост',
  'admin.typeRule': 'Контент ревʼю',
  'admin.typeComplaint': 'Скарга',
  'admin.review': 'Розглянути',
  'admin.minsAgo': '{n} хв тому',
  'admin.hoursAgo': '{n} год тому',
  'admin.yesterday': 'Учора',
  'admin.source': 'Джерело',
  'admin.statusLabel': 'Статус',
  'admin.checklistTitle': 'Чек-лист перед підтвердженням',
  'admin.checklistBody': '☑ сайт активний · ☑ телефон відповідає · ☐ підтверджено дзвінком',
  'admin.approveVerified': '✓ Підтвердити («Перевірено»)',
  'admin.publishNoBadge': 'Опублікувати без бейджа',
  'admin.spotlightBody': 'Конкурси Spotlight',
  'admin.teamBody': 'Ролі й доступи',
  'admin.cmsLastReview': 'Останнє ревʼю',
  'admin.cmsStatus.published': 'Опубліковано',
  'admin.cmsStatus.review': 'Потребує ревʼю',
  'admin.cmsStatus.draft': 'Чернетка',
"""
if "'admin.managerLine'" not in t:
    pos = t.find("'admin.title'")
    t = t[:pos] + extra.strip() + "\n  " + t[pos:]
    print("INSERTED admin keys")

p.write_text(t, encoding="utf-8")
print("done")
