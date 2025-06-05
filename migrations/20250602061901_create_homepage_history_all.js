exports.up = function (knex) {
  return knex.schema
    .createTable("HomepageHistorySection", function (table) {
      table.increments("id").primary();
      table.string("section_key").notNullable().defaultTo("history");
      table.string("top_title").notNullable(); 
      table.string("main_title").notNullable();  
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })

    .createTable("HomepageHistorySectionItems", function (table) {
      table.increments("id").primary();
      table
        .integer("section_id")
        .unsigned()
        .references("id")
        .inTable("HomepageHistorySection")
        .onDelete("CASCADE");
      table.integer("item_index").notNullable();
      table.string("title").notNullable();
      table.text("history").notNullable();
      table.string("image_url").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.unique(["section_id", "item_index"]);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("HomepageHistorySectionItems")
    .dropTableIfExists("HomepageHistorySection");
};
