exports.up = function (knex) {
  return knex.schema
    .createTable("Regions", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();    
      table.string("title").notNullable();     
    })
    .createTable("RegionMembers", function (table) {
      table.increments("id").primary();
      table
        .integer("region_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("Regions")
        .onDelete("CASCADE");

      table.string("name").notNullable();        
      table.string("title").notNullable();       
      table.string("email");                     
      table.string("flag_url");                   
      table.boolean("isactive").defaultTo(true);

      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("RegionMembers")
    .dropTableIfExists("Regions");
};

