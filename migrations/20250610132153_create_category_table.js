exports.up = function (knex) {
  return knex.schema.createTable("Categories", function (table) {
    table.increments("id").primary();
    table.boolean("isactive").notNullable().defaultTo(true);
    table.text("title").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("Categories");
};
