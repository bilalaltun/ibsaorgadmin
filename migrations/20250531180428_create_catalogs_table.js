exports.up = function (knex) {
  return knex.schema.createTable("Catalogs", function (table) {
    table.increments("id").primary();
    table.string("cover_img").notNullable();
    table.boolean("isactive").notNullable().defaultTo(true);
    table.text("title").notNullable();
    table.string("file").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("Catalogs");
};
