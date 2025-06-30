exports.up = function (knex) {
  return knex.schema.createTable("SubcategoryFiles", function (table) {
    table.increments("id").primary();
    table.integer("subcategory_id")
         .unsigned()
         .references("id")
         .inTable("Subcategories")
         .onDelete("CASCADE")
         .notNullable();
    table.text("file_url").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("SubcategoryFiles");
};
