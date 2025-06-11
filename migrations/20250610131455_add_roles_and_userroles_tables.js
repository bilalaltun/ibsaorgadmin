// 20250610_add_roles_and_userroles_tables.js

exports.up = async function (knex) {
  await knex.schema.createTable("Roles", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable().unique(); // "admin", "user" 
    table.timestamp("created_at").defaultTo(knex.fn.now()); 
    table.boolean("isactive").notNullable().defaultTo(true);
  });

  await knex.schema.createTable("UserRoles", function (table) {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable()
      .references("id").inTable("Users")
      .onDelete("CASCADE");
    table.integer("role_id").unsigned().notNullable()
      .references("id").inTable("Roles")
      .onDelete("CASCADE");
    table.unique(["user_id", "role_id"]); 
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("UserRoles");
  await knex.schema.dropTableIfExists("Roles");
};
