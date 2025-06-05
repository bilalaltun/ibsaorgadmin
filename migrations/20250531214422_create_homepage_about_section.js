// exports.up = function(knex) {
//   return knex.schema.createTable("HomepageAboutSection", function(table) {
//     table.increments("id").primary();
//     table.string("section_key").notNullable();
//     table.string("name").notNullable();
//     table.string("title");
//     table.text("description");
//     table.timestamps(true, true);
//   });
// };

// exports.down = function(knex) {
//   return knex.schema.dropTableIfExists("HomepageAboutSection");
// };


exports.seed = async function (knex) {
  await knex("HomepageAboutSection").del();

  await knex("HomepageAboutSection").insert({
    section_key: "about",
    name: "ABOUT US",
    title: "Always the Best Since 1976",
    description:
      "Founded in 1976 with woodworking production, Mızrak Makine continues its operations today in its factory located in Bursa Organized Industrial Zone — one of Turkey’s largest industrial hubs."
  });
};
