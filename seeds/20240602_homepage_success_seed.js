exports.seed = async function(knex) {
  // Temizle
  await knex('HomepageSuccessTranslations').del();
  await knex('HomepageSuccessSection').del();

  // Ana bölüm oluştur
  const [sectionId] = await knex('HomepageSuccessSection')
    .insert({ section_key: 'success' })
    .returning('id');

  const translations = [
    {
      lang_code: 'tr',
      slider_title: "1976'dan Bugüne Başarı Hikayeleri",
      main_title: "Her Üretimde Kalite, Her Projede Güven",
      description: "Mızrak Makina olarak, Bursa’daki üç farklı tesiste yüksek standartlarda üretim gerçekleştiriyoruz. Kalite, teknoloji ve müşteri memnuniyetini merkezimize alarak, sektörde güven veren projelere imza atıyoruz."
    },
    {
      lang_code: 'en',
      slider_title: "Success Stories Since 1976",
      main_title: "Quality in Every Production, Trust in Every Project",
      description: "At Mızrak Makina, we carry out production at high standards in three different facilities in Bursa. We focus on quality, technology, and customer satisfaction to deliver reliable projects in the sector."
    },
    {
      lang_code: 'ru',
      slider_title: "Истории успеха с 1976 года",
      main_title: "Качество в каждом производстве, доверие в каждом проекте",
      description: "Компания Mızрак Makina осуществляет производство на трех различных объектах в Бурсе, соответствующих высоким стандартам. Мы ориентируемся на качество, технологии и удовлетворенность клиентов."
    },
    {
      lang_code: 'ar',
      slider_title: "قصص نجاح منذ عام 1976",
      main_title: "الجودة في كل إنتاج، الثقة في كل مشروع",
      description: "نقوم في شركة Mızrak Makina بالإنتاج بمعايير عالية في ثلاث منشآت مختلفة في بورصة، مع التركيز على الجودة والتكنولوجيا ورضا العملاء."
    }
  ];

  const items = [
    {
      lang_code: 'tr',
      items: [
        {
          slider_index: 1,
          title: "AR-GE Laboratuvarı Kurulumu",
          description: "Yeni AR-GE laboratuvarı ile inovasyon ve prototip geliştirme faaliyetleri güçlendirildi.",
          image_url: "/images/success/ar-ge.png"
        },
        {
          slider_index: 2,
          title: "Yeni Üretim Tesisi Açılışı",
          description: "2023 yılında devreye alınan 3. üretim tesisi ile üretim kapasitesi %60 artırıldı.",
          image_url: "/images/success/tesis.png"
        }
      ]
    },
    {
      lang_code: 'en',
      items: [
        {
          slider_index: 1,
          title: "Establishment of R&D Laboratory",
          description: "The new R&D lab strengthened innovation and prototype development activities.",
          image_url: "/images/success/ar-ge.png"
        },
        {
          slider_index: 2,
          title: "New Production Facility Opened",
          description: "With the new facility launched in 2023, production capacity increased by 60%.",
          image_url: "/images/success/tesis.png"
        }
      ]
    },
    {
      lang_code: 'ru',
      items: [
        {
          slider_index: 1,
          title: "Создание лаборатории НИОКР",
          description: "Новая лаборатория НИОКР укрепила инновации и разработку прототипов.",
          image_url: "/images/success/ar-ge.png"
        },
        {
          slider_index: 2,
          title: "Открытие нового производственного объекта",
          description: "Запуск третьего производственного объекта в 2023 году увеличил производственные мощности на 60%.",
          image_url: "/images/success/tesis.png"
        }
      ]
    },
    {
      lang_code: 'ar',
      items: [
        {
          slider_index: 1,
          title: "إنشاء مختبر البحث والتطوير",
          description: "عزز المختبر الجديد الابتكار وأنشطة تطوير النماذج الأولية.",
          image_url: "/images/success/ar-ge.png"
        },
        {
          slider_index: 2,
          title: "افتتاح منشأة إنتاج جديدة",
          description: "تم زيادة الطاقة الإنتاجية بنسبة 60٪ بعد تشغيل المنشأة الثالثة في عام 2023.",
          image_url: "/images/success/tesis.png"
        }
      ]
    }
  ];

  // Çeviriler
  for (const t of translations) {
    await knex('HomepageSuccessTranslations').insert({
      section_id: sectionId.id || sectionId,
      lang_code: t.lang_code,
      slider_title: t.slider_title,
      main_title: t.main_title,
      description: t.description
    });
  }

  // Sliderlar
  for (const langGroup of items) {
    for (const item of langGroup.items) {
      await knex('HomepageSuccessItems').insert({
        section_id: sectionId.id || sectionId,
        lang_code: langGroup.lang_code,
        slider_index: item.slider_index,
        title: item.title,
        description: item.description,
        image_url: item.image_url
      });
    }
  }
};
