exports.up = function (knex) {
  return knex.schema.createTable("Blogs", function (table) {
    table.increments("id").primary();
    table.string("link").notNullable();
    table.string("thumbnail");
    table.date("date");
    table.string("author");
    table.string("title");
    table.string("details");
    table.text("content");
    table.string("category");
    table.boolean("isactive").defaultTo(true);
    table.boolean("show_at_home").defaultTo(false);
  })
  .then(() => {
    return knex.schema.createTable("BlogTags", function (table) {
      table.increments("id").primary();
      table.integer("blog_id").unsigned().notNullable()
        .references("id").inTable("Blogs").onDelete("CASCADE");
      table.string("tag").notNullable();
    });
  });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("BlogTags")
    .then(() => knex.schema.dropTableIfExists("Blogs"));
};
