export async function seed(knex) {
  await knex("HomepageVideoItems").del();
  await knex("HomepageVideoTranslations").del();
  await knex("HomepageVideoSection").del();

  await knex("HomepageVideoSection").insert({ section_key: "video" });

  const section = await knex("HomepageVideoSection").where({ section_key: "video" }).first();
  const id = section.id;

  const langs = [
    {
      lang_code: "tr",
      title: "1976’dan günümüze daima en iyisi",
      youtube_link: "https://www.youtube.com/watch?v=abc123",
      items: [
        { before: "Panel", text: "Ebatlama" },
        { before: "Kenar", text: "Bantlama" },
        { before: "ÇİZİCİLİ", text: "Yatar DAİRE" },
        { before: "Kapı ÜRETİM", text: "MAKİNELERİ" },
        { before: "CNC", text: "Freze" },
        { before: "Ahşap", text: "İŞLEME" },
      ],
    },
    {
      lang_code: "en",
      title: "Always the best since 1976",
      youtube_link: "https://www.youtube.com/watch?v=abc123",
      items: [
        { before: "Panel", text: "Sizing" },
        { before: "Edge", text: "Banding" },
        { before: "Scoring", text: "Circular Saw" },
        { before: "Door", text: "Production Machines" },
        { before: "CNC", text: "Router" },
        { before: "Wood", text: "Processing" },
      ],
    },
    {
      lang_code: "ar",
      title: "الأفضل دائمًا منذ عام 1976",
      youtube_link: "https://www.youtube.com/watch?v=abc123",
      items: [
        { before: "لوحة", text: "تقطيع" },
        { before: "حافة", text: "تلبيس" },
        { before: "شريط", text: "منشار دائري" },
        { before: "إنتاج", text: "أبواب" },
        { before: "CNC", text: "فريزة" },
        { before: "خشب", text: "معالجة" },
      ],
    },
    {
      lang_code: "ru",
      title: "Всегда лучшее с 1976 года",
      youtube_link: "https://www.youtube.com/watch?v=abc123",
      items: [
        { before: "Панель", text: "Распиловка" },
        { before: "Край", text: "Кромкооблицовка" },
        { before: "Разметка", text: "Циркулярная пила" },
        { before: "Производство", text: "Дверей" },
        { before: "CNC", text: "Фрезерование" },
        { before: "Дерево", text: "Обработка" },
      ],
    },
  ];

  for (const lang of langs) {
    await knex("HomepageVideoTranslations").insert({
      video_id: id,
      lang_code: lang.lang_code,
      title: lang.title,
      youtube_link: lang.youtube_link,
    });

    for (const item of lang.items) {
      await knex("HomepageVideoItems").insert({
        video_id: id,
        lang_code: lang.lang_code,
        before: item.before,
        text: item.text,
      });
    }
  }
}
