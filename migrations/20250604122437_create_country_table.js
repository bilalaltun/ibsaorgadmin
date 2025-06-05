exports.up = function (knex) {
  return knex.schema.createTable("Countries", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("federation_name").notNullable();
    table.string("directory");
    table.string("address");
    table.string("phone");
    table.string("email");
    table.boolean("isactive").notNullable().defaultTo(true);
    table.string("flag_url");             
    table.timestamp("created_at").defaultTo(knex.fn.now()); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("Countries");
};
