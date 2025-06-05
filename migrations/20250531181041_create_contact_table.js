exports.up = function (knex) {
  return knex.schema
    .createTable("Contacts", function (table) {
      table.increments("id").primary();
      table.string("gmail").notNullable();
      table.text("title").notNullable();     
      table.text("address").notNullable();   
      table.boolean("isactive").notNullable().defaultTo(true);
      table.timestamps(true, true);
    })

    .createTable("ContactPhones", function (table) {
      table.increments("id").primary();
      table
        .integer("contact_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("Contacts")
        .onDelete("CASCADE");

      table.string("phone_number").notNullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("ContactPhones")
    .dropTableIfExists("Contacts");
};
