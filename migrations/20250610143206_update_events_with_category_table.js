exports.up = function (knex) {
  return knex.schema.alterTable("Events", function (table) {
    table
      .integer("category_id")
      .unsigned()
      .references("id")
      .inTable("Categories")
      .onDelete("SET NULL");

    table.dropColumn("category");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("Events", function (table) {
    table.dropColumn("category_id");

    table.string("category", 100).notNullable();
  });
};
