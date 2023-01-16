/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("nasabah", tbl => {
    tbl.string("id").primary();
    tbl.string("nama" ).notNullable().unique();
    tbl.dateTime("tanggal_lahir").notNullable();
    tbl.string("alamat").notNullable();
    tbl.enum("status",["aktif","diblokir","ditutup"]);
    tbl.string("no_rekening")
    tbl.string("pin").notNullable();
    tbl.integer("saldo").notNullable();
    tbl.timestamps(true,true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("nasabah");
};
