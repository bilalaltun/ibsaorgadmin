exports.up = function (knex) {
  return knex.schema

    .createTable("SiteTags", function (table) {
      table.increments("id").primary();
      table.string("title").notNullable();            
      table.date("date").defaultTo(knex.fn.now());
      table.boolean("isactive").notNullable().defaultTo(true);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("SiteTags");
};
