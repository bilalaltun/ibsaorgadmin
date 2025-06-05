exports.up = function (knex) {
  return knex.schema.createTable("Forms", function (table) {
    table.increments("id").primary();
    table.text("userinfo").notNullable(); 
    table.string("gsm").notNullable();    // phone number
    table.string("mail").notNullable(); 
    table.text("content").notNullable();
    table.timestamp("date").defaultTo(knex.fn.now()); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("Forms");
};
