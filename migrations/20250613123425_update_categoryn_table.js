exports.up = function (knex) {
  return knex.schema.createTable("Subcategories", function (table) {
    table.increments("id").primary();
    table.integer("category_id")
         .unsigned()
         .references("id")
         .inTable("Categories")
         .onDelete("CASCADE")
         .notNullable();
    table.text("title").notNullable();
    table.text("file_url").nullable(); // Optional 
    table.boolean("isactive").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("Subcategories");
};
