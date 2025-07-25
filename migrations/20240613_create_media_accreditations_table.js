exports.up = function (knex) {
  return knex.schema.createTable("media_accreditations", function (table) {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.string("firstName").notNullable();
    table.string("lastName").notNullable();
    table.string("company").notNullable();
    table.string("city").notNullable();
    table.string("country").notNullable();
    table.string("email").notNullable();
    table.text("message").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("media_accreditations");
}; 