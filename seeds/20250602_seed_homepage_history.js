exports.seed = async function (knex) {
  // Önce mevcut verileri temizle
  await knex("HomepageHistoryItems").del();
  await knex("HomepageHistoryTranslations").del();
  await knex("HomepageHistorySection").del();

  // Ana bölüm oluştur
  const [sectionId] = await knex("HomepageHistorySection")
    .insert({ section_key: "history" })
    .returning("id");

  const translations = [
    {
      lang_code: "tr",
      top_title: "HİKAYEMİZ",
      main_title: "Şirket Tarihçesi",
    },
    {
      lang_code: "en",
      top_title: "OUR STORY",
      main_title: "Company History",
    },
    {
      lang_code: "ru",
      top_title: "НАША ИСТОРИЯ",
      main_title: "История компании",
    },
    {
      lang_code: "ar",
      top_title: "قصتنا",
      main_title: "تاريخ الشركة",
    },
  ];

  const items = {
    tr: [
      {
        item_index: 1,
        title: "Bursa Organize Sanayi Üretim Tesisi",
        history:
          "20.000 m² kapalı alanda üretim ve hizmet veren tesisimizde, değişen tüketici davranışlarının getirdiği yüksek rekabet koşullarını karşılayabilmek amacı ile toplam kalite uygulama ve çalışmalarını büyük bir titizlikle hayata geçiren firmamız, sürekli kalite politikasından taviz vermeden üretimine belirlediği üstün standartlar doğrultusunda devam etmektedir.",
        image_url: "/images/history/tr-tesis.jpg",
      },
    ],
    en: [
      {
        item_index: 1,
        title: "Bursa Organized Industrial Zone Production Facility",
        history:
          "With a closed area of 20,000 m², our facility delivers production and services by implementing total quality practices with great precision to meet the high competition brought by changing consumer behavior.",
        image_url: "/images/history/en-factory.jpg",
      },
    ],
    ru: [
      {
        item_index: 1,
        title: "Производственный объект в промышленной зоне Бурсы",
        history:
          "Наше предприятие площадью 20 000 м² ведет производство и оказывает услуги, строго соблюдая политику качества и адаптируясь к высоким требованиям конкуренции.",
        image_url: "/images/history/ru-zavod.jpg",
      },
    ],
    ar: [
      {
        item_index: 1,
        title: "منشأة الإنتاج في منطقة بورصة الصناعية",
        history:
          "في منشأتنا التي تبلغ مساحتها 20.000 متر مربع، نقوم بالإنتاج وتقديم الخدمات وفقًا لمعايير الجودة العالية لمواجهة ظروف المنافسة الشديدة الناتجة عن تغير سلوك المستهلك.",
        image_url: "/images/history/ar-factory.jpg",
      },
    ],
  };

  // Translations ekle
  for (const t of translations) {
    await knex("HomepageHistoryTranslations").insert({
      section_id: sectionId.id || sectionId, // PostgreSQL veya SQLite uyumu için
      lang_code: t.lang_code,
      top_title: t.top_title,
      main_title: t.main_title,
    });
  }

  // Items ekle
  for (const lang of Object.keys(items)) {
    for (const item of items[lang]) {
      await knex("HomepageHistoryItems").insert({
        section_id: sectionId.id || sectionId,
        lang_code: lang,
        item_index: item.item_index,
        title: item.title,
        history: item.history,
        image_url: item.image_url,
      });
    }
  }
};
