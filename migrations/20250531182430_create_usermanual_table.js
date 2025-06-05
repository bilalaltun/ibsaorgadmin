exports.up = function (knex) {
  return knex.schema

    .createTable("UserManuals", function (table) {
      table.increments("id").primary();
      table.string("cover_img").notNullable();
      table.text("title").notNullable();        
      table.string("file").notNullable();
      table.boolean("isactive").notNullable().defaultTo(true);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("UserManuals");
};
