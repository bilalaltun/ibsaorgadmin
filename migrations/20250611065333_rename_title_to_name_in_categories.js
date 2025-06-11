// rename_title_to_name_in_categories.js

exports.up = function (knex) {
  return knex.schema.table("Categories", function (table) {
    table.renameColumn("title", "name");
  });
};

exports.down = function (knex) {
  return knex.schema.table("Categories", function (table) {
    table.renameColumn("name", "title");
  });
};
