exports.up = function (knex) {
  return knex.schema.createTable("Partners", function (table) {
    table.increments("id").primary();
    table.string("url");             
    table.string("title").notNullable();
    table.boolean("isactive").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now()); 
});
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("Partners");
};
