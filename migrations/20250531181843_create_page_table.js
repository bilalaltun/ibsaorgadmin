exports.up = function (knex) {
  return knex.schema

    .createTable("Pages", function (table) {
      table.increments("id").primary();
      table.integer("menu_id").unsigned().nullable();     
      table.integer("submenu_id").unsigned().nullable(); 
      table.string("link").notNullable();
      table.boolean("isactive").notNullable().defaultTo(true);

      table.string("meta_title").nullable();
      table.string("page_title").notNullable();
      table.string("meta_keywords").nullable();
      table.string("meta_description").nullable();
      table.text("content").nullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("Pages");
};
