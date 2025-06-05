exports.up = function (knex) {
  return knex.schema.createTable("UploadedFiles", function (table) {
    table.increments("id").primary();

    table.string("file_name").notNullable();             
    table.string("firebase_url").notNullable();          
    table.string("mime_type").nullable();               
    table.bigInteger("file_size").nullable();          
    table.timestamp("uploaded_at").defaultTo(knex.fn.now());

    table.string("uploaded_by").nullable();               
    table.string("category").nullable();                 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("UploadedFiles");
};
