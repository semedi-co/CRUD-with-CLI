/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("nasabah", t => {
    t.increments("id");
    t.string("nama").notNullable();
    t.datetime("tanggal_lahir").notNullable();
    t.text("alamat").notNullable();
    t.enum("status", ["aktif", "tidak aktif", "diblokir"]).notNullable();
    t.string("no_rekening",6).notNullable();
    t.string("pin").notNullable();
    t.integer("saldo").notNullable();
    t.timestamps(true, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable("nasabah");
};
