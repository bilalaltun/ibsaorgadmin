export async function up(knex) {
  await knex.schema.createTable("HomepageVideoSection", (table) => {
    table.increments("id").primary();
    table.string("section_key").defaultTo("video");
    table.string("title").nullable();          
    table.string("youtube_link").nullable();   
  });

  await knex.schema.createTable("HomepageVideoSectionItems", (table) => {
    table.increments("id").primary();
    table.integer("video_id").unsigned().references("id").inTable("HomepageVideoSection").onDelete("CASCADE");
    table.string("before").nullable();   
    table.string("text").nullable();     
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("HomepageVideoSectionItems");
  await knex.schema.dropTableIfExists("HomepageVideoSection");
}
