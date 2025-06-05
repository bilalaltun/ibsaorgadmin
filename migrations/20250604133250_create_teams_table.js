exports.up = function (knex) {
  return knex.schema.createTable("TeamMembers", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();            
    table.string("position").notNullable();            
    table.string("email").notNullable();           
    table.string("photo_url");                      
    table.string("flag_url");             
    table.boolean("isactive").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("TeamMembers");
};
