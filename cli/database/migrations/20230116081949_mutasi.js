/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("mutasi", tbl =>{
    tbl.string("id").primary();
    tbl.string("pengirim_id");
    tbl.foreign("pengirim_id").references("id").inTable("nasabah").onDelete("CASCADE");
    tbl.string("penerima_id");
    tbl.foreign("penerima_id").references("id").inTable("nasabah").onDelete("CASCADE");
    tbl.enum("status",["berhasil","tidak berhasil"]);
    tbl.integer("jumlah");
    tbl.timestamps(true,true);
  }) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("mutasi");
};
