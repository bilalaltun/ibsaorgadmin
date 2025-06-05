exports.up = function (knex) {
  return knex.schema.createTable("Countdowns", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();            
    table.string("icon_url").notNullable();         
    table.string("link");            
    table.string("date").notNullable();   
    table.boolean("isactive").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("Countdowns");
};