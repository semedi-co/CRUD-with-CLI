/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("pendaftaran", t => {
    t.increments("id");
    t.string("nim", 10).notNullable();
    t.string("nama").notNullable();
    t.enum("prodi", ["IF", "TI", "SI", "RPL", "TE"]).notNullable();
    t.enum("jenis_kelamin", ["L", "P"]).notNullable();
    t.date("tanggal_lahir").notNullable();
    t.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("pendaftaran");
};
