exports.up = function (knex) {
  return knex.schema
    .createTable("Certificates", function (table) {
      table.increments("id").primary();
      table.date("date").notNullable();             
      table.string("img").notNullable();              
      table.boolean("isactive").notNullable().defaultTo(true); 
      table.text("title").notNullable();             
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("Certificates");
};
