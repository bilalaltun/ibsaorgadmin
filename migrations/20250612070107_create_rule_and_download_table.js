exports.up = function (knex) {
  return knex.schema.createTable("RoleAndDownloads", function (table) {
    table.increments("id").primary();
    table.string("title").notNullable(); 
    table.text("description").nullable();
    table.enum("type", ["rule", "download"]).notNullable(); // "rule" ve ya "download"
    table.string("file_url").notNullable(); 
    table.date("created_at").defaultTo(knex.fn.now());
    table.boolean("isactive").notNullable().defaultTo(true);
  });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("RoleAndDownloads");
};

