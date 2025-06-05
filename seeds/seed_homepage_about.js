exports.seed = async function (knex) {
  // Veritabanını temizle
  await knex("HomepageAboutTranslations").del();
  await knex("HomepageAboutSection").del();

  // Ana kayıt
  const inserted = await knex("HomepageAboutSection")
    .insert({ section_key: "about" })
    .returning("id");

  const aboutId = Array.isArray(inserted)
    ? inserted[0].id || inserted[0]
    : inserted;

  // Çok dilli çeviriler
  const translations = [
    {
      lang_code: "tr",
      name: "HAKKIMIZDA",
      title: "1976'dan Günümüze Daima En İyisi",
      description:
        "1976 yılında planya imalatı ile makine sektörüne adım atan firmamız Mızrak Makine, ilerleyen süreçte ülkemizin en büyük organize sanayi bölgelerinden biri olan Bursa Organize Sanayi Bölgesi’ndeki fabrikasında faaliyetlerini sürdürmektedir"
    },
    {
      lang_code: "en",
      name: "ABOUT US",
      title: "Always the Best Since 1976",
      description:
        "Founded in 1976 with woodworking production, Mızrak Makine continues its operations today in its factory located in Bursa Organized Industrial Zone — one of Turkey’s largest industrial hubs."
    },
    {
      lang_code: "ar",
      name: "معلومات عنا",
      title: "الأفضل دائمًا منذ عام 1976",
      description:
        "تأسست شركة ميزراك ماكينة في عام 1976 بصناعة ماكينات النشر، وتواصل عملياتها في مصنعها داخل المنطقة الصناعية المنظمة ببورصة، إحدى أكبر المناطق الصناعية في تركيا."
    },
    {
      lang_code: "ru",
      name: "О НАС",
      title: "Всегда лучшие с 1976 года",
      description:
        "Компания Mızrak Makine, начавшая свою деятельность с производства деревообрабатывающих станков в 1976 году, продолжает свою работу на заводе в одной из крупнейших промышленных зон Турции — в Организованной промышленной зоне Бурсы."
    }
  ];

  for (const t of translations) {
    await knex("HomepageAboutTranslations").insert({
      about_id: aboutId,
      lang_code: t.lang_code,
      name: t.name,
      title: t.title,
      description: t.description
    });
  }
};
