export async function up(knex) {
  await knex.schema.createTable("HomepageFooterSection", (table) => {
    table.increments("id").primary();
    table.string("section_key").notNullable();

    table.string("contact_title");
    table.string("email");
    table.string("logo_slogan");
    table.string("address_title");
    table.string("address_link");
    table.string("phone");
  });

  await knex.schema.createTable("HomepageFooterGallery", (table) => {
    table.increments("id").primary();
    table.integer("footer_id").unsigned().references("id").inTable("HomepageFooterSection").onDelete("CASCADE");
    table.string("image_url");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("HomepageFooterGallery");
  await knex.schema.dropTableIfExists("HomepageFooterSection");
}
