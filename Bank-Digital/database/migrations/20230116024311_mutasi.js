/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("mutasi", t => {
    t.string("id").primary();
    t.string("nasabah_id").notNullable();
    t.foreign("nasabah_id").references("id").inTable("nasabah");
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
