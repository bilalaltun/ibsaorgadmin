exports.up = function (knex) {
  return knex.schema
    .createTable("Products", function (table) {
      table.increments("id").primary();
      table.string("project_name").notNullable();
      table.string("category_name").notNullable();
      table.text("description_text").notNullable();
      table.boolean("isactive").notNullable().defaultTo(true);
    })
    .then(() => {
      return knex.schema.createTable("ProductImages", function (table) {
        table.increments("id").primary();
        table.integer("product_id").unsigned().notNullable()
          .references("id").inTable("Products").onDelete("CASCADE");
        table.string("url").notNullable();
      });
    })
    .then(() => {
      return knex.schema.createTable("ProductTabs", function (table) {
        table.increments("id").primary();
        table.integer("product_id").unsigned().notNullable()
          .references("id").inTable("Products").onDelete("CASCADE");
        table.text("title").notNullable();
        table.text("content").notNullable();
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("ProductTabs")
    .then(() => knex.schema.dropTableIfExists("ProductImages"))
    .then(() => knex.schema.dropTableIfExists("Products"));
};
