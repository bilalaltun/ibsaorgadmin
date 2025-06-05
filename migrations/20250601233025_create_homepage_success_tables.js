exports.up = function (knex) {
  return knex.schema
    .createTable("HomepageSuccessSection", function (table) {
      table.increments("id").primary();
      table.string("section_key").notNullable().defaultTo("success");
      table.string("slider_title", 255).notNullable(); 
      table.string("main_title", 255).notNullable();   
      table.text("description").notNullable();
    })

    .createTable("HomepageSuccessSectionItems", function (table) {
      table.increments("id").primary();
      table
        .integer("section_id")
        .unsigned()
        .references("id")
        .inTable("HomepageSuccessSection")
        .onDelete("CASCADE");
      table.integer("slider_index").notNullable();
      table.string("title", 255).notNullable();
      table.text("description").nullable();
      table.string("image_url", 500).nullable();

      table.unique(["section_id", "slider_index"]);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("HomepageSuccessSectionItems")
    .dropTableIfExists("HomepageSuccessSection");
};
