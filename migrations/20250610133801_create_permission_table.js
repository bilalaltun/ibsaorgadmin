exports.up = async function (knex) {
  await knex.schema.createTable("Permissions", function (table) {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable()
      .references("id").inTable("Users")
      .onDelete("CASCADE");
    table.integer("category_id").unsigned().notNullable()
      .references("id").inTable("Categories")
      .onDelete("CASCADE");

    // Permissions: create, read, update, delete
    table.boolean("can_create").notNullable().defaultTo(false);
    table.boolean("can_read").notNullable().defaultTo(false);
    table.boolean("can_update").notNullable().defaultTo(false);
    table.boolean("can_delete").notNullable().defaultTo(false);

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.unique(["user_id", "category_id"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("Permissions");
};
