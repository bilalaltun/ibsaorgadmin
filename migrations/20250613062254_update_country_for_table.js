exports.up = function (knex) {
  return knex.schema.table("Countries", function (table) {
    table.string("continent"); 
  });
};

exports.down = function (knex) {
  return knex.schema.table("Countries", function (table) {
    table.dropColumn("continent");
  });
};
