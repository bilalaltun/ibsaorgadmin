exports.up = function (knex) {
  return knex.schema

    .createTable("SiteSettings", function (table) {
      table.increments("id").primary();
      table.date("date").notNullable();

      table.string("site_address").notNullable();
      table.string("site_code").notNullable();
      table.string("google_analytics").nullable();
      table.string("whatsapp_number").nullable();

      table.string("phone").notNullable();
      table.string("email").notNullable();

      table.string("logo_img").nullable();
      table.string("instagram").nullable();
      table.string("facebook").nullable();
      table.string("twitter").nullable();
      table.string("youtube").nullable();
      table.string("linkedin").nullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("SiteSettings");
};
