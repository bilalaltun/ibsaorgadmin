exports.up = function (knex) {
  return knex.schema
    .createTable("SportsCommitteeMemberContacts", function (table) {
      table.increments("id").primary();
      table.json("contact_info").nullable(); 
      table.timestamps(true, true);
    })
    .then(function () {
      return knex.schema.createTable("SportsCommitteeMembers", function (table) {
        table.increments("id").primary();

        table.string("title").notNullable();         
        table.string("description").notNullable();    
        table.string("full_name").notNullable();      
        table.string("country").notNullable();        
        table.string("role").notNullable();

        table
          .integer("contact_id")
          .unsigned()
          .references("id")
          .inTable("SportsCommitteeMemberContacts")
          .onDelete("SET NULL"); 

        table.boolean("isactive").defaultTo(true); 
        table.timestamp("created_at").defaultTo(knex.fn.now());
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("BlindFootballCommitteeMembers")
    .then(() => {
      return knex.schema.dropTableIfExists("SportsCommitteeMemberContacts");
    });
};
