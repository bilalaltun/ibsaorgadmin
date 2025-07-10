exports.up = function (knex) {
  return knex.schema

    // Pages
    .createTable("Pagess", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.boolean("isactive").notNullable().defaultTo(true);
      table.timestamps(true, true); // created_at, updated_at
    })

    // PageCategories
    .createTable("PageCategories", function (table) {
      table.increments("id").primary();
      table.integer("page_id").unsigned().references("id").inTable("Pagess").onDelete("CASCADE");
      table.string("title").notNullable();
      table.timestamps(true, true);
    })

    // PageFiles
    .createTable("PageFiles", function (table) {
      table.increments("id").primary();
      table.integer("category_id").unsigned().references("id").inTable("PageCategories").onDelete("CASCADE");
      table.string("title").notNullable();
      table.string("fileurl").notNullable();
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("PageFiles")
    .dropTableIfExists("PageCategories")
    .dropTableIfExists("Pagess");
};
