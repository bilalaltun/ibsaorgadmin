exports.up = async function(knex) {
  const exists = await knex.schema.hasTable("HomepageAboutSection");
  if (!exists) {
    return knex.schema.createTable("HomepageAboutSection", function(table) {
      table.increments("id").primary();
      table.string("title").notNullable();
      table.string("subtitle");
      table.string("image_url");
      table.timestamps(true, true);
    });
  }
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("HomepageAboutSection");
};
