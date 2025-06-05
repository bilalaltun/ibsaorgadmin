exports.up = function (knex) {
  return knex.schema

    .createTable("Sliders", function (table) {
      table.increments("id").primary();
      table.string("image_url").nullable();
      table.string("video_url").nullable();
      table.string("dynamic_link_title").nullable();
      table.string("dynamic_link").nullable();
      table.string("dynamic_link_alternative").nullable();
      table.integer("order").defaultTo(0);
      table.boolean("isactive").notNullable().defaultTo(true);

      table.string("title").nullable();         
      table.text("description").nullable();     
      table.text("content").nullable();         
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("Sliders");
};
