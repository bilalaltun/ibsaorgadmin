exports.up = function (knex) {
  return knex.schema

    // Sayfa tablosu
    .createTable("CustomTeamPages", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.boolean("isactive").notNullable().defaultTo(true);
      table.timestamps(true, true);
    })

    // Üyeler tablosu
    .createTable("CustomTeamMembers", function (table) {
      table.increments("id").primary();
      table.integer("page_id").unsigned().references("id").inTable("CustomTeamPages").onDelete("CASCADE");
      table.string("name").notNullable();
      table.string("email").nullable();
      table.string("position").nullable();
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("CustomTeamMembers")
    .dropTableIfExists("CustomTeamPages");
};
