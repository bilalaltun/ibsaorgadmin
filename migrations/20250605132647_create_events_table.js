exports.up = function (knex) {
  return knex.schema.createTable("Events", function (table) {
    table.increments("id").primary();
    table.string("title", 255).notNullable();
    table.date("start_date").notNullable();
    table.date("end_date").notNullable();
    table.string("category", 100).notNullable();
    table.string("location", 255).notNullable();
    table.string("sanction_type", 100); 
    table.string("contact_email", 255);
    table.text("image_url");
    table.text("description");
    table.json("downloads"); 
    table.boolean("isactive").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("Events");
};
