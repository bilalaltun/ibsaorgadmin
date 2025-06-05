exports.up = async function (knex) {
  await knex.schema.createTable("HomepageFacilitiesSection", function (table) {
    table.increments("id").primary();
    table.string("section_key").notNullable();
    table.string("title").notNullable();
    table.text("subtitle").notNullable();
    table.string("button").notNullable();
    table.string("button_link").notNullable();
    table.string("image").nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("HomepageFacilitiesSectionItems", function (table) {
    table.increments("id").primary();
    table
      .integer("facilities_id")
      .unsigned()
      .references("id")
      .inTable("HomepageFacilitiesSection")
      .onDelete("CASCADE");
    table.string("title").notNullable();
    table.text("description").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("HomepageFacilitiesSectionItems");
  await knex.schema.dropTableIfExists("HomepageFacilitiesSection");
};
