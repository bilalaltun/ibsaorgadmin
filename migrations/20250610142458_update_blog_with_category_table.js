exports.up = function (knex) {
  return knex.schema.alterTable("Blogs", function (table) {
    table.integer("category_id").unsigned().references("id").inTable("Categories").onDelete("SET NULL");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("Blogs", function (table) {
    table.dropColumn("category_id");
  });
};
