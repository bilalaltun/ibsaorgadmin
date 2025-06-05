exports.seed = async function (knex) {
  // Mevcut verileri temizle
  await knex("HomepageFacilitiesItems").del();
  await knex("HomepageFacilitiesTranslations").del();
  await knex("HomepageFacilitiesSection").del();

  // Ana section oluştur
  const [sectionId] = await knex("HomepageFacilitiesSection")
    .insert({ section_key: "facilities" })
    .returning("id");

  const translations = [
    {
      lang_code: "tr",
      title: "1976'DAN BERİ  GELECEĞİ ÜRETİYORUZ",
      subtitle:
        "Kesintisiz  Güvenilir <br><span class=\"primary-color text-decoration-underline\">Teknoloji</span>  <span class=\"new-color\">Üretim</span>",
      button: "Daha Fazlasını <br /> Keşfedin",
      button_link: "/hakkimizda",
      image: "facilities_tr.jpg",
    },
    {
      lang_code: "en",
      title: "WE HAVE BEEN PRODUCING THE FUTURE SINCE 1976",
      subtitle:
        "Seamless Reliable <br><span class=\"primary-color text-decoration-underline\">Technology</span>  <span class=\"new-color\">Production</span>",
      button: "Discover <br /> More",
      button_link: "/about",
      image: "facilities_en.jpg",
    },
    {
      lang_code: "ar",
      title: "ننتج المستقبل منذ عام 1976",
      subtitle:
        "إنتاج <span class=\"new-color\">موثوق به</span> <br><span class=\"primary-color text-decoration-underline\">وتكنولوجيا</span> بدون انقطاع",
      button: "اكتشف <br /> المزيد",
      button_link: "/about",
      image: "facilities_ar.jpg",
    },
    {
      lang_code: "ru",
      title: "МЫ СОЗДАЁМ БУДУЩЕЕ С 1976 ГОДА",
      subtitle:
        "Непрерывное Надежное <br><span class=\"primary-color text-decoration-underline\">Технологии</span> <span class=\"new-color\">Производство</span>",
      button: "Узнать <br /> больше",
      button_link: "/o-nas",
      image: "facilities_ru.jpg",
    },
  ];

  await knex("HomepageFacilitiesTranslations").insert(
    translations.map((t) => ({
      facilities_id: sectionId.id || sectionId,
      lang_code: t.lang_code,
      title: t.title,
      subtitle: t.subtitle,
      button: t.button,
      button_link: t.button_link,
      image: t.image,
    }))
  );

  const items = [
    {
      lang_code: "tr",
      title: "Bursa Organize Sanayi Tesisi",
      description:
        "20.000 m² kapalı alanda üretim ve hizmet veren tesisimizde, değişen tüketici davranışlarının getirdiği yüksek rekabet koşullarını karşılayabilmek amacıyla toplam kalite uygulamalarını büyük bir titizlikle hayata geçiren firmamız, üretimine üstün standartlar doğrultusunda devam etmektedir.",
    },
    {
      lang_code: "tr",
      title: "Kayapa Organize Sanayi Tesisi",
      description:
        "3.750 m² kapalı alanda ebatlama makinesi üretimi ve hizmet veren tesisimizde, firmamız sürekli kalite politikasından taviz vermeden üretimine belirlediği üstün standartlar doğrultusunda devam etmektedir.",
    },
    {
      lang_code: "tr",
      title: "Küçük Balıklı Üretim Tesisi",
      description:
        "1.800 m² kapalı alanda talaşlı imalat üretimi ve hizmet veren tesisimizde, firmamız üretimine kalite politikasından ödün vermeden devam etmekte ve yüksek standartları korumaktadır.",
    },

    // ENGLISH versions
    {
      lang_code: "en",
      title: "Bursa Organized Industrial Facility",
      description:
        "With 20,000 m² of closed area, our facility implements total quality practices to meet the high competition brought by changing consumer behavior, and continues its production with high standards.",
    },
    {
      lang_code: "en",
      title: "Kayapa Organized Industrial Facility",
      description:
        "With 3,750 m² closed production area, our plant continues production with superior standards without compromising our continuous quality policy.",
    },
    {
      lang_code: "en",
      title: "Küçük Balıklı Production Facility",
      description:
        "Operating in a 1,800 m² closed area with chip manufacturing, our company maintains production without compromising quality policies and upholds high standards.",
    },

    // Arabic and Russian items can be added similarly...
  ];

  await knex("HomepageFacilitiesItems").insert(
    items.map((i) => ({
      facilities_id: sectionId.id || sectionId,
      lang_code: i.lang_code,
      title: i.title,
      description: i.description,
    }))
  );
};
