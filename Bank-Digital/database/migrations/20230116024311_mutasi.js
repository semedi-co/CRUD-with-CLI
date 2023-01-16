/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("mutasi", t => {
    t.string("id").primary();
    t.string("pengirim_id").notNullable();
    t.string("penerima_id").notNullable();
    t.enum("status", ["masuk", "keluar"]).notNullable();
    t.integer("jumlah").notNullable();
    t.timestamps(true, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("mutasi");
};
