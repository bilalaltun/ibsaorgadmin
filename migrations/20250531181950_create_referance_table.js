exports.up = function (knex) {
  return knex.schema
    .createTable("Referances", function (table) {
      table.increments("id").primary();
      table.string("img").notNullable();
      table.string("name").notNullable();             
      table.boolean("isactive").notNullable().defaultTo(true);
      table.boolean("show_at_home").notNullable().defaultTo(false);
      table.timestamps(true, true); 
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("Referances");
};
