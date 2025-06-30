exports.up = function (knex) {
  return knex.schema.table("Countries", function (table) {
    table.dropColumn("continent");

    table
      .integer("region_id")
      .unsigned()
      .references("id")
      .inTable("Regions")
      .onDelete("SET NULL");
  });
};

exports.down = function (knex) {
  return knex.schema.table("Countries", function (table) {
    table.dropColumn("region_id");

    table.string("continent");
  });
};
