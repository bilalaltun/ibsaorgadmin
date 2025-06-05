exports.up = function (knex) {
  return knex.schema

    .createTable("Menus", function (table) {
      table.increments("id").primary();
      table.string("title").notNullable();     
      table.string("url").notNullable();
      table.boolean("isactive").notNullable().defaultTo(true);
    })

    .createTable("Submenus", function (table) {
      table.increments("id").primary();
      table
        .integer("menu_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("Menus")
        .onDelete("CASCADE");
      table.string("title").notNullable();       
      table.string("url").notNullable();
      table.boolean("isactive").notNullable().defaultTo(true);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("Submenus")
    .dropTableIfExists("Menus");
};
