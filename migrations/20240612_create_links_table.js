exports.up = function (knex) {
  return knex.schema.createTable("Links", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("link").notNullable();
    table.date("startDate").notNullable();
    table.date("endDate").notNullable();
    table.boolean("isactive").notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("Links");
}; 