exports.seed = async function(knex) {
  // 1. Temizle
  await knex("HomepageAboutContentTranslations").del();
  await knex("HomepageAboutContent").del();

  // 2. Ana içeriği ekle
  const inserted = await knex("HomepageAboutContent")
    .insert({ isactive: true })
    .returning("id");

  const aboutId = inserted[0]?.id || inserted[0]; // MSSQL için düzeltme

  // 3. Çevirileri ekle
  await knex("HomepageAboutContentTranslations").insert([
    {
      about_content_id: aboutId,
      lang_code: "tr",
      title: "HAKKIMIZDA",
      content: "1976'dan günümüze gelen deneyim ile..."
    },
    {
      about_content_id: aboutId,
      lang_code: "en",
      title: "ABOUT US",
      content: "With experience since 1976..."
    },
    {
      about_content_id: aboutId,
      lang_code: "ar",
      title: "معلومات عنا",
      content: "منذ عام 1976 ..."
    },
    {
      about_content_id: aboutId,
      lang_code: "ru",
      title: "О НАС",
      content: "С 1976 года..."
    },
  ]);
};
