export async function seed(knex) {
  await knex("HomepageFooterTranslations").del();
  await knex("HomepageFooterGallery").del();
  await knex("HomepageFooterSection").del();

  const [{ id }] = await knex("HomepageFooterSection").insert({ section_key: "footer" }).returning("id");

  const translations = [
    {
      lang_code: "tr",
      contact_title: "İletişime Geçin",
      email: "info@example.com",
      logo_slogan: "Türkiye'den Dünyanın Dört Bir Yanına",
      address_title: "Adres bilgisi bulunamadı",
      address_link: "https://maps.example.com/tr",
      phone: "+90 000 000 00 00",
    },
    {
      lang_code: "en",
      contact_title: "Get in Touch",
      email: "info@example.com",
      logo_slogan: "From Turkey to the World",
      address_title: "No address found",
      address_link: "https://maps.example.com/en",
      phone: "+90 000 000 00 00",
    },
    {
      lang_code: "ar",
      contact_title: "تواصل معنا",
      email: "info@example.com",
      logo_slogan: "من تركيا إلى العالم",
      address_title: "لا يوجد عنوان",
      address_link: "https://maps.example.com/ar",
      phone: "+90 000 000 00 00",
    },
    {
      lang_code: "ru",
      contact_title: "Связаться с нами",
      email: "info@example.com",
      logo_slogan: "Из Турции в Мир",
      address_title: "Адрес не найден",
      address_link: "https://maps.example.com/ru",
      phone: "+90 000 000 00 00",
    },
  ];

  for (const t of translations) {
    await knex("HomepageFooterTranslations").insert({ ...t, footer_id: id });
  }

  const galleryImages = [
    "/uploads/footer/1.jpg",
    "/uploads/footer/2.png",
    "/uploads/footer/3.jpg",
    "/uploads/footer/4.jpg",
  ];

  for (const img of galleryImages) {
    await knex("HomepageFooterGallery").insert({
      footer_id: id,
      image_url: img,
    });
  }
}
