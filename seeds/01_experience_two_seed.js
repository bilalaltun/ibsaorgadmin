/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Temizle
  await knex("HomepageExperienceTwoTranslations").del();
  await knex("HomepageExperienceTwo").del();

  // Ana kayıt oluştur
  const [experienceId] = await knex("HomepageExperienceTwo")
    .insert({ section_key: "experienceTwo" })
    .returning("id");

  // Translations ekle
  const translations = [
    {
      experience_id: experienceId.id || experienceId,
      lang_code: "tr",
      global_title: "Türkiye'den Dünyanın",
      global_subtitle: "Dört Bir Yanına",
      years_experience: "Yıllık Deneyim",
      export_countries: "Ülkeye İhracat",
      videolink: "https://example.com/video_tr"
    },
    {
      experience_id: experienceId.id || experienceId,
      lang_code: "en",
      global_title: "From Turkey to the World",
      global_subtitle: "In Every Direction",
      years_experience: "Years of Experience",
      export_countries: "Exported Countries",
      videolink: "https://example.com/video_en"
    },
    {
      experience_id: experienceId.id || experienceId,
      lang_code: "ar",
      global_title: "من تركيا إلى العالم",
      global_subtitle: "في كل الاتجاهات",
      years_experience: "سنوات الخبرة",
      export_countries: "دول التصدير",
      videolink: "https://example.com/video_ar"
    },
    {
      experience_id: experienceId.id || experienceId,
      lang_code: "ru",
      global_title: "Из Турции в Мир",
      global_subtitle: "Во все стороны света",
      years_experience: "Годы опыта",
      export_countries: "Страны экспорта",
      videolink: "https://example.com/video_ru"
    },
  ];

  await knex("HomepageExperienceTwoTranslations").insert(translations);
}
