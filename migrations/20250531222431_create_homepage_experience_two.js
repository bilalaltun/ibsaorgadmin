// exports.up = function(knex) {
//   return knex.schema.createTable("HomepageExperienceTwo", function(table) {
//     table.increments("id").primary();
//     table.string("section_key").notNullable();
//     table.string("global_title");
//     table.string("global_subtitle");
//     table.string("years_experience");
//     table.string("export_countries");
//     table.string("videolink");
//     table.timestamps(true, true);
//   });
// };

// exports.down = function(knex) {
//   return knex.schema.dropTableIfExists("HomepageExperienceTwo");
// };


exports.seed = async function(knex) {
  await knex("HomepageExperienceTwo").del();
  await knex("HomepageExperienceTwo").insert([
    {
      section_key: "experienceTwo",
      global_title: "From Turkey to the World",
      global_subtitle: "Across the Globe",
      years_experience: "Years of Experience",
      export_countries: "Export to Countries",
      videolink: "https://example.com/video_en",
    },
  ]);
};
