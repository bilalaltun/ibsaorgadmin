exports.up = function(knex) {
  return knex.schema
    .createTable("ContactFormSection", function(table) {
      table.increments("id").primary();
      table.string("section_key").notNullable().defaultTo("contact").unique();

      table.string("title").defaultTo("");
      table.text("description").defaultTo("");
      table.string("fullname").defaultTo("");
      table.string("email").defaultTo("");
      table.string("phone").defaultTo("");
      table.string("note").defaultTo("");

      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("ContactFormSection");
};

